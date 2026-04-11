export default function FeatureGrid({ dark }) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 2rem" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: dark ? "#8a8880" : "#5a5854", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>
        Features
      </p>
      <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: 40, color: dark ? "#f0ede6" : "#1a1a1a", textAlign: "left" }}>
        Everything you need to ace your exams
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 640 ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
        {[
          { icon: "📅", title: "Smart scheduling", desc: "Generates daily topic plans based on your exam countdown and course weight." },
          { icon: "⚖️", title: "Priority engine", desc: "Ranks courses by urgency, units, and your confidence level automatically." },
          { icon: "🔁", title: "Adaptive rebalance", desc: "Missed a session? StudyPilot reshuffles your plan so nothing falls behind." },
          { icon: "📊", title: "Progress tracking", desc: "See completion percentage per course and your study streak at a glance." },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              background: dark ? "#1c1b19" : "#f7f7f7",
              borderRadius: 20,
              padding: "22px 20px",
              transition: "transform 0.2s",
              cursor: "default",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: dark ? "#f0ede6" : "#1a1a1a" }}>
              {f.title}
            </h3>
            <p style={{ fontSize: 13, color: dark ? "#8a8880" : "#666", lineHeight: 1.65 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}