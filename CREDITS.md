# Credits & Software Provenance

This document details all third-party dependencies, open-source libraries, UI assets, and the exact computational provenance of data in the DataForge Memory Cliff submission.

---

## 1. Backend Dependencies (`backend/requirements.txt`)

- **`torch` (v2.13.0)** — PyTorch tensor computation library, used for vectorized associative memory updates, dot-product query projections, and hidden state extractions.
- **`fastapi` (v0.135.2)** — High-performance web framework for the interactive inference API.
- **`uvicorn[standard]` (v0.42.0)** — ASGI web server running the FastAPI backend.
- **`pydantic` (v2.12.5)** — Data validation and serialization for API request/response schemas.

---

## 2. Frontend Dependencies (`frontend/package.json`)

### Core Runtime
- **`react` (^18.2.0)** & **`react-dom` (^18.2.0)** — Declarative component hierarchy and state management.
- **`recharts` (^2.10.3)** — Composable SVG charting library used for the capacity curve line chart.
- **`lucide-react` (^0.300.0)** — Feather-based icon set for UI iconography.

### Build & Styling
- **`vite` (^5.0.8)** & **`@vitejs/plugin-react` (^4.2.1)** — Frontend build tooling and fast HMR dev server.
- **`tailwindcss` (^4.0.0)** & **`@tailwindcss/vite` (^4.0.0)** — Utility-first styling engine.
- **`typescript` (^5.2.2)** — Static type checking and interface contracts.
- **`postcss` (^8.4.32)** & **`autoprefixer` (^10.4.16)** — CSS transformation and vendor prefixing.

---

## 3. Fonts & Iconography

- **Typography:** Uses native system font stacks (`font-sans`, `font-mono`) specified via Tailwind CSS. No external web font assets or external CDN fonts (e.g., Google Fonts) are loaded, ensuring zero tracking, offline resilience, and fast load times.
- **Icons & Glyphs:** Standard SVG icons from `lucide-react` and standard Unicode emoji glyphs (🧠, 💻, ⚡, 🛡, ⚠) rendered inline.

---

## 4. Precomputed Data Provenance (`model-training/checkpoints/precomputed_curve.json`)

- **Generating Script:** [`model-training/train.py`](model-training/train.py) (executed via PyTorch).
- **Task Formulation:** Multi-Query Associative Recall (MQAR) benchmark generated from [`model-training/data_generation.py`](model-training/data_generation.py) with vocabulary size $V = 130$.
- **Architectures Trained:**
  - **Model A (Transformer):** 2-layer transformer, $d_\text{model}=64$, 2 heads ($d_\text{head}=32$), $d_\text{ff}=128$, explicit KV cache.
  - **Model B (DeltaNet):** 2-layer recurrent network, $d_\text{model}=64$, $32 \times 32$ state matrix ($d_\text{state}=32$), subtractive delta rule update.
- **Training Protocol:** 1,000 optimization steps on synthetic MQAR sequences ($N \in [4, 64]$) using AdamW ($\text{LR} = 10^{-3}$) and Cosine Annealing learning rate schedule.
- **Evaluation & Curve Generation:** Evaluated under `torch.no_grad()` across 6 batches of 32 sequences (192 sequences per fact load $N$) over $N \in [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64]$. The resulting accuracy metrics and state configurations are serialized directly into `precomputed_curve.json`.
