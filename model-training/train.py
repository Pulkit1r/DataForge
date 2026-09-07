"""
Training script for The Memory Cliff.

Trains both Model A (Transformer) and Model B (DeltaNet) on the MQAR
associative-recall task with a mixture of N values, then evaluates
accuracy vs. N and saves:
    checkpoints/model_a.pt
    checkpoints/model_b.pt
    checkpoints/precomputed_curve.json
"""

import json
import os
import random
import sys
import time
from pathlib import Path

# Force UTF-8 on standard outputs for Windows terminals
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import torch
import torch.nn.functional as F

# ── Local imports ────────────────────────────────────────────────────────────
from data_generation import generate_batch, TOTAL_VOCAB_SIZE
from model_transformer import TransformerModel
from model_deltanet import DeltaNetModel

# ── Hyperparameters ──────────────────────────────────────────────────────────
D_MODEL     = 64
N_HEADS     = 2        # Transformer only (head_dim = 32)
D_FF        = 128
N_LAYERS    = 2
D_STATE     = 32       # DeltaNet state matrix is 32×32
MAX_SEQ_LEN = 260      # 4*64 + 1 = 257, rounded up
VOCAB       = TOTAL_VOCAB_SIZE   # 130

BATCH_SIZE  = 32
LR          = 1e-3
N_MIN, N_MAX = 4, 64
N_STEPS     = 1000     # 1000 steps converges well and completes quickly on CPU

# N values at which we evaluate accuracy (the slider range)
EVAL_N_VALUES = [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64]
EVAL_BATCHES  = 6       # 6 * 32 = 192 seqs per N, high statistical confidence

CHECKPOINT_DIR = Path(__file__).parent / "checkpoints"

# ─────────────────────────────────────────────────────────────────────────────

def get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def train_model(model, name: str, device: torch.device, n_steps: int):
    """Train *model* on mixed-N MQAR data for *n_steps* gradient steps."""
    model = model.to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=n_steps)

    n_params = sum(p.numel() for p in model.parameters())
    print(f"\n{'='*60}", flush=True)
    print(f"Training {name}", flush=True)
    print(f"{'='*60}", flush=True)
    print(f"Parameters : {n_params:,}", flush=True)
    print(f"Device     : {device}", flush=True)
    print(f"Steps      : {n_steps}   Batch size : {BATCH_SIZE}", flush=True)
    print(flush=True)

    model.train()
    running_loss = 0.0
    log_every    = 100
    t0 = time.time()

    for step in range(1, n_steps + 1):
        n_pairs = random.randint(N_MIN, N_MAX)

        inp, tgt, mask = generate_batch(BATCH_SIZE, n_pairs, device=device)

        logits = model(inp)

        # Cross-entropy only at answer positions
        loss = F.cross_entropy(logits[mask], tgt[mask])

        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()

        running_loss += loss.item()

        if step % log_every == 0:
            avg = running_loss / log_every
            elapsed = time.time() - t0
            lr_now = scheduler.get_last_lr()[0]
            print(f"  step {step:5d}/{n_steps} | loss {avg:.4f} | "
                  f"lr {lr_now:.2e} | {elapsed:.1f}s", flush=True)
            running_loss = 0.0

    print(f"  [OK] {name} done in {time.time()-t0:.1f}s", flush=True)
    return model


def evaluate_model(model, name: str, device: torch.device):
    """Evaluate accuracy at each N in EVAL_N_VALUES.  Returns {N: acc}."""
    model.eval()
    results = {}

    print(f"\n{'='*60}", flush=True)
    print(f"Evaluating {name}", flush=True)
    print(f"{'='*60}", flush=True)

    with torch.no_grad():
        for n in EVAL_N_VALUES:
            correct = total = 0
            for _ in range(EVAL_BATCHES):
                inp, tgt, mask = generate_batch(BATCH_SIZE, n, device=device)

                logits = model(inp)
                preds  = logits.argmax(dim=-1)
                correct += (preds[mask] == tgt[mask]).sum().item()
                total   += mask.sum().item()

            acc = correct / total
            results[n] = acc
            bar = "#" * int(acc * 40) + "-" * (40 - int(acc * 40))
            print(f"  N={n:3d}  [{bar}]  {acc:.4f}", flush=True)

    model.train()
    return results


# ─────────────────────────────────────────────────────────────────────────────

def main():
    device = get_device()
    print(f"Device: {device}", flush=True)
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

    # ── Model A — Transformer ────────────────────────────────────────────
    model_a = TransformerModel(
        vocab_size=VOCAB, d_model=D_MODEL, n_heads=N_HEADS,
        d_ff=D_FF, n_layers=N_LAYERS, max_seq_len=MAX_SEQ_LEN,
    )
    model_a = train_model(model_a, "Model A (Transformer)", device, n_steps=N_STEPS)
    results_a = evaluate_model(model_a, "Model A (Transformer)", device)
    torch.save(model_a.state_dict(), CHECKPOINT_DIR / "model_a.pt")
    print(f"  Saved {CHECKPOINT_DIR / 'model_a.pt'}", flush=True)

    # ── Model B — DeltaNet ───────────────────────────────────────────────
    model_b = DeltaNetModel(
        vocab_size=VOCAB, d_model=D_MODEL, d_state=D_STATE,
        d_ff=D_FF, n_layers=N_LAYERS, max_seq_len=MAX_SEQ_LEN,
    )
    model_b = train_model(model_b, "Model B (DeltaNet)", device, n_steps=N_STEPS)
    results_b = evaluate_model(model_b, "Model B (DeltaNet)", device)
    torch.save(model_b.state_dict(), CHECKPOINT_DIR / "model_b.pt")
    print(f"  Saved {CHECKPOINT_DIR / 'model_b.pt'}", flush=True)

    # ── Precomputed accuracy curve ───────────────────────────────────────
    curve = {
        "n_values":         EVAL_N_VALUES,
        "model_a_accuracy": [results_a[n] for n in EVAL_N_VALUES],
        "model_b_accuracy": [results_b[n] for n in EVAL_N_VALUES],
        "metadata": {
            "model_a": {
                "name":        "Transformer (Full Attention)",
                "d_model":     D_MODEL,
                "n_heads":     N_HEADS,
                "n_layers":    N_LAYERS,
                "memory_type": "KV cache (grows with sequence length)",
            },
            "model_b": {
                "name":        "DeltaNet (Linear Attention)",
                "d_model":     D_MODEL,
                "d_state":     D_STATE,
                "n_layers":    N_LAYERS,
                "memory_type": f"Fixed {D_STATE}x{D_STATE} state matrix",
                "state_size":  D_STATE * D_STATE * N_LAYERS,
            },
        },
    }
    with open(CHECKPOINT_DIR / "precomputed_curve.json", "w", encoding="utf-8") as f:
        json.dump(curve, f, indent=2)

    # ── Summary ──────────────────────────────────────────────────────────
    print(f"\n{'='*60}", flush=True)
    print("ACCURACY vs N - REAL TRAINING EVALUATION SUMMARY", flush=True)
    print(f"{'='*60}", flush=True)
    print(f"{'N':>4}  {'Transformer':>14}  {'DeltaNet':>14}  {'Diff':>10}", flush=True)
    print(f"{'-'*4}  {'-'*14}  {'-'*14}  {'-'*10}", flush=True)
    for n in EVAL_N_VALUES:
        a, b = results_a[n], results_b[n]
        flag = " [CLIFF]" if (a - b) > 0.10 else ""
        print(f"{n:4d}  {a:14.4f}  {b:14.4f}  {a-b:+10.4f}{flag}", flush=True)

    seq64 = 4 * 64  # input length for N=64
    print(f"\nModel A KV-cache size at N=64: {model_a.get_kv_cache_size(seq64):,d} floats (grows with N)", flush=True)
    print(f"Model B state size (constant): {model_b.get_state_size():,d} floats (fixed)", flush=True)
    print(f"\nCheckpoints + curve saved to {CHECKPOINT_DIR.resolve()}", flush=True)


if __name__ == "__main__":
    main()
