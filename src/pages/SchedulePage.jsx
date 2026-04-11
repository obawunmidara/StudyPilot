import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SchedulePage() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);

  const scheduleData = {
    "2026-04-02": [
      { course: "CSC 425", topic: "Process scheduling", difficulty: "Hard", time: "1hr", done: true },
      { course: "MAT 201", topic: "Linear transformations", difficulty: "Hard", time: "2hr", done: false },
    ],
    "2026-04-03": [
      { course: "PHY 305", topic: "Electromagnetic induction", difficulty: "Medium", time: "1hr", done: false },
      { course: "ENG 301", topic: "Technical report structure", difficulty: "Easy", time: "30min", done: false },
    ],
    "2026-04-04": [
      { course: "MAT 201", topic: "Eigenvalues and eigenvectors", difficulty: "Hard", time: "2hr", done: false },
    ],
    "2026-04-05": [],
    "2026-04-06": [
      { course: "CSC 301", topic: "Database normalization", difficulty: "Medium", time: "1hr", done: false },
      { course: "STA 201", topic: "Probability distributions", difficulty: "Medium", time: "1hr", done: false },
    ],
    "2026-04-07": [
      { course: "PHY 305", topic: "Maxwell equations", difficulty: "Hard", time: "2hr", done: false },
    ],
    "2026-04-08": [
      { course: "ENG 301", topic: "Research methodology", difficulty: "Easy", time: "30min", done: false },
      { course: "CSC 425", topic: "Virtual memory", difficulty: "Hard", time: "1hr", done: false },
    ],
    "2026-04-09": [
      { course: "MAT 201", topic: "Vector spaces", difficulty: "Hard", time: "2hr", done: false },
    ],
    "2026-04-10": [
      { course: "CSC 301", topic: "SQL joins", difficulty: "Medium", time: "1hr", done: false },
    ],
    "2026-04-11": [],
    "2026-04-12": [
      { course: "PHY 305", topic: "Quantum mechanics intro", difficulty: "Hard", time: "2hr", done: false },
    ],
    "2026-04-13": [
      { course: "ENG 301", topic: "Academic writing", difficulty: "Easy", time: "30min", done: false },
    ],
    "2026-04-14": [
      { course: "MAT 201", topic: "Matrix diagonalization", difficulty: "Hard", time: "2hr", done: false },
    ],
  };

  const diffStyle = (d) => ({
    Hard: { background: "#fee2e2", color: "#dc2626" },
    Medium: { background: "#fef9c3", color: "#a16207" },
    Easy: { background: "#dcfce7", color: "#16a34a" },
  }[d]);

  const getWeekDays = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const formatKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isToday = (date) => formatKey(date) === formatKey(new Date());
  const isPast = (date) => date < new Date() && !isToday(date);

  const weekDays = getWeekDays();

  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const DayCard = ({ day }) => {
    const key = formatKey(day);
    const dayTopics = scheduleData[key] || [];
    const past = isPast(day);
    const today = isToday(day);

    return (
      <div style={{
        background: today ? "#eff6ff" : "#fff",
        borderRadius: 16,
        border: today ? "1.5px solid #2563eb" : "1px solid #f0f0f0",
        padding: "14px 12px",
        opacity: past ? 0.5 : 1,
        minHeight: 160,
      }}>
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: today ? "#2563eb" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {day.toLocaleDateString("en-US", { weekday: "short" })}
          </p>
          <p style={{ fontSize: 18, fontWeight: 800, color: today ? "#2563eb" : "#111" }}>
            {day.getDate()}
          </p>
          {today && (
            <span style={{ fontSize: 10, fontWeight: 700, background: "#2563eb", color: "#fff", padding: "1px 6px", borderRadius: 6 }}>
              TODAY
            </span>
          )}
        </div>

        {dayTopics.length === 0 ? (
          <p style={{ fontSize: 11, color: "#d1d5db", fontWeight: 500 }}>Rest day</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {dayTopics.map((t, i) => (
              <div key={i} style={{ background: "#fafafa", borderRadius: 8, padding: "6px 8px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 1 }}>{t.course}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: t.done ? "#9ca3af" : "#111", textDecoration: t.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.topic}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, ...diffStyle(t.difficulty) }}>
                    {t.difficulty}
                  </span>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 2rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ color: "#2563eb", fontWeight: 800, fontSize: 17 }}>🛫 StudyPilot</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span onClick={() => navigate("/dashboard")} style={{ fontSize: 13, color: "#9ca3af", cursor: "pointer", fontWeight: 500 }}>
            Dashboard
          </span>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
            T
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f0f0f", letterSpacing: "-0.5px", marginBottom: 4 }}>
              Your schedule
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>{weekLabel}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setWeekOffset(0)}
              style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: weekOffset === 0 ? "#2563eb" : "transparent", color: weekOffset === 0 ? "#fff" : "#6b7280", cursor: "pointer" }}
            >
              This week
            </button>
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e5e7eb", background: "transparent", color: "#6b7280", cursor: "pointer", fontSize: 16 }}
            >
              ←
            </button>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e5e7eb", background: "transparent", color: "#6b7280", cursor: "pointer", fontSize: 16 }}
            >
              →
            </button>
          </div>
        </div>

        {/* Desktop — 2 rows of 4 then 3 */}
        <div style={{ display: "none" }} className="desktop-grid">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
            {weekDays.slice(0, 4).map((day, i) => <DayCard key={i} day={day} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {weekDays.slice(4).map((day, i) => <DayCard key={i} day={day} />)}
          </div>
        </div>

        {/* Responsive grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {weekDays.map((day, i) => <DayCard key={i} day={day} />)}
        </div>

      </div>
    </div>
  );
}