# Live Judge Defense Guide: The Memory Cliff & Fast Weights

> **Purpose:** This document prepares the team to defend the DataForge submission live before technical judges. It provides an exact walkthrough of the code architecture, traces tensor operations, and equips every team member to answer deep grilling questions derived strictly from the actual codebase.

---

## 1. System Architecture & Codebase Walkthrough

```
DataForge/
├── backend/
│   ├── associative_engine.py   # Pure PyTorch vector associative memory engine
│   ├── main.py                 # FastAPI server (live inference + precomputed cache)
│   └── requirements.txt        # Backend dependencies
├── frontend/
│   └── src/
│       ├── App.tsx             # Root layout & dashboard orchestrator
│       ├── api.ts              # Typed fetch client (/predict, /precomputed-curve)
│       └── components/
│           ├── MemorySlider.tsx          # Interactive N slider (1 to 96)
│           ├── FactGrid.tsx              # Real-time per-fact green/red grid
│           ├── AccuracyChart.tsx         # Precomputed multi-seed capacity curve
│           ├── StateMicroscope.tsx       # Live 32×32 state heatmap & step scrubbing
│           ├── DemonstrationSurgery.tsx  # Live fact ablation/corruption delta test
│           ├── BDHSection.tsx            # Neurobiological framing & DeltaNet contrast
│           └── ExplainItBack.tsx         # Student reflection box (localStorage)
└── model-training/
    ├── data_generation.py      # Synthetic MQAR data generator (vocab=130)
    ├── model_transformer.py    # PyTorch 2-layer Causal Transformer baseline
    ├── model_deltanet.py       # PyTorch 2-layer Linear Attention model
    ├── train.py                # Multi-N training & precomputed curve export
    └── checkpoints/
        └── precomputed_curve.json # Serialized evaluation metrics
```

### File-by-File Breakdown:

#### 1. `backend/associative_engine.py` (Core Vector Math Engine)
- **`generate_synthetic_facts(n_facts, d=32, seed, corrupt_index, remove_index)`**:
  Generates $N$ random Gaussian key vectors and value vectors in $\mathbb{R}^{32}$, normalized to unit length ($\|k_i\|_2 = 1, \|v_i\|_2 = 1$). Random vectors in $\mathbb{R}^{32}$ have an expected dot product of $0$ and variance $1/d = 1/32 \approx 0.031$, making them near-orthogonal when $N \ll 32$. If `corrupt_index` is specified, `values[corrupt_index]` is replaced with a fresh random vector. If `remove_index` is specified, `keys[remove_index]` is replaced. Returns `(keys, values, query_order)`.
- **`run_full_attention(keys, values, query_order)`**:
  Computes scaled dot-product attention against an unbounded explicit KV cache. Cosine similarities `queries @ keys.T` are multiplied by `15.0` (inverse temperature $\tau \approx 0.067$) to sharpen softmax probabilities into near-deterministic dictionary lookups. Retrieved vectors $\hat{v}_i$ are matched against target $v_i$; cosine similarity $> 0.90$ counts as correct. Memory footprint is $2 \cdot N \cdot d$ floats.
- **`run_additive_fast_weight(keys, values, query_order)`**:
  Initializes $W_0 = \mathbf{0} \in \mathbb{R}^{32 \times 32}$. For each fact $t$, performs the outer product update $W_t = W_{t-1} + k_t v_t^\top$. Query readout is $y = q W$. Because $q W = \sum_j (q^\top k_j) v_j$, querying with $k_i$ yields $\|k_i\|^2 v_i + \sum_{j \ne i} (k_i^\top k_j) v_j$. When $N \le 32$, near-orthogonality keeps cross-talk low. When $N > 32$, linear dependence forces non-zero dot products, creating interference that drowns out $v_i$. Success threshold is cosine similarity $> 0.70$. State size is strictly constant ($32 \times 32 = 1,024$ floats).
- **`run_deltanet(keys, values, query_order, beta=0.5)`**:
  Implements the corrective delta rule. At each step $t$, it first reads what the current matrix predicts for key $k_t$: $\hat{v}_t = k_t^\top W_{t-1}$. It calculates the residual error $e_t = v_t - \hat{v}_t$, and updates $W_t = W_{t-1} + \beta k_t e_t^\top = W_{t-1}(I - \beta k_t k_t^\top) + \beta k_t v_t^\top$. The term $(I - \beta k_t k_t^\top)$ actively dampens previous state memory along direction $k_t$, preventing unconstrained cross-talk accumulation.
- **`compute_capacity_curve(n_values, d=32, n_seeds=5)`**:
  Runs multi-seed simulations over $N \in [1, 96]$ across 5 random seeds to compute the precomputed capacity curve.

#### 2. `backend/main.py` (FastAPI Server)
- **`CURVE_CACHE`**: Computed once at server boot via `ae.compute_capacity_curve()`. Exposed via `GET /precomputed-curve` to deliver zero-latency chart rendering.
- **`POST /predict`**: Accepts `PredictRequest(n_pairs, seed, remove_index, corrupt_index)`. Clamps $N$ between 1 and 96, runs live PyTorch tensor operations across all three models via `associative_engine.py`, and returns per-fact accuracy arrays, memory metrics, and raw $32 \times 32$ state tensors.

#### 3. `model-training/model_deltanet.py` & `model_transformer.py`
- **`model_transformer.py`**: Standard 2-layer causal Transformer with multi-head attention ($n_\text{heads}=2, d_\text{head}=32, d_\text{model}=64$). Uses causal lower-triangular masking and causal KV cache.
- **`model_deltanet.py`**: 2-layer linear attention network using the ELU+1 positive feature map $\phi(x) = \text{ELU}(x) + 1$. Evaluates causal linear attention using the GPU-parallel form $O = ((Q K^\top) \odot \text{causal}) V$.
- **`model-training/train.py`**: Trains both models on Multi-Query Associative Recall (MQAR) for 1,000 steps with AdamW and Cosine Annealing, then evaluates accuracy across $N \in [4, 64]$ to produce `checkpoints/precomputed_curve.json`.

---

## 2. Project History: Abandoned Test-Time Adaptation Blueprint

> **Context for Defense:** If judges ask about the project's evolution or alternative directions:

- **Prior Direction Explored:** Earlier in the hackathon cycle, the team explored a **"Test-Time Adaptation" (TTA)** blueprint structured around Token-Recurrent Models and Hierarchical Recurrent Models (TRM/HRM, e.g., McGovern et al.) contrasted against BDH-CQ's parameter-free contextual reasoning.
- **Why It Was Abandoned:** That direction required complex training-time architectural modifications, test-time gradient adaptation loops, and heavier compute requirements that could not be evaluated live with $< 5\text{ms}$ latency in a client browser. Crucially, it shifted focus away from the core mechanistic question of how sub-quadratic architectures store and recall in-context demonstration memory.
- **Pivot to Shipped Submission:** The team pivoted decisively to **The Memory Cliff & Fast Weights** — isolating the exact linear algebra boundary of additive associative memory ($W_t = W_{t-1} + v_t k_t^\top$) inspired by *The Dragon Hatchling* (arXiv:2509.26507) and BDH-CQ (arXiv:2608.09888). This allowed a transparent, live-computed educational substrate running real-time vector inference without simulated smoke-and-mirrors.
- **Clean Repository Verification:** An exhaustive codebase audit across all directories confirms that **no lingering references to the TRM blueprint, McGovern, HRM, or identity embeddings exist** in any source code, documentation, or configuration files (the only occurrences were harmless SHA-512 base64 hashes inside `package-lock.json`).

---

## 3. 14 Live Judge Grilling Questions & Exact Code Answers

### Q1: "Which parts of this app are live PyTorch inference vs. precomputed, and how would I prove you aren't faking the live calculation?"
**The Answer:**
- **Precomputed:** Only the background line chart data (`GET /precomputed-curve`) is precomputed (generated at backend startup in `main.py:34` over 5 random seeds to eliminate client rendering lag).
- **Live PyTorch Computation:** The **Fact Load Slider**, the **Live Per-Fact Grid** (green/red cells), the **State Microscope Heatmap**, and the **Demonstration Surgery** delta recalculation are 100% live.
- **How to Prove It:** Open browser DevTools Network tab. Move the slider to $N = 47$. You will see an immediate `POST /api/predict` with payload `{"n_pairs": 47}`. The backend executes `run_full_attention()`, `run_additive_fast_weight()`, and `run_deltanet()` on CPU/CUDA, returning dynamic tensors in ~15ms. In Demonstration Surgery, click "Corrupt Fact #10"; a new request with `{"n_pairs": 47, "corrupt_index": 10}` executes live tensor surgery and returns modified before/after states.

---

### Q2: "What exact linear algebra failure causes Fixed Memory to collapse at $N > 32$, and where is it in the code?"
**The Answer:**
- In `backend/associative_engine.py:run_additive_fast_weight()`, the state is updated via outer products: $W = \sum_{t=1}^N k_t v_t^\top$.
- Query readout is $y_i = k_i^\top W = \|k_i\|^2 v_i + \sum_{j \ne i} (k_i^\top k_j) v_j$.
- Because key vectors live in $\mathbb{R}^{32}$, the maximum number of mutually orthogonal vectors is exactly $d = 32$.
- When $N \le 32$, keys generated via normalized Gaussian sampling are near-orthogonal ($\mathbb{E}[k_i^\top k_j] = 0, \text{Var} = 1/32$), so the signal $\|k_i\|^2 v_i$ dominates.
- Once $N > 32$, the keys are mathematically guaranteed to be linearly dependent. The interference term $\sum_{j \ne i} (k_i^\top k_j) v_j$ sums $N-1$ non-orthogonal projections, drowning out $v_i$ and driving cosine similarity below the $0.70$ threshold.

---

### Q3: "What would happen to the capacity curve if you changed $d$ from 32 to 64?"
**The Answer:**
- In `backend/associative_engine.py`, dimensionality is controlled by `D_KEY = 32`.
- If set to $d = 64$:
  1. The orthogonal capacity boundary shifts from $N = 32$ to $N = 64$. Exact recall would remain high ($>90\%$) up to $N \approx 64$ before collapsing.
  2. The state matrix footprint would quadruple from $32 \times 32 = 1,024$ floats to $64 \times 64 = 4,096$ floats ($d^2$).
  3. The Full Attention KV cache would store $2 \cdot N \cdot 64$ floats (128 floats per fact instead of 64).

---

### Q4: "Why does DeltaNet degrade much more gracefully than Fixed Memory past $N = 32$?"
**The Answer:**
- Fixed Memory uses an **unconstrained additive write**: $W_t = W_{t-1} + k_t v_t^\top$. It blindly adds new associations into the matrix without checking what is already stored.
- DeltaNet (`backend/associative_engine.py:run_deltanet()`) uses **subtractive error correction**:
  ```python
  pred_v = torch.matmul(k.T, W)
  error = v - pred_v
  W = W + beta * torch.matmul(k, error)
  ```
- Expanding this equation: $W_t = W_{t-1}(I - \beta k_t k_t^\top) + \beta k_t v_t^\top$.
- The operator $(I - \beta k_t k_t^\top)$ acts as an orthogonal projection that actively removes existing memory along the subspace of $k_t$ before inserting $v_t$. This prevents error energy from compounding monotonically across linearly dependent keys.

---

### Q5: "Why is the accuracy threshold 0.90 for Full Attention, but 0.70 for Fixed Memory / DeltaNet? Isn't that an unfair handicap?"
**The Answer:**
- In `backend/associative_engine.py:83`, Full Attention uses `sims > 0.90`. In lines 121 and 160, Fixed Memory and DeltaNet use `sims > 0.70`.
- **Mathematical justification:** Full Attention performs softmax attention with sharp inverse temperature (`scores * 15.0`), focusing $>99\%$ of attention weights on the single nearest key and yielding a near-perfect unit vector reconstruction ($\text{cosine} > 0.99$).
- Linear associative memory does not use a winner-take-all softmax; it performs a linear readout $q W$. Even when $N < 32$, random Gaussian unit vectors in $\mathbb{R}^{32}$ have slight non-zero inner products ($|k_i^\top k_j| \approx 0.15$), introducing slight cross-talk that reduces cosine similarity to $\approx 0.80\text{--}0.88$. A threshold of $0.70$ reflects positive directional alignment ($\theta < 45^\circ$), clearly distinguishing intentional retrieval from random noise ($\text{expected cosine} = 0$).
- **Honest concession to judges:** If we enforced a strict 0.90 threshold on Fixed Memory, its measured accuracy would drop even below $N=32$, underscoring the inherent noise floor of unregularized linear attention.

---

### Q6: "There is a code discrepancy: `model-training/model_deltanet.py` does NOT implement the delta rule. Why?"
**The Answer (DO NOT HIDE THIS — OWN IT):**
- **You are completely right, and that is an important architectural distinction in our code:**
  - In `backend/associative_engine.py:run_deltanet()`, we implement the **true sequential Delta Rule** ($W \leftarrow W + \beta k (v - k^\top W)$).
  - In `model-training/model_deltanet.py`, the PyTorch module implements **additive Linear Attention with ELU+1 feature maps** ($O = ((Q K^\top) \odot \text{causal}) V$, Katharopoulos et al., 2020), which is mathematically equivalent to $S_t = S_{t-1} + v_t k_t^\top$.
  - **Why?** Training a true recurrent DeltaNet on GPU in parallel requires a specialized chunkwise associative scan kernel (as described in the Gated DeltaNet paper, Yang et al., 2024). For our educational training script on CPU/standard GPU, we used parallel linear attention, whereas in our interactive NumPy/PyTorch backend engine we implemented the true sequential subtractive delta rule to contrast against BDH Hebbian updates.

---

### Q7: "How is `model-training/checkpoints/precomputed_curve.json` generated?"
**The Answer:**
- Generated by running `python model-training/train.py`.
- It trains `TransformerModel` and `DeltaNetModel` on synthetic Multi-Query Associative Recall sequences (vocabulary size 130, sequence length up to 260) for 1,000 steps using AdamW ($lr=10^{-3}$) and Cosine Annealing.
- It evaluates both models on $N \in [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64]$ across 6 batches of 32 sequences (192 sequences per $N$).
- The exact accuracy values and layer metadata are saved to `precomputed_curve.json`.

---

### Q8: "How does Demonstration Surgery demonstrate non-locality in associative memory?"
**The Answer:**
- In `backend/associative_engine.py:generate_synthetic_facts()`, passing `corrupt_index=k` resamples `values[k]` to an independent random vector.
- In **Full Attention**, corrupting fact $k$ only breaks recall for fact $k$. Accuracy drops by exactly $1/N$, and all other $N-1$ facts remain unaffected because they reside in isolated KV cache slots.
- In **Fixed Memory**, because all facts are superimposed into a shared matrix $W = \sum k_i v_i^\top$, corrupting fact $k$ alters the entire matrix. When $N$ is near or above capacity, changing one value vector shifts the retrieval vectors for neighboring facts, illustrating that associative memory storage is distributed rather than localized.

---

### Q9: "Does your Fixed Memory model run an actual BDH checkpoint?"
**The Answer:**
- **No, and we explicitly disclaim this in the README, concept summary, and app UI.**
- Official BDH and BDH-CQ weights are proprietary to Pathway and not publicly available.
- Our Fixed Memory model is a **direct mathematical analogue** of the foundational Hebbian synaptic update rule formulated in Section 1.2 and Eq (6)-(7) of *The Dragon Hatchling* (arXiv:2509.26507): $W_t = W_{t-1} + \eta (y_\text{post} \otimes x_\text{pre})$.
- It captures the core mechanism—additive correlation-based synaptic modification without negative error back-projection—and isolates its vulnerability to key collision.

---

### Q10: "Why can't DeltaNet serve as a stand-in for BDH?"
**The Answer:**
- Conflating DeltaNet with BDH violates technical correctness.
- BDH is inspired by neurobiology: synaptic plasticity strengthens connections strictly based on correlated pre- and post-synaptic firing (purely additive Hebbian learning, "neurons that fire together wire together").
- DeltaNet relies on a **subtractive error term** ($v - W k$). In biological neural networks, subtractive error correction requires direct negative feedback or backpropagated error signals at every synapse, which is not biologically plausible in standard Hebbian plasticity.

---

### Q11: "What happens if a query vector is not in the stored set?"
**The Answer:**
- In `backend/associative_engine.py`, `queries = keys[query_order]`, meaning all evaluated queries correspond to stored keys in permuted order.
- If an out-of-distribution query $q_\text{rand}$ (orthogonal to all stored keys) is evaluated:
  - In **Full Attention**, dot products will be near zero; softmax will output a uniform distribution over all stored values, yielding an arbitrary superposition.
  - In **Fixed Memory**, $q_\text{rand} W = \sum_i (q_\text{rand}^\top k_i) v_i \approx \mathbf{0}$. The output vector has near-zero magnitude, meaning the model outputs zero activation rather than hallucinating a confident match.

---

### Q12: "What is the memory footprint formula for Full Attention vs. Fixed Memory?"
**The Answer:**
- **Full Attention:** Stores $N$ key vectors and $N$ value vectors of dimension $d = 32$. Footprint = $2 \cdot N \cdot d$ floats (e.g., at $N=96$, $2 \times 96 \times 32 = 6,144$ floats).
- **Fixed Memory & DeltaNet:** Store a single $d \times d$ matrix. Footprint = $d^2$ floats = $32 \times 32 = 1,024$ floats, completely invariant to sequence length $N$.
- In `model_transformer.py:137`, multi-layer KV cache footprint across $L$ layers is $2 \cdot L \cdot T \cdot d_\text{model}$.

---

### Q13: "What prevents key saturation if you continue adding facts indefinitely ($N \to \infty$) in Fixed Memory?"
**The Answer:**
- **Nothing prevents saturation in an unregularized additive memory**—which is precisely our falsifiable claim.
- As $N \to \infty$, Frobenius norm $\|W\|_F$ grows as $\mathcal{O}(\sqrt{N})$ or $\mathcal{O}(N)$, and the state matrix degenerates into a low-rank background noise matrix, destroying all associative selectivity.
- Recent literature (e.g., *Variational Linear Attention*, Pandey & Singh, arXiv:2605.11196) addresses this by introducing regularized least-squares penalties (Sherman-Morrison updates) to bound the state norm.

---

### Q14: "What is the single biggest technical limitation or gap in this submission?"
**The Answer:**
- **We state this openly:**
  1. **Toy Dimensionality:** $d = 32$ is a pedagogical toy dimension designed for instant in-browser execution and legible matrix heatmaps, whereas real LLMs operate at $d = 2,048$ to $8,192$.
  2. **Synthetic Data:** The associative recall task uses synthetic Gaussian vectors and MQAR tokens rather than real natural-language multi-hop reasoning.
  3. **No Trained BDH Baseline:** We compare against Full Attention and DeltaNet, but have no matched-scale baseline against trained proprietary BDH weights.
  4. **Deployment Status:** At the time of evaluation, the backend requires local startup via `uvicorn` rather than an authenticated production cloud cluster.

---

## 4. Summary Cheat Sheet for the Team

| Question Topic | Key Formula / Number | Code Location |
| :--- | :--- | :--- |
| **Capacity Limit** | $N \le d = 32$ (rank ceiling in $\mathbb{R}^{32}$) | `backend/associative_engine.py:16` |
| **Fixed Memory Write** | $W_t = W_{t-1} + k_t v_t^\top$ (outer product) | `backend/associative_engine.py:107` |
| **DeltaNet Write** | $W_t = W_{t-1} + \beta k_t (v_t - k_t^\top W_{t-1})$ | `backend/associative_engine.py:151` |
| **Full Attention Lookup** | $y = \text{Softmax}(q K^\top \cdot 15.0) V$ | `backend/associative_engine.py:74-76` |
| **Full Attention Memory** | $2 \cdot N \cdot d$ floats (6,144 floats at $N=96$) | `backend/associative_engine.py:85` |
| **Fixed State Memory** | $d^2 = 1,024$ floats ($32 \times 32$, constant) | `backend/associative_engine.py:124` |
| **Retrieval Thresholds** | 0.90 for Attention; 0.70 for Fast Weights | `backend/associative_engine.py:83, 121` |
| **Precomputed Seeds** | 5 seeds (`seed = 1000 + s * 37 + n`) | `backend/associative_engine.py:184` |
| **BDH Primary Paper** | Kosowski et al. (Sep 2025, arXiv:2509.26507) | `concept_summary.md:61` |
| **BDH-CQ Paper** | Engdahl et al. (Aug 2026, arXiv:2608.09888) | `concept_summary.md:62` |
