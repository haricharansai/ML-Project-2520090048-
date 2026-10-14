const mono = '"JetBrains Mono:Medium", monospace';
const monoBold = '"JetBrains Mono:Bold", monospace';
const inter = '"Inter:Regular", Inter, sans-serif';
const interMed = '"Inter:Medium", Inter, sans-serif';
const interSemi = '"Inter:Semi Bold", Inter, sans-serif';
const interBold = '"Inter:Bold", Inter, sans-serif';

const techStack = [
  { icon: "🐍", name: "Python 3.10", sub: "Core scientific computing language", color: "#3b82f6" },
  { icon: "🔥", name: "PyTorch 2.3", sub: "Neural network training & inference", color: "#ef4444" },
  { icon: "🤗", name: "HuggingFace Transformers", sub: "BERT model weights & tokenizers", color: "#f59e0b" },
  { icon: "📐", name: "BERT", sub: "Transformer encoder", color: "#8b5cf6" },
  { icon: "🔁", name: "LSTM (Bi)", sub: "Recurrent memory", color: "#06b6d4" },
  { icon: "📊", name: "Scikit-Learn", sub: "Metrics & validation matrices", color: "#16a34a" },
  { icon: "⚡", name: "FastAPI 0.11", sub: "REST inference research interface", color: "#f97316" },
  { icon: "📈", name: "NLTK & SpaCy", sub: "Text preprocessing & normalization", color: "#6366f1" },
];

const objectives = [
  {
    n: "01", title: "Detect fake news using NLP linguistic, document and semantic parsing",
    desc: "Implements computational anomaly detection of linguistic anomalies, sentiment manipulation markers, and semantic inconsistencies across large-scale published datasets implementing multi-step string analysis and multi-headed attention layers.",
  },
  {
    n: "02", title: "Understand LSTM and BERT architectures using individual evaluation constraints",
    desc: "A process modelling cross-network differential recurrent memory against transformer-BERT-base-absence across multi-head attention boundaries and typologies.",
  },
  {
    n: "03", title: "Evaluate classification performance across Accuracy, Precision, Recall, and F1 score",
    desc: "Executes rigorous statistical test-partition results across networks with stratified 5-class to minimize false-positive classifications on nuanced satirical or editorial inputs.",
  },
  {
    n: "04", title: "Provide an easy-to-use prediction interface for real-time inference testing",
    desc: "Delivers a lightweight, interactive web-based browser allowing analysts to submit live claims, inspect informatics token salience heatmaps, and obtain near real-time model score comparisons.",
  },
];

const pipelineStages = [
  {
    n: "Stage 01", label: "Corpus Dataset", status: "COMPLETE",
    title: "Aggregation of current factual/fiction publications and content-distribution sets (~18.6K articles).",
  },
  {
    n: "Stage 02", label: "Pre-processing & Cleaning", status: "COMPLETE",
    title: "Non-alphabetic URL, ad-hoc filtering, concrete standardization, and NLP tag, sys-partition datasets.",
  },
  {
    n: "Stage 03", label: "Feature Processing & Tokenization", status: "IN PROGRESS",
    title: "Dual vectorization path: WordPiece subword embedding vectors for BERT via pre-trained GloVe embedding vectors for LSTM.",
  },
  {
    n: "Stage 04", label: "Dual Model Neural Results", status: "IN PROGRESS",
    title: "Project A: Bi-LSTMs    Project B: BERT-Base",
  },
  {
    n: "Stage 05", label: "Delta Softmax Collation", status: "PENDING",
    title: "Post-resolution process feeding tensor consensus metrics into combined binary probability distributions.",
  },
  {
    n: "Stage 06", label: "Evaluation & Reports", status: "PENDING",
    title: "Continuous logging of Posterior Result AUC alongside interactive upon addenda report to find entity.",
  },
];

export default function AboutProject() {
  return (
    <div>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: interBold, fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 3px" }}>About FakeLens</h1>
          <p style={{ fontFamily: inter, fontSize: 13, color: "#6b7280", margin: 0 }}>Academic project documentation, problem formulation, and comparative NLP methodology.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 12px", fontFamily: mono, fontSize: 11, color: "#16a34a" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />NLP Inference Engine: Ready
          </span>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Report ID banner */}
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 4, padding: "3px 10px", background: "#eff6ff" }}>★ Analytical NLP Evaluation</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: 4, padding: "3px 10px" }}>DOT: DTU-D-NLP-2022-43</span>
        </div>

        {/* Title block */}
        <div>
          <h2 style={{ fontFamily: interBold, fontSize: 28, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>
            FakeLens — NLP-Powered Fake News Detection
          </h2>
          <p style={{ fontFamily: inter, fontSize: 14, color: "#374151", lineHeight: 1.7, maxWidth: 700, margin: "0 0 14px" }}>
            FakeLens is an NLP-based Fake News Detection system that compares traditional recurrent neural networks with modern transformer-based language models. Designed to evaluate empirical boundaries between sequential recurrence and bidirectional self-attention mechanisms under controlled textual constraints.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              "🏛 Department of Computer Science & Engineering",
              "🔬 B.Tech Capstone Project",
              "⚙ Machine Learning & NLP Specialization",
              "👤 Advisor: Dr. A. Sharma",
            ].map(t => (
              <span key={t} style={{ fontFamily: mono, fontSize: 11, color: "#374151", border: "1px solid #e5e7eb", borderRadius: 20, padding: "4px 12px" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Two-column: problem + stack */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Problem statement */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>⊙</span>
                <span style={{ fontFamily: interSemi, fontSize: 14, fontWeight: 600, color: "#111827" }}>Problem Statement</span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af" }}>SEC 01 / MOTIVATION</span>
            </div>
            <p style={{ fontFamily: inter, fontSize: 13, color: "#374151", lineHeight: 1.7, margin: "0 0 14px" }}>
              The rapid democratization of digital publishing channels and algorithmically amplified social feeds has catalyzed an unprecedented crisis of automated misinformation dissemination. Malicious actors who chambers drastically amplify fabricated discourse before manual journalistic review can intervene.
            </p>
            <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 6, padding: "10px 14px", marginBottom: 14 }}>
              <p style={{ fontFamily: '"Inter:Medium Italic", Inter, sans-serif', fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                "Hyper-partisan clickbait and synthetic assertions exploit confirmation bias encoded in trigger emotional polarization while bypassing shallow keyword-frequency filters."
              </p>
            </div>
            <p style={{ fontFamily: inter, fontSize: 13, color: "#374151", lineHeight: 1.7, margin: "0 0 14px" }}>
              Human fact-checking organizations cannot scale linearly with this petabyte volumes of digital assertions generated daily. Consequently, automated linguistic context evaluation and deep contextual semantic parsing are critically required. There is a decisive need for optimized algorithmic systems capable of modeling deep textual dependencies to distinguish verifiable journalism reporting from deceptively crafted assertions.
            </p>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { val: "6.2x", label: "Inference Rate", sub: "faster-spread from truth" },
                { val: "44k+", label: "Newscast", sub: "annotated articles" },
                { val: "512", label: "Context Window", sub: "max-reviewed tokens" },
              ].map(s => (
                <div key={s.val} style={{ textAlign: "center", padding: 10, background: "#f9fafb", borderRadius: 6 }}>
                  <div style={{ fontFamily: monoBold, fontSize: 20, fontWeight: 700, color: "#111827" }}>{s.val}</div>
                  <div style={{ fontFamily: inter, fontSize: 10, color: "#9ca3af" }}>{s.label}</div>
                  <div style={{ fontFamily: inter, fontSize: 10, color: "#9ca3af" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>⚙</span>
                <span style={{ fontFamily: interSemi, fontSize: 14, fontWeight: 600, color: "#111827" }}>Technologies & Stack</span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af" }}>SEC 03 / DEPENDENCIES</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {techStack.map(t => (
                <div key={t.name} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", border: "1px solid #f3f4f6", borderRadius: 6 }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontFamily: interMed, fontSize: 12, fontWeight: 500, color: "#111827" }}>{t.name}</div>
                    <div style={{ fontFamily: inter, fontSize: 10, color: "#9ca3af" }}>{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Architecture */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#111827" }}>System Architecture Online</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af" }}>SEC 03 / BITS</span>
              </div>
              {pipelineStages.map(s => (
                <div key={s.n} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <div style={{
                    padding: "2px 8px", borderRadius: 4, fontFamily: mono, fontSize: 10, flexShrink: 0,
                    background: s.status === "COMPLETE" ? "#dcfce7" : s.status === "IN PROGRESS" ? "#fef9c3" : "#f3f4f6",
                    color: s.status === "COMPLETE" ? "#166534" : s.status === "IN PROGRESS" ? "#92400e" : "#6b7280",
                  }}>{s.status === "COMPLETE" ? "✓" : s.status === "IN PROGRESS" ? "⟳" : "○"}</div>
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af" }}>{s.n}: {s.label}</div>
                    <div style={{ fontFamily: inter, fontSize: 12, color: "#374151" }}>{s.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core objectives */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>🎯</span>
              <span style={{ fontFamily: interSemi, fontSize: 15, fontWeight: 600, color: "#111827" }}>Core Objectives</span>
            </div>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af" }}>SEC 02 / MILESTONES</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {objectives.map(o => (
              <div key={o.n} style={{ display: "flex", gap: 12, padding: 14, border: "1px solid #f3f4f6", borderRadius: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: monoBold, fontSize: 11, color: "#2563eb", flexShrink: 0 }}>{o.n}</div>
                <div>
                  <div style={{ fontFamily: interSemi, fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{o.title}</div>
                  <div style={{ fontFamily: inter, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{o.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ethics */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>⚖</span>
              <span style={{ fontFamily: interSemi, fontSize: 14, fontWeight: 600, color: "#111827" }}>Project Scope, Ethical Considerations & Limitations</span>
            </div>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af" }}>SEC 04 / ETHICS & CONSIDERED</span>
          </div>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, marginBottom: 14 }}>
            <div style={{ fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#991b1b", marginBottom: 4 }}>⚠ Mandatory Scientific Disclaimer</div>
            <p style={{ fontFamily: inter, fontSize: 12, color: "#7f1d1d", lineHeight: 1.6, margin: 0 }}>
              FakeLens predicts statistical patterns learned from its training data. A model prediction is an algorithmic estimate of textual similarity to historical misinformation corpus and is not equivalent to professional fact-checking, ground-truth verification, or human journalistic investigation.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { icon: "⊡", label: "Distribution Shift", color: "#f59e0b", desc: "Susceptibility to out-of-domain content distributions; Models evaluated against design class demarcations when presented with medical, geopolitical, or financial rumours." },
              { icon: "⊙", label: "Temporal Knowledge Decay", color: "#6366f1", desc: "Temporal decay of evolving factual content. Without continuous knowledge-graph augmentation, training on older news stories with changing contexts can trigger outdated feature weightings." },
              { icon: "⊞", label: "Explainability Latency", color: "#0369a1", desc: "Underlying limitations of deep attention embeddings. While attention maps highlight high-salience tokens, correlation between attention weights and causality remain an active ongoing NLP debate." },
            ].map(c => (
              <div key={c.label} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ color: c.color }}>{c.icon}</span>
                  <span style={{ fontFamily: interSemi, fontSize: 12, fontWeight: 600, color: "#111827" }}>{c.label}</span>
                </div>
                <p style={{ fontFamily: inter, fontSize: 12, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Citation + actions */}
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af", marginBottom: 4 }}>★ ACADEMIC CITATION FORMAT</div>
            <p style={{ fontFamily: mono, fontSize: 11, color: "#374151", margin: 0 }}>
              Sharma et al. (2024). "Comparative Study of Recurrent vs Transformer for Textual Deception Detection." B.Tech Thesis, CSE Dept.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ fontFamily: mono, fontSize: 11, padding: "7px 14px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              🔗 Github Repository
            </button>
            <button style={{ fontFamily: mono, fontSize: 11, padding: "7px 14px", border: "none", borderRadius: 6, background: "#2563eb", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              ↓ Download Thesis PDF
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontFamily: mono, fontSize: 10, color: "#9ca3af", textAlign: "center" }}>
          FakeLens NLP Research Platform · Department of Computer Science & Engineering · INTERN: 2024-05-14 · TRANSCRIPT: 2024-05-14
        </div>
      </div>
    </div>
  );
}
