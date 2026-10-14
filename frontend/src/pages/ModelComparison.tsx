import { useEffect, useMemo, useState } from "react";
import { apiDashboard, type DashboardResponse } from "../api/client";

const mono = '"JetBrains Mono:Medium", monospace';
const monoBold = '"JetBrains Mono:Bold", monospace';
const inter = '"Inter:Regular", Inter, sans-serif';
const interMed = '"Inter:Medium", Inter, sans-serif';
const interSemi = '"Inter:Semi Bold", Inter, sans-serif';
const interBold = '"Inter:Bold", Inter, sans-serif';

const metricDefinitions = [
  { label: "Accuracy", desc: "Overall correct classifications / total samples", key: "test_accuracy" },
  { label: "Precision (Fake News)", desc: "True Positives / True Positives + False Positives", key: "precision" },
  { label: "Recall (Fake News)", desc: "True Positives / Annotated Journalistic Testimonies", key: "recall" },
  { label: "F1 Score (Macro)", desc: "Harmonic mean of precision and recall", key: "macro_f1" },
  { label: "Loss", desc: "Cross-entropy loss on the evaluation split", key: "test_loss" },
];

export default function ModelComparison() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    apiDashboard()
      .then((data) => {
        if (mounted) setDashboard(data);
      })
      .catch(() => {
        if (mounted) setDashboard(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const lstm = dashboard?.metrics?.lstm ?? {};
    const bert = dashboard?.metrics?.bert ?? {};

    return metricDefinitions.map((item) => {
      const lstmValue = typeof lstm[item.key] === "number" ? lstm[item.key] : null;
      const bertValue = typeof bert[item.key] === "number" ? bert[item.key] : null;
      const barBase = 10;
      const maxValue = Math.max(0.01, ...[lstmValue ?? 0, bertValue ?? 0].filter((v) => v !== null));

      return {
        ...item,
        lstmValue,
        bertValue,
        lstmText: lstmValue == null ? "Not evaluated" : formatMetricValue(item.key, lstmValue),
        bertText: bertValue == null ? "Not evaluated" : formatMetricValue(item.key, bertValue),
        variance: deriveVariance(lstmValue, bertValue),
        lstmHeight: computeBarHeight(lstmValue, maxValue, barBase),
        bertHeight: computeBarHeight(bertValue, maxValue, barBase),
      };
    });
  }, [dashboard]);

  const anyMetricsAvailable = metrics.some((item) => item.lstmValue != null || item.bertValue != null);

  return (
    <div>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: interBold, fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 3px" }}>Model Comparison</h1>
          <p style={{ fontFamily: inter, fontSize: 13, color: "#6b7280", margin: 0 }}>Compare the performance of two NLP architectures used for fake news classification.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 12px", fontFamily: mono, fontSize: 11, color: "#16a34a" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />NLP Inference Engine: Ready
          </span>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Model overview cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ModelOverviewCard
            tag="Sequential neural networks architecture"
            version="v1.2 Baseline"
            title="Long Short-Term Memory (Bi-LSTM)"
            tagColor="#7c3aed"
            description="Recurrent topology optimized for sequential context propagation using bidirectional gated memory states over pre-trained distributed embeddings."
            specs={[
              { label: "Gate Intf Inputs", val: "3 (Input, Forget, Output)" },
              { label: "Hidden Dimension", val: "128 (Bidirectional: 256)" },
              { label: "Embedding Substrate", val: "GloVe: 300d" },
              { label: "Trainable Params", val: "~1.2M Params" },
              { label: "Token Recurrence", val: "B1705" },
              { label: "Env-BB-BI-279", val: "" },
            ]}
          />
          <ModelOverviewCard
            tag="Transformer-based language model"
            version="State-of-the-Art"
            title="Bidirectional Encoder Representations from Transformers"
            tagColor="#0369a1"
            description="Deep contextual multi-head self-attention architecture pre-trained on Masked Language Modeling (MLM) and Next Sentence Prediction (NSP)."
            specs={[
              { label: "Attention Mechanism", val: "Multi-Head Self Attention (12 heads)" },
              { label: "Transformer Encoders", val: "12 Encoder Blocks" },
              { label: "Hidden Vector Dimension", val: "768-dimensional" },
              { label: "Trainable Parameters", val: "~110M Params" },
              { label: "Self-attention: $60(#I10)", val: "" },
              { label: "GCR: token-scaled", val: "" },
            ]}
          />
        </div>

        {/* Performance matrix */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="#2563eb" strokeWidth="1.3" /><path d="M5 5h6M5 8h4M5 11h5" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" /></svg>
              <span style={{ fontFamily: interSemi, fontSize: 15, fontWeight: 600, color: "#111827" }}>Empirical Evaluation & Performance Matrix</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ fontFamily: mono, fontSize: 11, padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <span>↓</span> LaTeX Table (.tex)
              </button>
              <button style={{ fontFamily: mono, fontSize: 11, padding: "5px 12px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <span>↻</span> Re-run Benchmark
              </button>
            </div>
          </div>

          <div style={{ fontSize: 12, fontFamily: inter, color: "#6b7280", marginBottom: 12 }}>
            Standardized validation chemistry is on ISOT & LIAR Fake News Corpus (10-fold cross-validation scheme).
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#374151", width: "35%" }}>Evaluation Metric</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#374151" }}>Bi-directional LSTM</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#374151" }}>BERT-Base Uncased</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#374151" }}>Research Benchmark Variance</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#374151" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={m.label} style={{ borderBottom: "1px solid #f9fafb", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontFamily: interMed, fontSize: 12, fontWeight: 500, color: "#111827" }}>{m.label}</div>
                    <div style={{ fontFamily: inter, fontSize: 11, color: "#9ca3af" }}>{m.desc}</div>
                  </td>
                  <td style={{ padding: "10px 12px", fontFamily: mono, fontSize: 12, color: m.lstmValue == null ? "#9ca3af" : "#111827" }}>{m.lstmText}</td>
                  <td style={{ padding: "10px 12px", fontFamily: mono, fontSize: 12, color: m.bertValue == null ? "#9ca3af" : "#111827" }}>{m.bertText}</td>
                  <td style={{ padding: "10px 12px", fontFamily: mono, fontSize: 12, color: "#9ca3af" }}>{m.variance}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      fontFamily: mono,
                      fontSize: 10,
                      color: anyMetricsAvailable ? "#16a34a" : "#f59e0b",
                      background: anyMetricsAvailable ? "#f0fdf4" : "#fffbeb",
                      border: `1px solid ${anyMetricsAvailable ? "#bbf7d0" : "#fde68a"}`,
                      borderRadius: 4,
                      padding: "2px 8px",
                    }}>
                      {anyMetricsAvailable ? "Metrics loaded" : "Pending test run"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10, fontFamily: inter, fontSize: 11, color: "#9ca3af" }}>
            ⓘ {anyMetricsAvailable ? "Values are pulled from the saved model metrics on disk." : "No model metrics are available yet; run training to populate the evaluation output."}
          </div>
        </div>

        {/* Benchmark visualizations */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontFamily: interBold, fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Dynamic Benchmark Visualizations</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {["Bi-LSTM", "BERT-Base"].map(m => (
                <button key={m} style={{ fontFamily: mono, fontSize: 10, padding: "3px 10px", border: "1px solid #d1d5db", borderRadius: 4, background: "#fff", cursor: "pointer" }}>{m}</button>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: inter, fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Comparative metric divergence charts scaled from the saved evaluation metrics for each trained model.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {metrics.slice(0, 4).map((item) => (
              <div key={item.label} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{item.label}</div>
                <div style={{ height: 80, background: "#f9fafb", borderRadius: 4, marginBottom: 8, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, padding: "8px 12px" }}>
                  <div style={{ flex: 1, background: "#bfdbfe", borderRadius: "3px 3px 0 0", height: `${Math.max(item.lstmHeight ?? 8, 8)}%` }} />
                  <div style={{ flex: 1, background: "#2563eb", borderRadius: "3px 3px 0 0", height: `${Math.max(item.bertHeight ?? 8, 8)}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 4 }}>
                  {["LSTM", "BERT"].map((m, i) => (
                    <div key={m} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <div style={{ width: 8, height: 8, background: i === 0 ? "#bfdbfe" : "#2563eb", borderRadius: 1 }} />
                      <span style={{ fontFamily: mono, fontSize: 9, color: "#9ca3af" }}>{m}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af" }}>
                  {item.lstmValue != null || item.bertValue != null ? `Δ: ${item.variance}` : "Status: awaiting metrics"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipelines */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#2563eb" strokeWidth="1.2" /><path d="M4 7h6M7 4v6" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" /></svg>
            <h3 style={{ fontFamily: interBold, fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>End-to-End Inference Pipelines</h3>
          </div>
          <p style={{ fontFamily: inter, fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Architectural schematic illustrating token vector flow from raw input string through feature extraction to the classification tensor.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <PipelineCard
              title="Bi-LSTM Pipeline Flow"
              tag="Sequential Topology"
              color="#7c3aed"
              steps={[
                { n: 1, label: "Raw News Text", sub: "Corpus String" },
                { n: 2, label: "Tokenization & Padding", sub: "Vocab Encoder (len=256)" },
                { n: 3, label: "Embedding Layer (GloVe)", sub: "300-d Static Vectors" },
                { n: 4, label: "Bi-directional LSTM Layer", sub: "128 × 2 Bi4" },
                { n: 5, label: "Dense & Dropout Layer", sub: "ρ = 0.3 Regularization" },
                { n: 6, label: "Softmax Prediction", sub: "[Real / Fake]" },
              ]}
            />
            <PipelineCard
              title="BERT Pipeline Flow"
              tag="Attentive Topology"
              color="#0369a1"
              steps={[
                { n: 1, label: "Raw News Text", sub: "Corpus String" },
                { n: 2, label: "BERT WordPiece Tokenizer", sub: "Subword tokens with [CLS] and [SEP]", badge: "30,522 Vocab" },
                { n: 3, label: "Transformer Encoder Blocks", sub: "", badge: "12+ Stacked Encoders" },
                { n: 4, label: "Multi-Head Self-Attention", sub: "Directional dependency across all tokens", badge: "12 Attention Heads" },
                { n: 5, label: "Classification Head [CLS] Pooler", sub: "Dense (768 → 2)" },
                { n: 6, label: "Softmax Prediction", sub: "[Real / Fake]" },
              ]}
            />
          </div>
        </div>

        {/* Theoretical justification */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: "#2563eb" }}>🎓</span>
            <span style={{ fontFamily: interSemi, fontSize: 13, fontWeight: 600, color: "#1e40af" }}>Theoretical Justification: Self-Attention vs Recurrent Gating</span>
          </div>
          <p style={{ fontFamily: inter, fontSize: 13, color: "#1e3a8a", lineHeight: 1.7, margin: 0 }}>
            In extended misinformation articles, LSTM recurrent units suffer from progressive gradient attenuation and information bottlenecking across long token trajectories (≥2048 path length). Conversely, BERT's bidirectional multi-head self-attention models pairwise affinities in constant O(1/2) operations regardless of token position offset. This allows BERT to discern subtle syntactic manipulations, deceptive rhetorical framing, and disjointed factual claims that recurrent memory gates inevitably compress or discard.
          </p>
        </div>
      </div>
    </div>
  );
}

function formatMetricValue(key: string, value: number) {
  if (key === "test_loss") return `${value.toFixed(4)}`;
  if (value >= 1) return `${value.toFixed(2)}`;
  return `${(value * 100).toFixed(1)}%`;
}

function deriveVariance(lstmValue: number | null, bertValue: number | null) {
  if (lstmValue == null && bertValue == null) return "—";
  if (lstmValue == null || bertValue == null) return "—";
  const diff = Math.abs(bertValue - lstmValue);
  return `${(diff * 100).toFixed(1)} pts`;
}

function computeBarHeight(value: number | null, maxValue: number, base: number) {
  if (value == null || !Number.isFinite(value) || value <= 0) return 8;
  const ratio = value / maxValue;
  return Math.max(base, Math.min(100, ratio * 100));
}

function ModelOverviewCard({ tag, version, title, description, specs, tagColor }: {
  tag: string; version: string; title: string; description: string;
  specs: { label: string; val: string }[];
  tagColor: string;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: tagColor, background: `${tagColor}15`, border: `1px solid ${tagColor}40`, borderRadius: 4, padding: "2px 8px" }}>{tag}</span>
        <span style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af", marginLeft: "auto" }}>{version}</span>
      </div>
      <h3 style={{ fontFamily: interBold, fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 10px", lineHeight: 1.4 }}>{title}</h3>
      <p style={{ fontFamily: inter, fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: "0 0 14px" }}>{description}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {specs.filter(s => s.val).map(s => (
          <div key={s.label} style={{ background: "#f9fafb", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontFamily: inter, fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: "#374151" }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineCard({ title, tag, color, steps }: {
  title: string; tag: string; color: string;
  steps: { n: number; label: string; sub: string; badge?: string }[];
}) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: interSemi, fontSize: 13, fontWeight: 600, color: "#111827" }}>{title}</span>
        <span style={{ fontFamily: mono, fontSize: 10, color, background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 8px" }}>{tag}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: monoBold, fontSize: 10, flexShrink: 0 }}>{s.n}</div>
              {i < steps.length - 1 && <div style={{ width: 1, height: 16, background: "#e5e7eb", margin: "2px 0" }} />}
            </div>
            <div style={{ paddingBottom: i < steps.length - 1 ? 8 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: interMed, fontSize: 12, fontWeight: 500, color: "#111827" }}>{s.label}</span>
                {s.badge && <span style={{ fontFamily: mono, fontSize: 9, color, background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 4, padding: "1px 6px" }}>{s.badge}</span>}
              </div>
              {s.sub && <div style={{ fontFamily: inter, fontSize: 11, color: "#9ca3af" }}>{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
