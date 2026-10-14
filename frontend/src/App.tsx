import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import DetectNews from "./pages/DetectNews";
import ModelComparison from "./pages/ModelComparison";
import Analytics from "./pages/Analytics";
import AboutProject from "./pages/AboutProject";
import { apiHealth, type HealthResponse, type ModelInfo } from "./api/client";

type Page = "dashboard" | "detect" | "comparison" | "analytics" | "about";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    apiHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  const engineStatus = health
    ? (() => {
      const models = health.models as Record<string, ModelInfo>;
      if (Object.values(models).some((m) => m.loaded)) return "Ready";
      if (Object.values(models).some((m) => m.available)) return "Loading";
      return "Not trained";
    })()
    : "Unknown";

  return (
    <div style={{ display: "flex", height: "100%", background: "#f8f9fa", fontFamily: '"Inter:Regular", Inter, sans-serif' }}>
      <Sidebar page={page} setPage={setPage} engineStatus={engineStatus} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {page === "dashboard" && <Dashboard setPage={setPage} engineStatus={engineStatus} />}
        {page === "detect" && <DetectNews engineStatus={engineStatus} />}
        {page === "comparison" && <ModelComparison />}
        {page === "analytics" && <Analytics />}
        {page === "about" && <AboutProject />}
      </main>
    </div>
  );
}

function Sidebar({ page, setPage, engineStatus }: { page: Page; setPage: (p: Page) => void; engineStatus: string }) {
  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "detect", label: "Detect News", icon: "⟳" },
    { id: "comparison", label: "Model Comparison", icon: "⇄" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "about", label: "About Project", icon: "⊙" },
  ];

  return (
    <aside style={{
      width: 200,
      background: "#fff",
      borderRight: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, background: "#2563eb", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, fontFamily: '"Inter:Bold", Inter, sans-serif', fontWeight: 700,
          }}>F</div>
          <div>
            <div style={{ fontFamily: '"Inter:Bold", Inter, sans-serif', fontWeight: 700, fontSize: 13, color: "#111827" }}>FakeLens</div>
            <div style={{ fontFamily: '"JetBrains Mono:Medium", monospace', fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI NEWS INTELLIGENCE</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "8px 10px", borderRadius: 6,
                border: "none", cursor: "pointer", textAlign: "left",
                background: active ? "#eff6ff" : "transparent",
                color: active ? "#2563eb" : "#374151",
                fontFamily: '"Inter:Medium", Inter, sans-serif', fontWeight: 500,
                fontSize: 13, marginBottom: 2,
              }}
            >
              <NavIcon id={item.id} active={active} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 8px" }}>
        <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: engineStatus === "Ready" ? "#22c55e" : "#f59e0b" }} />
          <span style={{ fontFamily: '"JetBrains Mono:Regular", monospace', fontSize: 11, color: "#6b7280" }}>v2.4-academic</span>
          <span style={{ fontFamily: '"JetBrains Mono:Regular", monospace', fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>NLP-L4</span>
        </div>
      </div>
    </aside>
  );
}

function NavIcon({ id, active }: { id: Page; active: boolean }) {
  const color = active ? "#2563eb" : "#6b7280";
  const size = 15;
  if (id === "dashboard") return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3" />
      <rect x="9" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3" />
      <rect x="1" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3" />
      <rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.3" />
    </svg>
  );
  if (id === "detect") return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke={color} strokeWidth="1.3" />
      <path d="M11 11l3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
  if (id === "comparison") return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 8h12M10 5l3 3-3 3M6 5L3 8l3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (id === "analytics") return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="9" width="3" height="5" rx="0.5" fill={color} />
      <rect x="6.5" y="6" width="3" height="8" rx="0.5" fill={color} />
      <rect x="11" y="3" width="3" height="11" rx="0.5" fill={color} />
    </svg>
  );
  if (id === "about") return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.3" />
      <path d="M8 7v5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.8" fill={color} />
    </svg>
  );
  return null;
}