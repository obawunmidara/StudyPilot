export default function FooterSection({ dark }) {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "40px 2rem 60px",
        borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        fontSize: 13,
        color: dark ? "#8a8880" : "#999",
        transition: "all 0.3s",
      }}
    >
      Built with purpose ·{" "}
      <span style={{ color: "#2563eb", fontWeight: 600 }}>StudyPilot</span>{" "}
      · Your exams won't know what hit them
    </footer>
  );
}