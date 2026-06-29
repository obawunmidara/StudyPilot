import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  collection, query, where,
} from "firebase/firestore";
import { auth, db } from "../FireBase";
import { calculatePriorityScore, getCourseProgress, checkAtRisk } from "../utils/priorityEngine";

const styles = {
  light: {
    bg: "#fafafa",
    card: "#ffffff",
    border: "#e5e7eb",
    text: "#111827",
    subtext: "#6b7280",
    accent: "#2563eb",
    accentLight: "#eff6ff",
    danger: "#ef4444",
    dangerLight: "#fef2f2",
    success: "#10b981",
    successLight: "#ecfdf5",
    warning: "#f59e0b",
    warningLight: "#fffbeb",
    navBg: "#ffffff",
    modalOverlay: "rgba(0,0,0,0.4)",
    inputBg: "#f9fafb",
    hardBg: "#fef2f2",
    medBg: "#fffbeb",
    easyBg: "#ecfdf5",
  },
  dark: {
    bg: "#0f172a",
    card: "#1e293b",
    border: "#334155",
    text: "#f1f5f9",
    subtext: "#94a3b8",
    accent: "#3b82f6",
    accentLight: "#1e3a5f",
    danger: "#f87171",
    dangerLight: "#450a0a",
    success: "#34d399",
    successLight: "#064e3b",
    warning: "#fbbf24",
    warningLight: "#451a03",
    navBg: "#1e293b",
    modalOverlay: "rgba(0,0,0,0.6)",
    inputBg: "#0f172a",
    hardBg: "#450a0a",
    medBg: "#451a03",
    easyBg: "#064e3b",
  },
};

function getDaysUntilExam(examDate) {
  if (!examDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  return Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
}

export default function CoursePage({ darkMode, setDarkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const s = darkMode ? styles.dark : styles.light;

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);

  // Add topic modal
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", difficulty: "medium", timeValue: 1 });
  const [saving, setSaving] = useState(false);

  // Confidence update
  const [confidence, setConfidence] = useState(3);
  const [savingConf, setSavingConf] = useState(false);
  const [confSaved, setConfSaved] = useState(false);

  // Delete confirm
  const [deleteTopicId, setDeleteTopicId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { navigate("/login"); return; }
      setUser(firebaseUser);
      await loadData(firebaseUser.uid);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  async function loadData(uid) {
    try {
      const courseSnap = await getDoc(doc(db, "courses", id));
      if (!courseSnap.exists()) { navigate("/dashboard"); return; }
      const courseData = { id: courseSnap.id, ...courseSnap.data() };
      setCourse(courseData);
      setConfidence(courseData.confidence || 3);

      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        setPreferences(userSnap.data());
      }

      const tSnap = await getDocs(
        query(collection(db, "topics"), where("courseId", "==", id))
      );
      const loadedTopics = tSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log("Topics loaded:", loadedTopics.length, loadedTopics);
      setTopics(loadedTopics);
    } catch (err) {
      console.error("loadData error:", err);
    }
  }

  async function handleAddTopic() {
    if (!newTopic.title.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "topics"), {
        ...newTopic,
        courseId: id,
        userId: user.uid,
        status: "pending",
        createdAt: new Date(),
      });
      setShowAddTopic(false);
      setNewTopic({ title: "", difficulty: "medium", timeValue: 1 });
      await loadData(user.uid);
    } catch (err) {
      console.error("addTopic error:", err);
    }
    setSaving(false);
  }

  async function handleDeleteTopic(topicId) {
    try {
      await deleteDoc(doc(db, "topics", topicId));
      setDeleteTopicId(null);
      await loadData(user.uid);
    } catch (err) {
      console.error("deleteTopic error:", err);
    }
  }

  async function handleTopicStatusToggle(topic) {
    const newStatus = topic.status === "done" ? "pending" : "done";
    try {
      await updateDoc(doc(db, "topics", topic.id), { status: newStatus });
      setTopics((prev) => prev.map((t) => t.id === topic.id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error("toggleStatus error:", err);
    }
  }

  async function handleConfidenceUpdate() {
    setSavingConf(true);
    try {
      await updateDoc(doc(db, "courses", id), { confidence });
      setCourse((prev) => ({ ...prev, confidence }));
      setConfSaved(true);
      setTimeout(() => setConfSaved(false), 2000);
    } catch (err) {
      console.error("confidenceUpdate error:", err);
    }
    setSavingConf(false);
  }

  async function handleDeleteCourse() {
    try {
      // delete all topics first
      for (const t of topics) {
        await deleteDoc(doc(db, "topics", t.id));
      }
      await deleteDoc(doc(db, "courses", id));
      navigate("/dashboard");
    } catch (err) {
      console.error("deleteCourse error:", err);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${s.border}`, borderTop: `3px solid ${s.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: s.subtext, fontSize: 14 }}>Loading course...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!course) return null;

  const daysLeft = getDaysUntilExam(course.examDate);
  
  const remainingTopics = topics.filter((t) => t.status !== "done");
  const isOverloaded = daysLeft !== null && daysLeft > 0 && checkAtRisk(course, remainingTopics, preferences);
  
  const isAtRisk = daysLeft !== null && daysLeft <= 7;
  const isWatch = daysLeft !== null && daysLeft <= 14 && daysLeft > 7;
  const doneTopics = topics.filter((t) => t.status === "done").length;
  const totalTopics = topics.length;
  const progressPct = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;
  const isCompleted = totalTopics > 0 && doneTopics === totalTopics;

  const difficultyGroups = {
    hard: topics.filter((t) => t.difficulty === "hard"),
    medium: topics.filter((t) => t.difficulty === "medium"),
    easy: topics.filter((t) => t.difficulty === "easy"),
  };

  return (
    <div style={{ minHeight: "100vh", background: s.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: s.text }}>

      {/* ── Navbar ── */}
      <nav style={{ background: s.navBg, borderBottom: `1px solid ${s.border}`, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ background: "transparent", border: `1px solid ${s.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: s.subtext, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            ← Dashboard
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: s.text }}>{course.name}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Overloaded Banner ── */}
        {isOverloaded && !isCompleted && (
          <div style={{ background: s.dangerLight, border: `1px solid ${s.danger}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: s.danger, fontSize: 14 }}>Too Much Workload!</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: s.danger, opacity: 0.8 }}>
                You have more pending topics than you can cover in the {daysLeft} remaining day{daysLeft !== 1 ? "s" : ""} based on your daily limits. Some topics will overflow past the exam date.
              </p>
            </div>
          </div>
        )}

        {/* ── At Risk Banner ── */}
        {isAtRisk && !isCompleted && (
          <div style={{ background: s.dangerLight, border: `1px solid ${s.danger}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: s.danger, fontSize: 14 }}>Exam is near!</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: s.danger, opacity: 0.8 }}>
                Exam is in {daysLeft} day{daysLeft !== 1 ? "s" : ""} and you still have {totalTopics - doneTopics} topics left.
              </p>
            </div>
          </div>
        )}

        {isWatch && !isCompleted && (
          <div style={{ background: s.warningLight, border: `1px solid ${s.warning}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: s.warning, fontSize: 14 }}>Watch this course</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: s.warning, opacity: 0.85 }}>
                Exam in {daysLeft} days — keep up the pace.
              </p>
            </div>
          </div>
        )}

        {isCompleted && (
          <div style={{ background: s.successLight, border: `1px solid ${s.success}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <p style={{ margin: 0, fontWeight: 700, color: s.success, fontSize: 14 }}>All topics completed! Great work.</p>
          </div>
        )}

        {/* ── Course Header Card ── */}
        <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{course.name}</h1>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, background: s.accentLight, color: s.accent, borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>
                  {course.creditUnits || "—"} Credit Units
                </span>
                {daysLeft !== null && (
                  <span style={{
                    fontSize: 12,
                    background: isAtRisk ? s.dangerLight : isWatch ? s.warningLight : s.successLight,
                    color: isAtRisk ? s.danger : isWatch ? s.warning : s.success,
                    borderRadius: 20, padding: "3px 10px", fontWeight: 600
                  }}>
                    {daysLeft > 0 ? `${daysLeft} days to exam` : daysLeft === 0 ? "Exam is today!" : "Exam passed"}
                  </span>
                )}
                {isCompleted && (
                  <span style={{ fontSize: 12, background: s.successLight, color: s.success, borderRadius: 20, padding: "3px 10px", fontWeight: 700 }}>
                    ✓ Completed
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleDeleteCourse}
              style={{ background: "transparent", border: `1px solid ${s.danger}`, color: s.danger, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              🗑 Delete Course
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: s.subtext }}>Topic Progress</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: s.accent }}>{doneTopics}/{totalTopics} topics — {progressPct}%</span>
            </div>
            <div style={{ height: 10, background: s.inputBg, borderRadius: 5, overflow: "hidden", border: `1px solid ${s.border}` }}>
              <div style={{
                height: "100%",
                width: `${progressPct}%`,
                background: isCompleted ? s.success : s.accent,
                borderRadius: 5,
                transition: "width 0.4s ease"
              }} />
            </div>
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Confidence Card */}
          <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Confidence Level</h2>
            <p style={{ fontSize: 12, color: s.subtext, margin: "0 0 16px" }}>How confident are you in this course right now?</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setConfidence(val)}
                  style={{
                    flex: 1, height: 44, borderRadius: 10,
                    border: `2px solid ${confidence === val ? s.accent : s.border}`,
                    background: confidence === val ? s.accent : s.card,
                    color: confidence === val ? "#fff" : s.text,
                    cursor: "pointer", fontWeight: 700, fontSize: 16,
                    transition: "all 0.15s"
                  }}
                >
                  {val}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 12, color: s.subtext, margin: "0 0 12px", textAlign: "center" }}>
              {confidence === 1 ? "😰 Very low — needs a lot of work" :
                confidence === 2 ? "😟 Low — struggling with most topics" :
                  confidence === 3 ? "😐 Average — some gaps remaining" :
                    confidence === 4 ? "🙂 Good — mostly comfortable" :
                      "😎 Very confident — nearly exam ready"}
            </p>

            <button
              onClick={handleConfidenceUpdate}
              disabled={savingConf}
              style={{
                width: "100%", background: confSaved ? s.success : s.accent,
                color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 0", cursor: "pointer", fontWeight: 600, fontSize: 14,
                transition: "background 0.2s"
              }}
            >
              {savingConf ? "Saving..." : confSaved ? "✓ Saved!" : "Update Confidence"}
            </button>
          </div>

          {/* Exam Info Card */}
          <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>Exam Info</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: s.subtext }}>Exam Date</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {course.examDate ? new Date(course.examDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Not set"}
                </span>
              </div>
              <div style={{ height: 1, background: s.border }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: s.subtext }}>Days Remaining</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: isAtRisk ? s.danger : isWatch ? s.warning : s.success }}>
                  {daysLeft !== null ? (daysLeft >= 0 ? daysLeft : "Passed") : "—"}
                </span>
              </div>
              <div style={{ height: 1, background: s.border }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: s.subtext }}>Credit Units</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{course.creditUnits || "—"}</span>
              </div>
              <div style={{ height: 1, background: s.border }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: s.subtext }}>Topics Done</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: s.success }}>{doneTopics} / {totalTopics}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Topics Section ── */}
        <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>📚 Topics</h2>
            <button
              onClick={() => setShowAddTopic(true)}
              style={{ background: s.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
            >
              + Add Topic
            </button>
          </div>

          {topics.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: s.subtext }}>
              <p style={{ fontSize: 32, margin: "0 0 8px" }}>📭</p>
              <p style={{ fontWeight: 500, margin: 0 }}>No topics yet</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Add your first topic to get started</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["hard", "medium", "easy"].map((diff) => {
                const group = difficultyGroups[diff].filter((t) => t.status !== "done");
                if (group.length === 0) return null;
                return (
                  <div key={diff}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: s.subtext, textTransform: "uppercase", letterSpacing: 1, margin: "12px 0 6px" }}>
                      {diff === "hard" ? "🔴 Hard" : diff === "medium" ? "🟡 Medium" : "🟢 Easy"}
                    </p>
                    {group.map((topic) => (
                      <div
                        key={topic.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px", borderRadius: 10, marginBottom: 6,
                          background: diff === "hard" ? s.hardBg : diff === "medium" ? s.medBg : s.easyBg,
                          border: `1px solid ${s.border}`,
                          transition: "all 0.2s"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleTopicStatusToggle(topic)}
                          style={{ width: 16, height: 16, cursor: "pointer" }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: s.text }}>
                            {topic.title}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: s.subtext }}>
                            {topic.timeValue === 0.5 ? "30 min" : topic.timeValue === 1 ? "1 hour" : "2 hours"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ ADD TOPIC MODAL ══ */}
      {showAddTopic && (
        <div
          style={{ position: "fixed", inset: 0, background: s.modalOverlay, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setShowAddTopic(false)}
        >
          <div
            style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>➕ Add Topic</h2>

            <label style={lbl}>Topic Title</label>
            <input
              type="text"
              placeholder="e.g. Dijkstra's Algorithm"
              value={newTopic.title}
              onChange={(e) => setNewTopic((p) => ({ ...p, title: e.target.value }))}
              style={inp(s)}
              autoFocus
            />

            <label style={lbl}>Difficulty</label>
            <select
              value={newTopic.difficulty}
              onChange={(e) => setNewTopic((p) => ({ ...p, difficulty: e.target.value }))}
              style={inp(s)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <label style={lbl}>Estimated Time</label>
            <select
              value={newTopic.timeValue}
              onChange={(e) => setNewTopic((p) => ({ ...p, timeValue: Number(e.target.value) }))}
              style={inp(s)}
            >
              <option value={0.5}>30 minutes</option>
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
            </select>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                onClick={handleAddTopic}
                disabled={saving || !newTopic.title.trim()}
                style={{ flex: 1, background: s.accent, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", cursor: "pointer", fontWeight: 600, fontSize: 14, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Saving..." : "Add Topic"}
              </button>
              <button
                onClick={() => setShowAddTopic(false)}
                style={{ flex: 1, background: "transparent", color: s.subtext, border: `1px solid ${s.border}`, borderRadius: 10, padding: "11px 0", cursor: "pointer", fontWeight: 500, fontSize: 14 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, marginTop: 14 };
const inp = (s) => ({
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: `1px solid ${s.border}`, background: s.inputBg,
  color: s.text, fontSize: 14,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  boxSizing: "border-box", outline: "none",
});