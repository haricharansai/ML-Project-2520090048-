import { useState, useEffect } from "react";
import { apiHealth, type HealthResponse, type ModelInfo, apiPredict, type PredictResponse } from "../api/client";

const mono = '"JetBrains Mono:Medium", monospace';
const monoBold = '"JetBrains Mono:Bold", monospace';
const monoReg = '"JetBrains Mono:Regular", monospace';
const inter = '"Inter:Regular", Inter, sans-serif';
const interMed = '"Inter:Medium", Inter, sans-serif';
const interSemi = '"Inter:Semi Bold", Inter, sans-serif';
const interBold = '"Inter:Bold", Inter, sans-serif';

type ModelSel = "both" | "bert" | "lstm";

const SAMPLE_FAKE = `BREAKING: Shocking revelation as anonymous cabinet insider leaks classified memorandum indicating nationwide covert emergency restrictions. Unconfirmed sources verify leaked documents disclose massive undocumented operations without parliamentary consent. Citizens urged to share immediately before algorithmic blackout.`;
const SAMPLE_REAL = `The Federal Reserve raised interest rates by 0.25 percentage points on Wednesday, as expected by most economists. Chair Jerome Powell indicated that further increases may be necessary to bring inflation back to the 2% target. Markets responded cautiously, with the S&P 500 closing down 0.4%.`;
const SAMPLE_SUSPICIOUS = `Scientists have FINALLY discovered what governments don't want you to know about 5G towers. A study published by independent researchers claims to have found evidence linking mobile networks to behavioral modification, though the findings have not been peer-reviewed or replicated.`;

export default function DetectNews({ engineStatus }: { engineStatus?: string }) {
  const [text, setText] = useState("");
  const [model, setModel] = useState<ModelSel>("both");
  const [viewState, setViewState] = useState<"empty" | "loading" | "error" | "results">("empty");
  const [predictions, setPredictions] = useState<PredictResponse | null>(null);
  const [error, setError] = useState("");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    apiHealth().then(setHealth).catch(() => { }).finally(() => setLoadingHealth(false));
  }, []);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const isModelAvailable = (m: "bert" | "lstm") => {
    if (!health || !health.models) return false;
    return health.models[m]?.available ?? false;
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setViewState("loading");
    setPredictions(null);
    setError("");
    try {
      const result = await apiPredict(text, model);
      setPredictions(result);
      setViewState("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed");
      setViewState("error");
    }
  };

  const loadSample = (sample: string) => {
    setText(sample);
    setViewState("empty");
    setPredictions(null);
    setError("");
  };

  return (
    <div>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: interBold, fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 3px" }}>Detect News</h1>
          <p style={{ fontFamily: inter, fontSize: 13, color: "#6b7280", margin: 0 }}>Enter news content and evaluate its authenticity using trained NLP models.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, background: engineStatus === "Ready" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${engineStatus === "Ready" ? "#bbf7d0" : "#fecaca"}`, borderRadius: 20, padding: "4px 12px", fontFamily: mono, fontSize: 11, color: engineStatus === "Ready" ? "#16a34a" : "#dc2626" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: engineStatus === "Ready" ? "#16a34a" : "#dc2626", display: "inline-block" }} />NLP Inference Engine: {engineStatus || "Loading..."}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 130px)", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="#2563eb" strokeWidth="1.3" /><path d="M5 6h6M5 8h4" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" /></svg>
              <span style={{ fontFamily: interSemi, fontSize: 14, fontWeight: 600, color: "#111827" }}>News Content Input</span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: inter, fontSize: 12, color: "#9ca3af", marginRight: 8 }}>Presets:</span>
              {[
                { label: "Sample Real News", fn: () => loadSample(SAMPLE_REAL) },
                { label: "Sample Suspicious Headline", fn: () => loadSample(SAMPLE_SUSPICIOUS) },
                { label: "Sample Political Claim", fn: () => loadSample(SAMPLE_FAKE) },
              ].map(p => (
                <button key={p.label} onClick={p.fn} style={{
                  fontFamily: mono, fontSize: 10, padding: "3px 9px", borderRadius: 4,
                  border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", marginRight: 6, color: "#374151",
                }}>{p.label}</button>
              ))}
            </div>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter or paste article text, claim, or press release..."
              maxLength={5000}
              style={{
                width: "100%", height: 200, border: "1px solid #d1d5db", borderRadius: 6,
                padding: "12px 14px", fontFamily: inter, fontSize: 13, color: "#374151",
                resize: "none", outline: "none", lineHeight: 1.7,
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: "#6b7280" }}>Character count: <strong>{charCount}</strong> / 5,000</span>
                <span style={{ fontFamily: mono, fontSize: 11, color: "#6b7280" }}>Word count: <strong>{wordCount}</strong> words</span>
              </div>
              {text && <button onClick={() => { setText(""); setViewState("empty"); setPredictions(null); setError(""); }} style={{ background: "none", border: "none", fontFamily: mono, fontSize: 11, color: "#9ca3af", cursor: "pointer" }}>⊘ Clear</button>}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#2563eb" strokeWidth="1.3" /><path d="M5 8h6M8 5v6" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" /></svg>
                <span style={{ fontFamily: interSemi, fontSize: 14, fontWeight: 600, color: "#111827" }}>Model Architecture Selection</span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 10, color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 4, padding: "2px 8px" }}>Dual-Tower Inference</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { id: "both" as ModelSel, tag: "Dual Tower", title: "Compare Both", sub: "(LSTM + BERT)", desc: "Recommended for research cross-validation and discrepancy auditing." },
                { id: "bert" as ModelSel, tag: "Transformer", title: "BERT Base", sub: "Bidirectional Attention", desc: "Contextual token embeddings with self-attention weight heads." },
                { id: "lstm" as ModelSel, tag: "Recurrent", title: "Bi-LSTM", sub: "Sequential Memory", desc: "Forward/backward cell state memory for sequential syntax patterns." },
              ].map(m => {
                const sel = model === m.id;
                const disabled = (m.id === "bert" && !isModelAvailable("bert")) || (m.id === "lstm" && !isModelAvailable("lstm"));
                return (
                  <button key={m.id} onClick={() => setModel(m.id)} disabled={disabled} style={{
                    textAlign: "left", padding: 14, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
                    border: sel ? "2px solid #2563eb" : "1px solid #e5e7eb",
                    background: sel ? "#eff6ff" : "#fff",
                    opacity: disabled ? 0.4 : 1,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #2563eb", background: sel ? "#2563eb" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {sel && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
                      </div>
                      <span style={{ fontFamily: mono, fontSize: 10, color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 4, padding: "1px 6px", background: "#eff6ff" }}>{m.tag}</span>
                    </div>
                    <div style={{ fontFamily: interBold, fontSize: 13, fontWeight: 700, color: "#111827" }}>{m.title}</div>
                    <div style={{ fontFamily: mono, fontSize: 10, color: "#2563eb", marginBottom: 4 }}>{m.sub}</div>
                    <div style={{ fontFamily: inter, fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{m.desc}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 12, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1" stroke="#9ca3af" strokeWidth="1" /></svg>
              <span style={{ fontFamily: mono, fontSize: 11, color: "#6b7280" }}>Advanced Inference Parameters & Engine Configuration</span>
              <svg style={{ marginLeft: "auto" }} width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" /></svg>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || viewState === "loading"}
            style={{
              width: "100%", padding: 14, background: text.trim() && viewState !== "loading" ? "#2563eb" : "#93c5fd",
              border: "none", borderRadius: 8, color: "#fff",
              fontFamily: interSemi, fontSize: 14, fontWeight: 600, cursor: text.trim() && viewState !== "loading" ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {viewState === "loading" ? "⟳ Analyzing..." : "🔍 Analyze Article"}
          </button>

          <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 10 }}>
            <span style={{ color: "#92400e" }}>🛡</span>
            <p style={{ fontFamily: inter, fontSize: 12, color: "#78350f", lineHeight: 1.6, margin: 0 }}>
              <strong>Academic & Peer Review Disclaimer:</strong> This NLP evaluation engine uses statistical transformer self-attention and recurrent sequence modeling. Probability scores represent linguistic pattern similarity with annotated research benchmarks and do not represent actual legal or journalistic verification.
            </p>
          </div>
        </div>

        <div style={{ width: 340, borderLeft: "1px solid #e5e7eb", overflowY: "auto", padding: 20, background: "#fff" }}>
          {viewState === "empty" ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#d1d5db" }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="#e5e7eb" strokeWidth="2" /><path d="M16 24h16M24 16v16" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" /></svg>
              <p style={{ fontFamily: inter, fontSize: 13, textAlign: "center", marginTop: 16, color: "#9ca3af" }}>Enter article text and click Analyze to see predictions.</p>
            </div>
          ) : viewState === "loading" ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <p style={{ fontFamily: inter, fontSize: 13, textAlign: "center", marginTop: 16 }}>Running inference...</p>
            </div>
          ) : viewState === "error" ? (
            <div style={{ padding: 16, background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
              <div style={{ fontFamily: interSemi, fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 8 }}>Prediction Error</div>
              <p style={{ fontFamily: inter, fontSize: 13, color: "#7f1d1d", lineHeight: 1.6, margin: 0 }}>{error}</p>
            </div>
          ) : (
            <ResultsPanel predictions={predictions} />
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsPanel({ predictions }: { predictions: PredictResponse | null }) {
  if (!predictions) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h3 style={{ fontFamily: '"Inter:Semi Bold", Inter, sans-serif', fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 3px" }}>Prediction Analysis & Model Agreement</h3>
        <p style={{ fontFamily: '"Inter:Regular", Inter, sans-serif', fontSize: 12, color: "#9ca3af", margin: "0 0 6px" }}>Real-time cross-architecture inference</p>
        <span style={{ fontFamily: '"JetBrains Mono:Medium", monospace', fontSize: 10, color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 4, padding: "2px 7px" }}>Dual Eval</span>
      </div>

      {predictions.predictions.length > 1 && (
        <div style={{ background: predictions.agreement ? "#f0fdf4" : "#fefce8", border: `1px solid ${predictions.agreement ? "#bbf7d0" : "#fde68a"}`, borderRadius: 8, padding: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span>{predictions.agreement ? "✓" : "⚠"}</span>
            <div>
              <div style={{ fontFamily: '"JetBrains Mono:Medium", monospace', fontSize: 11, fontWeight: 600, color: predictions.agreement ? "#16a34a" : "#92400e" }}>
                Models {predictions.agreement ? "Agree" : "Disagree"}
              </div>
              <p style={{ fontFamily: '"Inter:Regular", Inter, sans-serif', fontSize: 12, color: "#374151", margin: "4px 0 0", lineHeight: 1.5 }}>
                {predictions.agreement
                  ? "Both models agree on the classification."
                  : "Models disagree — consider reviewing the input text."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {predictions.predictions.map(p => (
          <div key={p.model} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: '"JetBrains Mono:Medium", monospace', fontSize: 11, background: "#f3f4f6", borderRadius: 4, padding: "2px 7px" }}>{p.model.toUpperCase()}</span>
            </div>
            <div style={{ fontFamily: '"Inter:Semi Bold", Inter, sans-serif', fontSize: 11, color: p.label === "fake" ? "#dc2626" : "#16a34a", marginBottom: 2 }}>{p.label.toUpperCase()}</div>
            <div style={{ fontFamily: '"JetBrains Mono:Bold", monospace', fontSize: 24, fontWeight: 700, color: p.label === "fake" ? "#dc2626" : "#16a34a" }}>{p.confidence}</div>
            <div style={{ fontFamily: '"Inter:Regular", Inter, sans-serif', fontSize: 10, color: "#9ca3af", marginBottom: 8 }}>
              Confidence Score
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}