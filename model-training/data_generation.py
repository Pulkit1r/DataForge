"""
Vectorized and accelerated MQAR (Multi-Query Associative Recall) data generation.
Following the setup from Arora et al.'s "Zoology" paper.
"""

import random as _random
from typing import Dict, Optional, Tuple
import torch

PAD_TOKEN = 0
QUERY_MARKER = 1
VOCAB_OFFSET = 2           # Regular tokens start at ID 2
VOCAB_SIZE = 128           # Number of regular tokens (IDs 2..129)
TOTAL_VOCAB_SIZE = VOCAB_SIZE + VOCAB_OFFSET   # 130


def sequence_length(n_pairs: int) -> int:
    """Total sequence length for n_pairs key-value associations."""
    return 4 * n_pairs + 1


def generate_batch(
    batch_size: int,
    n_pairs: int,
    vocab_size: int = VOCAB_SIZE,
    device: str = "cpu",
) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    """Generate a batch of MQAR sequences for training (fully vectorized)."""
    seq_len = sequence_length(n_pairs)
    sequences = torch.empty((batch_size, seq_len), dtype=torch.long, device=device)

    # 1. Random noise to sort for sampling keys without replacement per batch row
    rand_keys = torch.rand(batch_size, vocab_size, device=device)
    keys = torch.argsort(rand_keys, dim=1)[:, :n_pairs] + VOCAB_OFFSET  # (B, N)

    # 2. Values with replacement
    values = torch.randint(VOCAB_OFFSET, VOCAB_OFFSET + vocab_size, (batch_size, n_pairs), device=device)

    # 3. Interleave keys and values into pair section
    sequences[:, 0:2 * n_pairs:2] = keys
    sequences[:, 1:2 * n_pairs:2] = values

    # 4. Query marker
    sequences[:, 2 * n_pairs] = QUERY_MARKER

    # 5. Shuffled query section
    rand_queries = torch.rand(batch_size, n_pairs, device=device)
    query_perm = torch.argsort(rand_queries, dim=1)  # (B, N)

    shuffled_keys = torch.gather(keys, 1, query_perm)
    shuffled_values = torch.gather(values, 1, query_perm)

    sequences[:, (2 * n_pairs + 1)::2] = shuffled_keys
    sequences[:, (2 * n_pairs + 2)::2] = shuffled_values

    # Autoregressive shift
    input_tokens = sequences[:, :-1].contiguous()
    target_tokens = sequences[:, 1:].contiguous()

    # Loss mask: only answer positions in target_tokens
    loss_mask = torch.zeros((batch_size, seq_len - 1), dtype=torch.bool, device=device)
    answer_positions = torch.arange(2 * n_pairs + 1, seq_len - 1, 2, device=device)
    loss_mask[:, answer_positions] = True

    return input_tokens, target_tokens, loss_mask


def generate_sequence_with_metadata(
    n_pairs: int,
    vocab_size: int = VOCAB_SIZE,
    seed: Optional[int] = None,
    remove_index: Optional[int] = None,
    corrupt_index: Optional[int] = None,
) -> Dict:
    """Generate one MQAR sequence with full metadata for the frontend."""
    if seed is not None:
        torch.manual_seed(seed)
        _random.seed(seed)

    keys = (torch.randperm(vocab_size)[:n_pairs] + VOCAB_OFFSET).tolist()
    values = (torch.randint(VOCAB_OFFSET, VOCAB_OFFSET + vocab_size, (n_pairs,))).tolist()

    original_pairs = [{"key": k, "value": v} for k, v in zip(keys, values)]

    mod_keys = list(keys)
    mod_values = list(values)

    if remove_index is not None and 0 <= remove_index < n_pairs:
        used = set(keys)
        new_key = VOCAB_OFFSET
        while new_key in used:
            new_key += 1
        mod_keys[remove_index] = new_key
        mod_values[remove_index] = _random.randint(VOCAB_OFFSET, VOCAB_OFFSET + vocab_size - 1)

    if corrupt_index is not None and 0 <= corrupt_index < n_pairs:
        old_v = mod_values[corrupt_index]
        new_v = old_v
        while new_v == old_v:
            new_v = _random.randint(VOCAB_OFFSET, VOCAB_OFFSET + vocab_size - 1)
        mod_values[corrupt_index] = new_v

    seq_len = sequence_length(n_pairs)
    sequence = [0] * seq_len

    for i in range(n_pairs):
        sequence[2 * i] = mod_keys[i]
        sequence[2 * i + 1] = mod_values[i]

    sequence[2 * n_pairs] = QUERY_MARKER

    query_order = list(range(n_pairs))
    _random.shuffle(query_order)

    query_keys = []
    answer_values = []
    for i, qi in enumerate(query_order):
        sequence[2 * n_pairs + 1 + 2 * i] = keys[qi]
        sequence[2 * n_pairs + 1 + 2 * i + 1] = values[qi]
        query_keys.append(keys[qi])
        answer_values.append(values[qi])

    input_tokens = torch.tensor(sequence[:-1], dtype=torch.long).unsqueeze(0)
    target_tokens = torch.tensor(sequence[1:], dtype=torch.long).unsqueeze(0)
    loss_mask = torch.zeros(1, seq_len - 1, dtype=torch.bool)
    for i in range(n_pairs):
        loss_mask[0, 2 * n_pairs + 1 + 2 * i] = True

    return {
        "original_pairs": original_pairs,
        "modified_pairs": [{"key": k, "value": v} for k, v in zip(mod_keys, mod_values)],
        "full_sequence": sequence,
        "query_order": query_order,
        "query_keys": query_keys,
        "answer_values": answer_values,
        "input_tokens": input_tokens,
        "target_tokens": target_tokens,
        "loss_mask": loss_mask,
        "n_pairs": n_pairs,
    }
