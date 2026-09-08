const API_BASE = (import.meta.env.VITE_API_BASE ? import.meta.env.VITE_API_BASE.replace(/\/$/, '') : '') || '/api';

export interface ModelEvaluation {
  name: string;
  mechanism: string;
  role: string;
  labeling: string;
  accuracy: number;
  correct_per_fact: boolean[];
  memory_footprint: number;
  memory_type: string;
}

export interface PredictResponse {
  n_facts: number;
  d_capacity: number;
  query_order: number[];
  full_attention: ModelEvaluation;
  additive_fast_weight: ModelEvaluation;
  deltanet: ModelEvaluation;
  state_matrix: number[][];
  state_matrices_steps: number[][][];
}

export interface CurveData {
  n_values: number[];
  d_capacity: number;
  full_attention_accuracy: number[];
  additive_fast_weight_accuracy: number[];
  deltanet_accuracy: number[];
}

export async function fetchPrediction(
  nPairs: number,
  seed?: number,
  removeIndex?: number,
  corruptIndex?: number
): Promise<PredictResponse> {
  const body: Record<string, any> = { n_pairs: nPairs };
  if (seed !== undefined)         body.seed = seed;
  if (removeIndex !== undefined)  body.remove_index = removeIndex;
  if (corruptIndex !== undefined) body.corrupt_index = corruptIndex;

  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Prediction failed: ${res.status}`);
  return res.json();
}

export async function fetchCurve(): Promise<CurveData> {
  const res = await fetch(`${API_BASE}/precomputed-curve`);
  if (!res.ok) throw new Error(`Curve fetch failed: ${res.status}`);
  return res.json();
}
