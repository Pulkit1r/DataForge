# The Memory Cliff: Associative Memory and Fast Weights

> **Interactive educational exploration comparing Full (Softmax) Attention vs. Fixed-Size Additive Fast-Weights (Hebbian / BDH Analogue) vs. DeltaNet (Corrective Delta Rule) on associative recall.**  
> *DataForge 2026 — Pathway Track Submission*

---

## 1. The Falsifiable Core Claim
> **"A fixed-size additive associative-memory state can process an arbitrarily long stream of facts without allocating a new slot per fact, but its exact-recall accuracy degrades once the number of stored facts exceeds the state's effective capacity, due to key-collision interference."**

The interactive dashboard is designed to rigorously test and demonstrate this boundary:
- When fact load $N \le d$ ($d = 32$), near-orthogonal key vectors allow near-perfect linear readout: $y = W q$.
- When $N > d$, key vectors inevitably become linearly dependent in $\mathbb{R}^d$, producing cross-talk interference and driving recall accuracy toward zero.

---

## 2. Three Architectures Compared

| Architecture | Mechanism | Memory Storage Footprint | Role & Labeling in App |
| :--- | :--- | :--- | :--- |
| **Full Attention** | Unbounded KV Cache: stores explicit $(k_i, v_i)$ pairs; retrieves via softmax dot products | $O(N \cdot d)$ (unbounded growth, e.g., 6,144 floats at $N=96$) | **Ground-Truth Baseline** (Always 100% in-context) |
| **Fixed Memory (Additive)** | Hebbian fast-weight update: $W_t = W_{t-1} + v_t k_t^\top$, read via $y = W q$ | $O(1)$ constant ($32 \times 32 = 1,024$ floats) | **Primary Model (BDH Analogue)**: *Mechanistic analogue of BDH's Hebbian update — not an official BDH model* |
| **DeltaNet** | Corrective delta rule: $W_t = W_{t-1} + \beta (v_t - W_{t-1} k_t) k_t^\top$ | $O(1)$ constant ($32 \times 32 = 1,024$ floats) | **Contrast Architecture**: *Shows how subtractive error-correction dampens collision interference — separate architecture, not BDH* |

> **Technical Integrity Notice:** DeltaNet is **never conflated with BDH**. BDH's primary mechanism is correlation-based Hebbian synaptic strengthening (additive only); DeltaNet's delta rule is subtractive and error-driven. Conflating them would violate technical correctness.

---

## 3. The BDH Connection (arXiv:2509.26507 & BDH-CQ)

The primary BDH paper (*The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain*, arXiv:2509.26507) reformulates transformer self-attention as a biological synaptic memory:
$$W_t = W_{t-1} + \eta \cdot (y_{\text{post}} \otimes x_{\text{pre}})$$
- Connections strengthen according to correlated pre- and post-synaptic activity with **no subtractive back-projection term**.
- The BDH-CQ technical report confirms that few-shot demonstration learning accumulates additively per demonstration exemplar into a constant working state.
- Our **Fixed Memory** model is a transparent mathematical analogue of this associative mechanism, demonstrating both its constant-space efficiency and its vulnerability to key collision beyond rank $d$.

---

## 4. Live vs. Precomputed Components

To satisfy the **Interactive Substrate & Honesty** criteria:

| Component | Source & Computation |
| :--- | :--- |
| **Fact Load Slider ($1 \to 96$)** | Interactive input driving live requests with capacity threshold marked at $d = 32$. |
| **Live Per-Fact Grid** | **Live PyTorch computation**: 2D grid where each cell corresponds to a specific fact query, colored green/red dynamically based on cosine retrieval. |
| **Memory Footprint Metrics** | **Live mathematical calculation**: displays exact float storage counts ($2 \cdot N \cdot d$ vs. constant $d^2$). |
| **Capacity Curve Line Chart** | **Empirical multi-seed simulation**: precomputed over multiple random seeds across $N \in [1, 96]$ showing the collapse curve past $d=32$. |
| **State Microscope Heatmap** | **Live hidden tensor extraction**: visualizes the $32 \times 32$ state matrix and step-by-step outer product accumulation. |
| **Demonstration Surgery** | **Live forward-pass execution**: surgically removes or corrupts any fact and recalculates the before/after delta across all three architectures. |
| **Explain-It-Back** | Interactive student reflection box persisted via browser `localStorage`. |

---

## 5. Primary Literature Cited

1. **Yang, Kautz, & Hatamizadeh (2024):** *Gated Delta Networks: Improving Mamba2 with Delta Rule* (arXiv:2412.06464) — Demonstrates associative fixed-state memory collision and the delta-rule correction.
2. **Arora et al. (2024):** *Simple linear attention language models balance the recall-throughput tradeoff* ("Based", arXiv:2402.18668) — Documents the state-size vs. recall capacity ceiling.
3. **Variational Linear Attention (2026):** *Variational Linear Attention: Stable Associative Memory for Long-Context Transformers* (arXiv:2605.11196) — Documents the exact collapse curve of linear attention as $N \to d_h$.
4. **Primary BDH Paper:** *The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain* (arXiv:2509.26507) — For the biological synaptic framing and additive Hebbian update rule.
5. **BDH-CQ Technical Report:** For the additive per-demonstration state accumulation property.

---

## 6. How to Run Locally

### Start Backend:
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Start Frontend:
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser at `http://127.0.0.1:5173`.

---

## 7. AI-Assisted Development Disclosure
AI coding assistants were used to accelerate frontend scaffolding, Vite/Tailwind configuration, and PyTorch vectorized tensor operations. All mathematical formulations, model definitions, and associative memory evaluation pipelines were implemented from scratch and verified.
