export default function StepsSection({ dark }) {
  const steps = [
    {
      num: "01",
      title: "Enter your courses",
      desc: "Add course names, credit units, exam dates and how confident you feel in each one.",
    },
    {
      num: "02",
      title: "Get your schedule",
      desc: "The priority engine scores each course and builds a topic-by-topic daily plan for you.",
    },
    {
      num: "03",
      title: "Track and adjust",
      desc: "Mark topics done at the end of each day. Rollover happens automatically.",
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 2rem" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: dark ? "#8a8880" : "#5a5854", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>
        How it works
      </p>
      <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: 40, color: dark ? "#f0ede6" : "#1a1a1a" }}>
        Up and running in 3 steps
      </h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {steps.map((s, i) => (
          <div
            key={s.num}
            style={{
              display: "flex",
              gap: 24,
              padding: "24px 0",
              borderBottom: i < steps.length - 1 ? `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` : "none",
            }}
          >
            <span style={{ color: "#2563eb", fontWeight: 800, fontSize: 13, width: 28, flexShrink: 0, paddingTop: 2 }}>
              {s.num}
            </span>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: dark ? "#f0ede6" : "#1a1a1a" }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 14, color: dark ? "#8a8880" : "#666", lineHeight: 1.65 }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}