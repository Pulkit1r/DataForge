"""
FastAPI backend for The Memory Cliff & Fast Weights.

Serves:
  POST /predict             — Live vector associative memory inference for all 3 models
  GET  /precomputed-curve   — Precomputed capacity curves across N in [1, 96]
"""

import sys
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add current dir to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import associative_engine as ae

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Associative Memory & Fast Weights API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Precomputed Curve Cache ──────────────────────────────────────────────────
# Computed once at backend startup over 5 random seeds to serve the static capacity
# curve (/precomputed-curve) instantly, decoupling chart rendering from live user slider latency.
N_CURVE_VALUES = [1, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96]
CURVE_CACHE = ae.compute_capacity_curve(N_CURVE_VALUES, d=32, n_seeds=5)


# ── Schemas ──────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    n_pairs: int                        # fact load: 1 to 96
    seed: Optional[int] = None          # reproducibility
    remove_index: Optional[int] = None  # surgery: corrupt key
    corrupt_index: Optional[int] = None # surgery: corrupt value


class ModelEvaluation(BaseModel):
    name: str
    mechanism: str
    role: str
    labeling: str
    accuracy: float
    correct_per_fact: List[bool]
    memory_footprint: int              # floats stored
    memory_type: str


class PredictResponse(BaseModel):
    n_facts: int
    d_capacity: int
    query_order: List[int]
    full_attention: ModelEvaluation
    additive_fast_weight: ModelEvaluation
    deltanet: ModelEvaluation
    state_matrix: List[List[float]]              # 32x32 additive state
    state_matrices_steps: List[List[List[float]]] # state evolution


# ── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/")
@app.get("/health")
def health_check():
    """Health check for deployment verification and load balancers."""
    return {
        "status": "healthy",
        "service": "The Memory Cliff & Fast Weights API",
        "version": "1.0.0",
    }


@app.post("/predict", response_model=PredictResponse)
@app.post("/api/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    """
    Live computation across all three models:
    1. Full Attention (Baseline)
    2. Additive Fast-Weight (BDH Analogue)
    3. DeltaNet (Corrective Delta Rule Contrast)
    """
    n = max(1, min(req.n_pairs, 96))
    d = ae.D_KEY

    keys, values, query_order, store_keys, store_values = ae.generate_synthetic_facts(
        n_facts=n,
        d=d,
        seed=req.seed if req.seed is not None else 42,
        corrupt_index=req.corrupt_index,
        remove_index=req.remove_index,
    )

    # 1. Full Attention
    correct_a, acc_a, kv_size = ae.run_full_attention(keys, values, query_order, store_keys, store_values)

    # 2. Additive Fast-Weight (BDH Analogue)
    correct_b, acc_b, state_size_b, W_b, step_states = ae.run_additive_fast_weight(keys, values, query_order, store_keys, store_values)

    # 3. DeltaNet (Corrective Contrast)
    correct_c, acc_c, state_size_c = ae.run_deltanet(keys, values, query_order, store_keys, store_values)

    return PredictResponse(
        n_facts=n,
        d_capacity=d,
        query_order=query_order,
        full_attention=ModelEvaluation(
            name="Full Attention",
            mechanism="Grows explicit KV cache: O(N * d)",
            role="Ground-truth baseline",
            labeling="Baseline (Always 100% in context)",
            accuracy=acc_a,
            correct_per_fact=correct_a,
            memory_footprint=kv_size,
            memory_type="Dynamic KV Cache (Unbounded)",
        ),
        additive_fast_weight=ModelEvaluation(
            name="Fixed Memory (Additive)",
            mechanism="W_t = W_{t-1} + v_t k_t^T, y = W q",
            role="BDH Hebbian Analogue",
            labeling="Mechanistic analogue of BDH's Hebbian update — not an official BDH model",
            accuracy=acc_b,
            correct_per_fact=correct_b,
            memory_footprint=state_size_b,
            memory_type="Constant 32×32 Matrix (1,024 floats)",
        ),
        deltanet=ModelEvaluation(
            name="DeltaNet (Delta Rule)",
            mechanism="W_t = W_{t-1} + beta * (v_t - W_{t-1} k_t) k_t^T",
            role="Corrective Contrast",
            labeling="DeltaNet corrective update — separate architecture, not BDH",
            accuracy=acc_c,
            correct_per_fact=correct_c,
            memory_footprint=state_size_c,
            memory_type="Constant 32×32 Matrix (1,024 floats)",
        ),
        state_matrix=W_b,
        state_matrices_steps=step_states,
    )


@app.get("/precomputed-curve")
@app.get("/api/precomputed-curve")
def precomputed_curve():
    """Returns capacity curve across N in [1, 96] with d=32 threshold."""
    return CURVE_CACHE
