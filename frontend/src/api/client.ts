export interface ModelInfo {
  available: boolean;
  loaded: boolean;
  status: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  models: Record<string, ModelInfo>;
}

export interface DashboardDataset {
  source_files: string[];
  text_column: string;
  label_column: string;
  label_map: Record<string, number>;
  seed: number;
  total_loaded: number;
  after_preprocessing: number;
  deduplication: {
    exact_text_dropped: number;
    url_label_dropped: number;
    remaining: number;
  };
  split_counts: {
    train: number;
    validation: number;
    test: number;
  };
  class_distribution: Record<string, Record<string, number>>;
  leakage_check: {
    url_groups_in_multiple_splits: number;
    verified: boolean;
  };
}

export interface DashboardMetrics {
  lstm?: Record<string, number>;
  bert?: Record<string, number>;
}

export interface DashboardModels {
  bert: ModelInfo;
  lstm: ModelInfo;
}

export interface DashboardResponse {
  dataset: DashboardDataset | null;
  models: DashboardModels;
  metrics: DashboardMetrics | null;
  history?: Record<string, { train_loss?: number[]; val_loss?: number[]; train_acc?: number[]; val_acc?: number[] }> | null;
}

export interface PredictionResult {
  model: string;
  label: string;
  confidence: number;
}

export interface PredictResponse {
  predictions: PredictionResult[];
  agreement: boolean;
}

export interface PredictionRequest {
  text: string;
  model_type: "bert" | "lstm" | "both";
}

const BASE = "/api";

export async function apiHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function apiDashboard(): Promise<DashboardResponse> {
  const res = await fetch(`${BASE}/dashboard`);
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  return res.json();
}

export async function apiPredict(
  text: string,
  modelType: "bert" | "lstm" | "both" = "bert"
): Promise<PredictResponse> {
  const res = await fetch(`${BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_type: modelType }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(detail.detail || `Prediction failed: ${res.status}`);
  }
  return res.json();
}