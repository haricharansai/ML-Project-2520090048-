import { useState, useEffect } from "react";
import {
  apiHealth,
  apiDashboard,
  type HealthResponse,
  type DashboardResponse,
  type DashboardDataset,
  type DashboardMetrics,
  type DashboardModels,
  type ModelInfo,
  type PredictResponse,
  apiPredict,
} from "../api/client";

type Page = "dashboard" | "detect" | "comparison" | "analytics" | "about";

const mono = '"JetBrains Mono:Medium", monospace';
const monoBold = '"JetBrains Mono:Bold", monospace';
const inter = '"Inter:Regular", Inter, sans-serif';
const interMed = '"Inter:Medium", Inter, sans-serif';
const interSemi = '"Inter:Semi Bold", Inter, sans-serif';
const interBold = '"Inter:Bold", Inter, sans-serif';

export default function Dashboard({ setPage }: { setPage: (p: Page) => void; engineStatus?: string }) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [model, setModel] = useState<"both" | "bert" | "lstm">("both");
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [predictionError, setPredictionError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const [healthData, dashboardData] = await Promise.all([
          apiHealth(),
          apiDashboard(),
        ]);

        if (!mounted) return;
        setHealth(healthData);
        setDashboard(dashboardData);
      } catch (error) {
        if (!mounted) return;
        setHealth(null);
        setDashboard(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePredict = async () => {
    if (!text.trim()) return;
    setPredicting(true);
    setPrediction(null);
    setPredictionError("");
    try {
      const result = await apiPredict(text, model);
      setPrediction(result);
    } catch (e) {
      setPredictionError(e instanceof Error ? e.message : "Prediction failed");
    } finally {
      setPredicting(false);
    }
  };

  const dataset = dashboard?.dataset;
  const models = dashboard?.models;
  const metrics = dashboard?.metrics;
  const datasetTotal = dataset?.total_loaded ?? 0;
  const datasetAfterPreprocess = dataset?.after_preprocessing ?? 0;
  const vocabularySize = dataset ? Object.keys(dataset.label_map ?? {}).length : 0;
  const splitCounts = dataset?.split_counts ?? { train: 0, validation: 0, test: 0 };
  const pipelineStatus = health ? (Object.values(health.models).some((m) => m.loaded) ? "Ready" : "Not trained") : "Loading...";

  const isModelAvailable = (mt: "bert" | "lstm") => models?.[mt]?.available ?? false;
  const isModelLoaded = (mt: "bert" | "lstm") => models?.[mt]?.loaded ?? false;
  const modelStatus = (mt: "bert" | "lstm"): string => {
    const m = models?.[mt];
    if (!m) return "Not trained";
    if (m.loaded) return "Ready";
    if (m.status === "error") return "Error";
    if (m.status === "not_trained") return "Not trained";
    return m.status;
  };

  return (
    <div style={{ padding: 0 }}>
      <PageHeader
        title="Fake News Detection"
        subtitle={dataset ? `Processed ${datasetAfterPreprocess.toLocaleString()} samples from ${datasetTotal.toLocaleString()} loaded articles.` : "Analyze news content using NLP-powered machine learning models."}
        engineStatus={pipelineStatus}
      />

      <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Hero card */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: "28px 32px", display: "flex", alignItems: "flex-start", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <Badge icon="✦" text="Benchmarked Machine Learning Inference" />
            <h2 style={{ fontFamily: interBold, fontSize: 24, fontWeight: 700, color: "#111827", margin: "12px 0 10px" }}>
              Detect misinformation with AI
            </h2>
            <p style={{ fontFamily: inter, fontSize: 13, color: "#6b7280", lineHeight: 1.6, maxWidth: 520, margin: "0 0 20px" }}>
              Compare LSTM and BERT predictions and understand how different NLP architectures classify news content. Real-time token salience scoring and linguistic contextual analysis across heterogeneous corpus datasets.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setPage("detect")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#2563eb", color: "#fff", border: "none",
                  borderRadius: 6, padding: "9px 18px", cursor: "pointer",
                  fontFamily: interMed, fontSize: 13, fontWeight: 500,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.3" /><rect x="9" y="1" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.3" /><rect x="1" y="9" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.3" /><rect x="9" y="9" width="6" height="6" rx="1" stroke="#fff" strokeWidth="1.3" /></svg>
                Analyze News
              </button>
              <button
                onClick={() => setPage("comparison")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#fff", color: "#374151", border: "1px solid #d1d5db",
                  borderRadius: 6, padding: "9px 18px", cursor: "pointer",
                  fontFamily: interMed, fontSize: 13, fontWeight: 500,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M10 5l3 3-3 3M6 5L3 8l3 3" stroke="#374151" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                View Model Comparison
              </button>
            </div>
          </div>
          <div style={{ flexShrink: 0, opacity: 0.25 }}>
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
              <circle cx="60" cy="50" r="14" stroke="#2563eb" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="7" stroke="#2563eb" strokeWidth="1.5" />
              <circle cx="100" cy="20" r="7" stroke="#2563eb" strokeWidth="1.5" />
              <circle cx="20" cy="80" r="7" stroke="#2563eb" strokeWidth="1.5" />
              <circle cx="100" cy="80" r="7" stroke="#2563eb" strokeWidth="1.5" />
              <line x1="27" y1="23" x2="50" y2="42" stroke="#2563eb" strokeWidth="1" />
              <line x1="93" y1="23" x2="70" y2="42" stroke="#2563eb" strokeWidth="1" />
              <line x1="27" y1="77" x2="50" y2="58" stroke="#2563eb" strokeWidth="1" />
              <line x1="93" y1="77" x2="70" y2="58" stroke="#2563eb" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Model cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ModelCard
            tag="Recurrent Neural Network"
            title="LSTM (Bi-directional)"
            description="Sequential recurrent network capturing word sequence dependencies. Optimized for temporal linguistic flow with bidirectional hidden states."
            embedding="Learned Embeddings"
            layers="2 Bi-LSTM + Dense"
            status={modelStatus("lstm")}
            metrics={metrics?.lstm}
          />
          <ModelCard
            tag="Transformer Architecture"
            title="BERT-Base (Uncased)"
            description="Bidirectional encoder representations with multi-head self-attention mechanisms. Deep contextual embeddings trained on extensive masked corpora."
            embedding="Attention: 12-head multi"
            layers="Params: 110M Parameters"
            status={modelStatus("bert")}
            metrics={metrics?.bert}
          />
        </div>

        {/* Quick Detection */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: interBold, fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Quick Detection</h3>
              <p style={{ fontFamily: inter, fontSize: 13, color: "#6b7280", margin: 0 }}>Paste a news headline or article to analyze</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["both", "bert", "lstm"] as const).map(m => (
                <button key={m} onClick={() => setModel(m)} disabled={m === "lstm" && !isModelAvailable("lstm") || m === "bert" && !isModelAvailable("bert")} style={{
                  padding: "5px 12px", borderRadius: 20, border: "1px solid #d1d5db", cursor: "pointer",
                  fontFamily: mono, fontSize: 11,
                  background: model === m ? "#2563eb" : "#fff",
                  color: model === m ? "#fff" : "#6b7280",
                  opacity: (m === "lstm" && !isModelAvailable("lstm")) || (m === "bert" && !isModelAvailable("bert")) ? 0.4 : 1,
                }}>
                  {m === "both" ? "● Compare Both (Recommended)" : m === "bert" ? "○ BERT-Base" : "○ Bi-LSTM"}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter or paste article text, claim, or press release..."
            maxLength={5000}
            style={{
              width: "100%", height: 120, border: "1px solid #d1d5db", borderRadius: 6,
              padding: "12px 14px", fontFamily: inter, fontSize: 13, color: "#374151",
              resize: "vertical", outline: "none", lineHeight: 1.6,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, marginBottom: 16 }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#9ca3af" }}>
              {text.length} / 5,000 chars &nbsp;|&nbsp; {(text.trim() ? text.trim().split(/\s+/).length : 0)} words
            </span>
            <span style={{ fontFamily: mono, fontSize: 11, color: "#9ca3af" }}>
              ⚡ Tokenization: WordPiece Ready
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: inter, fontSize: 12, color: "#9ca3af", maxWidth: 480, margin: 0, display: "flex", gap: 6 }}>
              <span>ℹ</span>
              <span>Predictions are generated by trained NLP models and should not be treated as definitive fact-checking.</span>
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setText("")} style={{
                padding: "9px 20px", border: "1px solid #d1d5db", borderRadius: 6,
                background: "#fff", fontFamily: interMed, fontSize: 13, cursor: "pointer", color: "#374151",
              }}>Clear Input</button>
              <button onClick={handlePredict} disabled={!text.trim() || predicting} style={{
                padding: "9px 20px", border: "none", borderRadius: 6, gap: 6,
                background: text.trim() && !predicting ? "#2563eb" : "#93c5fd", color: "#fff",
                fontFamily: interMed, fontSize: 13, cursor: text.trim() && !predicting ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center",
              }}>
                {predicting ? "⟳ Predicting..." : <><span>✦</span> Detect News</>}
              </button>
            </div>
          </div>

          {prediction && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#f8f9fa", borderRadius: 8, border: "1px solid #e5e7eb" }}>
              <div style={{ fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#111827", marginBottom: 8 }}>Prediction Results</div>
              {prediction.predictions.map(p => (
                <div key={p.model} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: mono, fontSize: 11, color: "#6b7280" }}>{p.model.toUpperCase()}</span>
                  <span style={{
                    fontFamily: mono, fontSize: 11,
                    color: p.label === "fake" ? "#dc2626" : "#16a34a",
                    background: p.label === "fake" ? "#fef2f2" : "#f0fdf4",
                    borderRadius: 4, padding: "2px 8px",
                  }}>{p.label.toUpperCase()} ({p.confidence})</span>
                </div>
              ))}
              <div style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
                Agreement: {prediction.agreement ? "Yes" : "No"}
              </div>
            </div>
          )}
          {predictionError && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
              <div style={{ fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#991b1b" }}>Prediction Error</div>
              <p style={{ fontFamily: inter, fontSize: 12, color: "#7f1d1d", margin: "4px 0 0" }}>{predictionError}</p>
            </div>
          )}
        </div>

        {/* Bottom stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard
            icon="⊞"
            label="Benchmark Dataset"
            value={dataset ? `${datasetTotal.toLocaleString()} articles loaded` : "—"}
          />
          <StatCard
            icon="📖"
            label="Processed Samples"
            value={dataset ? `${datasetAfterPreprocess.toLocaleString()} cleaned rows` : "—"}
          />
          <StatCard
            icon="⟷"
            label="Train / Val / Test"
            value={dataset ? `${splitCounts.train.toLocaleString()} / ${splitCounts.validation.toLocaleString()} / ${splitCounts.test.toLocaleString()}` : "—"}
          />
          <StatCard
            icon="⚙"
            label="Model Classes"
            value={dataset ? `${vocabularySize} label classes` : "—"}
          />
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 16, fontFamily: mono, fontSize: 12, color: "#9ca3af" }}>
            Loading dashboard data...
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div key={label} style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, background: "#eff6ff", borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily: inter, fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: interSemi, fontSize: 13, fontWeight: 600, color: "#111827" }}>{value}</div>
      </div>
    </div>
  );
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 20,
      padding: "3px 10px",
    }}>
      <span style={{ fontSize: 10, color: "#0ea5e9" }}>{icon}</span>
      <span style={{ fontFamily: mono, fontSize: 11, color: "#0369a1" }}>{text}</span>
    </div>
  );
}

function ModelCard({ tag, title, description, embedding, layers, status, metrics }: {
  tag: string; title: string; description: string;
  embedding: string; layers: string; status: string;
  metrics?: Record<string, number> | null;
}) {
  const isReady = status === "Ready";
  const accuracy = metrics?.test_accuracy;
  const f1 = metrics?.macro_f1;
  const precision = metrics?.precision;

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 4, padding: "2px 7px" }}>{tag}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: mono, fontSize: 10, color: isReady ? "#16a34a" : "#9ca3af" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: isReady ? "#16a34a" : "#9ca3af", display: "inline-block" }} />
          {status}
        </span>
      </div>
      <h3 style={{ fontFamily: interBold, fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontFamily: inter, fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: "0 0 16px" }}>{description}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderTop: "1px solid #f3f4f6", paddingTop: 12, marginBottom: 12 }}>
        {[
          { label: "Accuracy", val: accuracy != null ? `${(accuracy * 100).toFixed(1)}%` : "Not evaluated" },
          { label: "F1 Score", val: f1 != null ? `${(f1 * 100).toFixed(1)}%` : "Not evaluated" },
          { label: "Precision", val: precision != null ? `${(precision * 100).toFixed(1)}%` : "Not evaluated" },
        ].map(m => (
          <div key={m.label} style={{ padding: "0 0 0 0" }}>
            <div style={{ fontFamily: inter, fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 3 }}>
              {m.label} <span style={{ fontSize: 9 }}>ⓘ</span>
            </div>
            <div style={{ fontFamily: monoBold, fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 2 }}>{m.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: "#9ca3af" }}>Embedding: {embedding}</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: "#9ca3af" }}>Layers: {layers}</span>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, engineStatus }: { title: string; subtitle: string; engineStatus: string }) {
  return (
    <div style={{
      background: "#fff", borderBottom: "1px solid #e5e7eb",
      padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <h1 style={{ fontFamily: interBold, fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 3px" }}>{title}</h1>
        <p style={{ fontFamily: inter, fontSize: 13, color: "#6b7280", margin: 0 }}>{subtitle}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{
          display: "flex", alignItems: "center", gap: 6,
          background: engineStatus === "Ready" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${engineStatus === "Ready" ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: 20, padding: "4px 12px",
          fontFamily: mono, fontSize: 11, color: engineStatus === "Ready" ? "#16a34a" : "#dc2626",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: engineStatus === "Ready" ? "#16a34a" : "#dc2626", display: "inline-block" }} />
          NLP Inference Engine: {engineStatus}
        </span>
      </div>
    </div>
  );
}