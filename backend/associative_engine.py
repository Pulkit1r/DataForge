"""
Associative Memory and Fast Weights Engine.

Implements three models for key-value associative retrieval:
1. Full Attention (Exact KV Cache baseline)
2. Fixed Memory (Additive Fast-Weight / Hebbian Analogue of BDH): W_t = W_{t-1} + v_t k_t^T
3. DeltaNet (Corrective Delta Rule): W_t = W_{t-1} + beta * (v_t - W_{t-1} k_t) k_t^T

All math is computed directly in PyTorch using real vector associative retrieval.
"""

from typing import Dict, List, Optional, Tuple
import torch
import torch.nn.functional as F

D_KEY = 32
BETA_DEFAULT = 0.5  # DeltaNet learning rate for corrective update


def generate_synthetic_facts(
    n_facts: int,
    d: int = D_KEY,
    seed: Optional[int] = None,
    corrupt_index: Optional[int] = None,
    remove_index: Optional[int] = None,
) -> Tuple[torch.Tensor, torch.Tensor, List[int], torch.Tensor, torch.Tensor]:
    """
    Generate normalized near-orthogonal key vectors and random value vectors.
    Returns:
        keys: (n_facts, d) - Ground truth query keys (L2 normalized)
        values: (n_facts, d) - Ground truth target values (L2 normalized)
        query_order: list of indices queried (deterministic across baseline & surgery)
        store_keys: (n_stored, d) - Keys written into memory / KV cache
        store_values: (n_stored, d) - Values written into memory / KV cache
    """
    gen = torch.Generator()
    if seed is not None:
        gen.manual_seed(seed)

    # 1. Base keys & values (L2 normalized unit vectors)
    raw_keys = torch.randn(n_facts, d, generator=gen)
    keys = F.normalize(raw_keys, p=2, dim=-1)

    raw_values = torch.randn(n_facts, d, generator=gen)
    values = F.normalize(raw_values, p=2, dim=-1)

    # 2. Query permutation order generated BEFORE any surgery modification
    # This guarantees that query_order is 100% identical between baseline and surgery calls
    query_order = torch.randperm(n_facts, generator=gen).tolist()

    # 3. Storage sets initialized from base ground truth
    store_keys = keys.clone()
    store_values = values.clone()

    # Demonstration surgery: Corrupt fact value written into memory
    # The stored value becomes corrupted, but query targets remain original ground-truth values
    if corrupt_index is not None and 0 <= corrupt_index < n_facts:
        raw_corrupt = torch.randn(1, d, generator=gen)
        store_values[corrupt_index] = F.normalize(raw_corrupt, p=2, dim=-1)

    # Demonstration surgery: Remove key/value pair entirely from memory storage
    # The fact is never learned, but is still queried to test omission/interference
    if remove_index is not None and 0 <= remove_index < n_facts:
        keep_mask = torch.ones(n_facts, dtype=torch.bool)
        keep_mask[remove_index] = False
        store_keys = store_keys[keep_mask]
        store_values = store_values[keep_mask]

    return keys, values, query_order, store_keys, store_values


def run_full_attention(
    keys: torch.Tensor,
    values: torch.Tensor,
    query_order: List[int],
    store_keys: Optional[torch.Tensor] = None,
    store_values: Optional[torch.Tensor] = None,
) -> Tuple[List[bool], float, int]:
    """
    Full Attention baseline (KV Cache).
    Stores all past keys and values explicitly.
    Retrieves via exact dot-product softmax lookup.
    """
    if store_keys is None:
        store_keys = keys
    if store_values is None:
        store_values = values

    n_facts, d = keys.shape
    queries = keys[query_order]  # (n_facts, d)
    
    if store_keys.shape[0] == 0:
        retrieved = torch.zeros_like(queries)
    else:
        # Cosine similarities between queries and stored keys in the KV cache.
        # Scaled by an inverse temperature factor (15.0) to sharpen the softmax distribution,
        # emulating crisp dictionary-like associative retrieval in full attention.
        scores = torch.matmul(queries, store_keys.T) * 15.0
        attn_weights = F.softmax(scores, dim=-1)
        retrieved = torch.matmul(attn_weights, store_values)  # (n_facts, d)
    
    # Check cosine similarity between retrieved vector and ground-truth target
    target_values = values[query_order]
    sims = (retrieved * target_values).sum(dim=-1)
    
    # Exact match criterion: cosine similarity > 0.90 reflects sharp nearest-neighbor retrieval.
    correct_per_fact = (sims > 0.90).tolist()
    accuracy = sum(correct_per_fact) / n_facts if n_facts > 0 else 1.0
    kv_cache_size = 2 * store_keys.shape[0] * d  # K and V vectors stored
    
    return correct_per_fact, accuracy, kv_cache_size


def run_additive_fast_weight(
    keys: torch.Tensor,
    values: torch.Tensor,
    query_order: List[int],
    store_keys: Optional[torch.Tensor] = None,
    store_values: Optional[torch.Tensor] = None,
) -> Tuple[List[bool], float, int, List[List[float]], List[List[List[float]]]]:
    """
    Fixed Memory: Additive Fast-Weight / Hebbian Analogue.
    W_t = W_{t-1} + v_t (k_t)^T
    Readout: y = W_N q
    """
    if store_keys is None:
        store_keys = keys
    if store_values is None:
        store_values = values

    n_facts, d = keys.shape
    n_stored = store_keys.shape[0]
    W = torch.zeros(d, d)
    step_states = []

    for t in range(n_stored):
        k = store_keys[t].unsqueeze(1)    # (d, 1)
        v = store_values[t].unsqueeze(0)  # (1, d)
        # Outer-product write: W += k * v^T writes correlation between key and target value.
        # Querying with q via q @ W yields sum_i (q^T k_i) v_i.
        W = W + torch.matmul(k, v)  # (d, d)
        # Checkpoint state snapshots across training for the StateMicroscope heatmap
        if t < 16 or t == n_stored - 1 or (t + 1) % max(1, n_stored // 8) == 0:
            step_states.append(W.clone().tolist())

    if len(step_states) == 0:
        step_states.append(W.clone().tolist())

    queries = keys[query_order]  # (n_facts, d)
    # Linear readout: y = q @ W -> (n_facts, d)
    retrieved = torch.matmul(queries, W)
    retrieved = F.normalize(retrieved, p=2, dim=-1)

    target_values = values[query_order]
    sims = (retrieved * target_values).sum(dim=-1)

    # Success threshold: cosine similarity > 0.70 indicates high directional fidelity.
    # In continuous linear associative memories, random unit vectors exhibit minor non-zero
    # cross-correlations even when N <= d, so 0.70 reliably separates true recall from noise.
    correct_per_fact = (sims > 0.70).tolist()
    accuracy = sum(correct_per_fact) / n_facts if n_facts > 0 else 0.0
    state_size = d * d  # Fixed 32x32 = 1024 floats

    return correct_per_fact, accuracy, state_size, W.tolist(), step_states


def run_deltanet(
    keys: torch.Tensor,
    values: torch.Tensor,
    query_order: List[int],
    store_keys: Optional[torch.Tensor] = None,
    store_values: Optional[torch.Tensor] = None,
    beta: float = BETA_DEFAULT,
) -> Tuple[List[bool], float, int]:
    """
    DeltaNet: Corrective Delta Rule.
    W_t = W_{t-1} + beta * (v_t - W_{t-1} k_t) k_t^T
    """
    if store_keys is None:
        store_keys = keys
    if store_values is None:
        store_values = values

    n_facts, d = keys.shape
    n_stored = store_keys.shape[0]
    W = torch.zeros(d, d)

    for t in range(n_stored):
        k = store_keys[t].unsqueeze(1)    # (d, 1)
        v = store_values[t].unsqueeze(0)  # (1, d)
        
        # Current prediction from existing memory: k^T * W
        pred_v = torch.matmul(k.T, W)  # (1, d)
        # Residual error: difference between target value and current retrieval
        error = v - pred_v             # (1, d)
        
        # Subtractive corrective update: subtracts erroneous prediction cross-talk
        # before binding the new key-value pair, dampening collision interference.
        W = W + beta * torch.matmul(k, error)

    queries = keys[query_order]
    retrieved = torch.matmul(queries, W)
    retrieved = F.normalize(retrieved, p=2, dim=-1)

    target_values = values[query_order]
    sims = (retrieved * target_values).sum(dim=-1)

    correct_per_fact = (sims > 0.70).tolist()
    accuracy = sum(correct_per_fact) / n_facts if n_facts > 0 else 0.0
    state_size = d * d

    return correct_per_fact, accuracy, state_size


def compute_capacity_curve(
    n_values: List[int],
    d: int = D_KEY,
    n_seeds: int = 5,
) -> Dict:
    """
    Precompute accuracy across n_values averaged over multiple seeds.
    Demonstrates the exact collapse curve once N exceeds d=32.
    """
    full_attn_accs = []
    additive_accs = []
    deltanet_accs = []

    for n in n_values:
        a_sum = 0.0
        b_sum = 0.0
        c_sum = 0.0
        for s in range(n_seeds):
            keys, vals, q_order, store_k, store_v = generate_synthetic_facts(n, d=d, seed=1000 + s * 37 + n)
            _, acc_a, _ = run_full_attention(keys, vals, q_order, store_k, store_v)
            _, acc_b, _, _, _ = run_additive_fast_weight(keys, vals, q_order, store_k, store_v)
            _, acc_c, _ = run_deltanet(keys, vals, q_order, store_k, store_v)
            a_sum += acc_a
            b_sum += acc_b
            c_sum += acc_c

        full_attn_accs.append(round(a_sum / n_seeds, 4))
        additive_accs.append(round(b_sum / n_seeds, 4))
        deltanet_accs.append(round(c_sum / n_seeds, 4))

    return {
        "n_values": n_values,
        "d_capacity": d,
        "full_attention_accuracy": full_attn_accs,
        "additive_fast_weight_accuracy": additive_accs,
        "deltanet_accuracy": deltanet_accs,
    }
