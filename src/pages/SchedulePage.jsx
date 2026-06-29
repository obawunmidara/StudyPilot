import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../FireBase";

export default function SchedulePage() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);

      try {
        // Fetch all topics for this user
        const topicsQuery = query(
          collection(db, "topics"),
          where("userId", "==", currentUser.uid)
        );
        const topicsSnapshot = await getDocs(topicsQuery);
        const topicsData = {};
        topicsSnapshot.docs.forEach(doc => {
          topicsData[doc.id] = { id: doc.id, ...doc.data() };
        });

        // Fetch all daily plans for this user
        const plansQuery = query(
          collection(db, "dailyPlans"),
          where("userId", "==", currentUser.uid)
        );
        const plansSnapshot = await getDocs(plansQuery);

        // Build schedule data — date key → array of topics
        const schedule = {};
        plansSnapshot.docs.forEach(doc => {
          const plan = doc.data();
          const date = plan.date;
          if (!schedule[date]) schedule[date] = [];
          const planTopics = (plan.topics || [])
            .map(topicId => topicsData[topicId])
            .filter(Boolean);
          schedule[date] = [...schedule[date], ...planTopics];
        });

        setScheduleData(schedule);
      } catch (err) {
        console.error("Error fetching schedule:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const diffStyle = (difficulty) => {
    if (difficulty >= 4) return { background: "#fee2e2", color: "#dc2626" };
    if (difficulty >= 3) return { background: "#fef9c3", color: "#a16207" };
    return { background: "#dcfce7", color: "#16a34a" };
  };

  const diffLabel = (difficulty) => {
    if (difficulty >= 4) return "Hard";
    if (difficulty >= 3) return "Medium";
    return "Easy";
  };

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
          <p style={{ fontSize: 11, color: "#d1d5db", fontWeight: 500 }}>No plan yet</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {dayTopics.map((t, i) => (
              <div key={i} style={{ background: "#fafafa", borderRadius: 8, padding: "6px 8px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 1 }}>{t.courseName}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: t.status === "done" ? "#9ca3af" : "#111", textDecoration: t.status === "done" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.name}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, ...diffStyle(t.difficulty) }}>
                    {diffLabel(t.difficulty)}
                  </span>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>{t.estimatedTime}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading your schedule...</p>
      </div>
    );
  }

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
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", background: "transparent", border: "none", cursor: "pointer" }}
          >
            Logout
          </button>
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

        {/* Schedule grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {weekDays.map((day, i) => <DayCard key={i} day={day} />)}
        </div>

      </div>
    </div>
  );
}