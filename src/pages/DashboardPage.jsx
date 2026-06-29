import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../FireBase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { generateDailyPlan, getTodaysPlan, rankCourses, calculateStreak } from "../utils/priorityEngine";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";



export default function DashboardPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEveningModal, setShowEveningModal] = useState(false);
  const [eveningConfidence, setEveningConfidence] = useState({});
  const [streak, setStreak] = useState(0);
  const [userData, setUserData] = useState(null);

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topicForm, setTopicForm] = useState({
    name: "",
    estimatedTime: "1hr",
    difficulty: 3,
  });
  const [savingTopic, setSavingTopic] = useState(false);
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("22:00");
  const [commitments, setCommitments] = useState([]);
  const [freeWindows, setFreeWindows] = useState([]);
  const [totalFreeHours, setTotalFreeHours] = useState(0);
  const [todaysPlan, setTodaysPlan] = useState([]);

  // Fetch courses from Firestore when page loads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        // Fetch courses
        const coursesQuery = query(
          collection(db, "courses"),
          where("userId", "==", currentUser.uid)
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(rankCourses(coursesData));

        // Fetch topics
        const topicsQuery = query(
          collection(db, "topics"),
          where("userId", "==", currentUser.uid)
        );
        const topicsSnapshot = await getDocs(topicsQuery);
        const topicsData = topicsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopics(topicsData);

        // Fetch user data
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // 3. Store the full object (including the name!)
          setUserData(userSnap.data());
        } else {
          console.log("No profile found in Firestore for this UID.");
        }

        // Calculate streak
        // Fetch check-ins and calculate streak
        const checkInsQuery = query(
          collection(db, "checkIns"),
          where("userId", "==", currentUser.uid)
        );
        const checkInsSnapshot = await getDocs(checkInsQuery);
        const checkInsData = checkInsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStreak(calculateStreak(checkInsData));

      } catch (err) {
        console.error("Error fetching data:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [])
    ;


  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
  const handleBackToLanding = () => {
    navigate("/");
  };
  const addCommitment = () => {
    const lastEnd = commitments.length > 0
      ? commitments[commitments.length - 1].end
      : "09:00";
    const [h, m] = lastEnd.split(":").map(Number);
    const newEnd = `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    setCommitments([...commitments, { start: lastEnd, end: newEnd, description: "" }]);
  };

  const removeCommitment = (index) => {
    setCommitments(commitments.filter((_, i) => i !== index));
  };

  const updateCommitment = (index, key, value) => {
    setCommitments(commitments.map((c, i) =>
      i === index ? { ...c, [key]: value } : c
    ));
  };


  const toMins = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const toDisplay = (mins) => {
    let h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const ampm = h >= 12 ? "pm" : "am";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, "0")}${ampm}`;
  };

  const generatePlan = async () => {
    // calculate free windows first
    let wakeM = toMins(wakeTime);
    let sleepM = toMins(sleepTime);
    if (sleepM <= wakeM) sleepM += 24 * 60;

    const blocked = commitments.map((c) => {
      let s = toMins(c.start);
      let e = toMins(c.end);
      if (s < wakeM) s += 24 * 60;
      if (e < wakeM) e += 24 * 60;
      return { s, e };
    }).filter(c => c.s < sleepM && c.e > wakeM)
      .sort((a, b) => a.s - b.s);

    const windows = [];
    let cursor = wakeM;
    for (const b of blocked) {
      if (b.s > cursor) windows.push({ s: cursor, e: b.s });
      cursor = Math.max(cursor, b.e);
    }
    if (cursor < sleepM) windows.push({ s: cursor, e: sleepM });

    let totalMins = 0;
    const labels = windows.map((w) => {
      const dur = w.e - w.s;
      totalMins += dur;
      const h = Math.floor(dur / 60);
      const m = dur % 60;
      const label = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
      return `${toDisplay(w.s % (24 * 60))} – ${toDisplay(w.e % (24 * 60))} (${label})`;
    });

    setFreeWindows(labels);
    setTotalFreeHours(Math.round(totalMins / 60));

    // run the algorithm — use totalMins directly (totalFreeHours state is stale here)
    const freeMinutes = totalMins;
    const plan = generateDailyPlan(courses, topics, userData, freeMinutes);
    const todays = getTodaysPlan(plan);
    setTodaysPlan(todays);

    // save plan to Firestore
    try {
      await addDoc(collection(db, "dailyPlans"), {
        userId: auth.currentUser.uid,
        date: new Date().toISOString().split("T")[0],
        topics: todays.map(t => t.id),
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error saving plan:", err);
    }
  };

  const handleAddTopic = async () => {
    if (!topicForm.name) return;
    setSavingTopic(true);
    try {
      await addDoc(collection(db, "topics"), {
        userId: auth.currentUser.uid,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        name: topicForm.name,
        estimatedTime: topicForm.estimatedTime,
        difficulty: Number(topicForm.difficulty),
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // refresh topics
      const topicsQuery = query(
        collection(db, "topics"),
        where("userId", "==", auth.currentUser.uid)
      );
      const topicsSnapshot = await getDocs(topicsQuery);
      const topicsData = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopics(topicsData);
      setTopicForm({ name: "", estimatedTime: "1hr", difficulty: 3 });
      setShowTopicModal(false);
    } catch (err) {
      console.error("Error adding topic:", err);
    }
    setSavingTopic(false);
  };

  const EveningCheckIn = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const doneTopics = todaysPlan.filter(t => t.status === "done");
      const missedTopics = todaysPlan.filter(t => t.status === "pending");

      // Save check-in to Firestore
      await addDoc(collection(db, "checkIns"), {
        userId: auth.currentUser.uid,
        date: today,
        doneTopics: doneTopics.map(t => t.id),
        missedTopics: missedTopics.map(t => t.id),
        createdAt: new Date().toISOString(),
      });

      setStreak(prev => prev + 1);

      // Update confidence for each course
      for (const courseId of Object.keys(eveningConfidence)) {
        await updateDoc(doc(db, "courses", courseId), {
          confidence: Number(eveningConfidence[courseId]),
        });
      }

      // Update courses state locally
      setCourses(prev => prev.map(c =>
        eveningConfidence[c.id]
          ? { ...c, confidence: Number(eveningConfidence[c.id]) }
          : c
      ));
      setWakeTime("07:00");
      setSleepTime("22:00");
      setCommitments([]);
      setFreeWindows([]);
      setTotalFreeHours(0);
      setTodaysPlan([]);
      setShowEveningModal(false);
      alert("Evening check-in saved! See you tomorrow 🌙");
    } catch (err) {
      console.error("Error saving evening check-in:", err);
    }
  };
  const toggleTopic = async (topic) => {
    const newStatus = topic.status === "done" ? "pending" : "done";

    // update visually immediately
    setTodaysPlan(prev => prev.map(t =>
      t.id === topic.id ? { ...t, status: newStatus } : t
    ));
    setTopics(prev => prev.map(t =>
      t.id === topic.id ? { ...t, status: newStatus } : t
    ));

    // save to Firestore
    try {
      await updateDoc(doc(db, "topics", topic.id), {
        status: newStatus,
      });
    } catch (err) {
      console.error("Error updating topic:", err);
    }
  };



  const barColor = (s) => ({
    "done": "#22c55e",
    "at-risk": "#ef4444",
    "watch": "#f59e0b",
    "good": "#22c55e",
  }[s] || "#22c55e");

  const getCourseStatus = (course) => {
    const today = new Date();
    const examDate = new Date(course.examDate);
    const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) return "at-risk";
    if (daysLeft <= 14) return "watch";
    return "good";
  };

  const statusStyle = (s) => ({
    "done": { background: "#dcfce7", color: "#16a34a" },
    "at-risk": { background: "#fee2e2", color: "#dc2626" },
    "watch": { background: "#fef9c3", color: "#a16207" },
  }[s]);

  const isMobile = window.innerWidth < 768;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ color: "#2563eb", fontWeight: 800, fontSize: 17, cursor: "pointer" }} onClick={handleBackToLanding}>
          StudyPilot
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
            {userData?.name ? userData.name.charAt(0).toUpperCase() : "?"}
            {console.log(userData)}
          </div>
          <button onClick={handleLogout} style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", background: "transparent", border: "none", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem" }}>

        {/* Greeting */}
        <div className="text-2xl font-bold mb-4">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good morning ";
            if (hour < 17) return "Good afternoon ";
            return "Good evening ";
          })()} {userData?.name ? `, ${userData.name}` : ""}
        </div>

        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Courses", value: courses.length, sub: "this semester", bg: "#eff6ff", color: "#1d4ed8" },
            { label: "Topics", value: topics.length, sub: "added so far", bg: "#fdf4ff", color: "#9333ea" },
            { label: "Streak", value: `🔥 ${streak}`, sub: "sessions in a row", bg: "#fffbeb", color: "#d97706" },
            {
              label: "At risk", value: courses.filter(c => {
                const ct = topics.filter(t => t.courseId === c.id);
                const prog = ct.length > 0 ? Math.round((ct.filter(t => t.status === "done").length / ct.length) * 100) : 0;
                return prog < 100 && getCourseStatus(c) === "at-risk";
              }).length, sub: "courses behind", bg: "#fff1f2", color: "#e11d48"
            },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 18, padding: "16px 18px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-1px", marginBottom: 2 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: s.color, opacity: 0.7, fontWeight: 500 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Today's reading list */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
              Today's reading list
            </p>
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0f0f0", padding: 20 }}>
              {todaysPlan.length < 0 ? (
                <>
                  <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>
                    Add topics to your courses then hit "Generate today's plan" 👇
                  </p>
                  <p>
                    {todaysPlan.length}
                  </p>
                </>
              ) : (
                <>
                  {todaysPlan.map((topic, index) => (
                    <div
                      key={index}
                      onClick={() => toggleTopic(topic)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderBottom: index < todaysPlan.length - 1 ? "1px solid #f9f9f9" : "none", background: topic.status === "done" ? "#fafafa" : "#fff", cursor: "pointer" }}
                    >
                      {/* Checkbox */}
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: topic.status === "done" ? "none" : "1.5px solid #d1d5db", background: topic.status === "done" ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        {topic.status === "done" && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {/* Topic info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, fontWeight: 600 }}>{topic.courseName}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: topic.status === "done" ? "#9ca3af" : "#111", textDecoration: topic.status === "done" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {topic.name}
                        </p>
                      </div>
                      {/* Time + difficulty */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{topic.estimatedTime}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: topic.difficulty >= 4 ? "#fee2e2" : topic.difficulty >= 3 ? "#fef9c3" : "#dcfce7", color: topic.difficulty >= 4 ? "#dc2626" : topic.difficulty >= 3 ? "#a16207" : "#16a34a" }}>
                          {topic.difficulty >= 4 ? "Hard" : topic.difficulty >= 3 ? "Medium" : "Easy"}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Evening check-in button */}
                  <div style={{ padding: "12px 16px", background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
                    <button
                      onClick={() => {
                        // pre-fill confidence from current course values
                        const affected = {};
                        todaysPlan.forEach(topic => {
                          const course = courses.find(c => c.id === topic.courseId);
                          if (course) affected[course.id] = course.confidence;
                        });
                        setEveningConfidence(affected);
                        setShowEveningModal(true);
                      }}
                      style={{ width: "100%", padding: 11, background: "#0f0f0f", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      Submit evening check-in
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Course priority */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
              Course priority
            </p>

            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0f0f0", overflow: "hidden" }}>
              {courses.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ fontSize: 24, marginBottom: 8 }}>📚</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 4 }}>No courses yet</p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>Go back to onboarding to add your courses</p>
                </div>
              ) : (
                courses.map((course, index) => {
                  const courseTopics = topics.filter(t => t.courseId === course.id);
                  const done = courseTopics.filter(t => t.status === "done").length;
                  const progress = courseTopics.length > 0 ? Math.round((done / courseTopics.length) * 100) : 0;
                  const status = progress === 100 ? "done" : getCourseStatus(course);
                  const examDate = new Date(course.examDate);
                  const daysLeft = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={course.id} style={{ padding: "14px 16px", borderBottom: index < courses.length - 1 ? "1px solid #f9f9f9" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#d1d5db", width: 16 }}>{index + 1}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{course.name}</span>
                          {status !== "good" && (
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, ...statusStyle(status) }}>
                              {status === "done" ? "Done ✓" : status === "at-risk" ? "At risk" : "Watch"}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{daysLeft}d left</span>
                      </div>
                      <div style={{ height: 5, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ height: "100%", width: `${progress}%`, background: barColor(status), borderRadius: 99 }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
                          {progress}% done · {courseTopics.length} topics · confidence {course.confidence}/5
                        </p>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => { setSelectedCourse(course); setShowTopicModal(true); }}
                            style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid #e5e7eb", background: "transparent", color: "#2563eb", cursor: "pointer" }}
                          >
                            + Add topic
                          </button>
                          <button
                            onClick={() => navigate(`/course/${course.id}`)}
                            style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid #2563eb", background: "#eff6ff", color: "#2563eb", cursor: "pointer" }}
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Morning check-in */}
        <div id="morning-checkin">
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Morning check-in
          </p>

          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0f0f0", padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Wake up time</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fafafa", fontSize: 13, fontWeight: 500, color: "#111", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Sleep time</label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fafafa", fontSize: 13, fontWeight: 500, color: "#111", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 8 }}>
                Fixed commitments today
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {commitments.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fafafa", borderRadius: 12, padding: "10px 12px", border: "1px solid #f0f0f0", flexWrap: "wrap" }}>
                    <input type="time" value={c.start} onChange={(e) => updateCommitment(i, "start", e.target.value)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, color: "#111", outline: "none", width: 110 }} />
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>to</span>
                    <input type="time" value={c.end} onChange={(e) => updateCommitment(i, "end", e.target.value)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, color: "#111", outline: "none", width: 110 }} />
                    <input type="text" placeholder="e.g. CSC 425 lecture" value={c.description} onChange={(e) => updateCommitment(i, "description", e.target.value)} style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, color: "#111", outline: "none", minWidth: 120 }} />
                    <button onClick={() => removeCommitment(i)} style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 18 }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={addCommitment} style={{ marginTop: 8, fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "transparent", color: "#6b7280", cursor: "pointer" }}>
                + Add commitment
              </button>
            </div>

            {freeWindows.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 8 }}>
                  Free windows · <span style={{ color: "#2563eb" }}>{totalFreeHours} hrs available</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {freeWindows.map((w, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, background: "#eff6ff", color: "#1d4ed8" }}>{w}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={generatePlan} style={{ width: "100%", padding: 12, background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Generate today's plan
            </button>
          </div>
        </div>
      </div>
      {/* Evening Check-in Modal */}
      {showEveningModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "85vh", overflowY: "auto" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>Evening check-in 🌙</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>How did today go?</p>
              </div>
              <button
                onClick={() => setShowEveningModal(false)}
                style={{ background: "transparent", border: "none", fontSize: 20, color: "#9ca3af", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {/* Topics review */}
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
              Today's topics
            </p>
            <div style={{ background: "#fafafa", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
              {todaysPlan.map((topic, index) => (
                <div
                  key={index}
                  onClick={() => toggleTopic(topic)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: index < todaysPlan.length - 1 ? "1px solid #f0f0f0" : "none", cursor: "pointer" }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: topic.status === "done" ? "none" : "1.5px solid #d1d5db", background: topic.status === "done" ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {topic.status === "done" && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: topic.status === "done" ? "#9ca3af" : "#111", textDecoration: topic.status === "done" ? "line-through" : "none" }}>
                      {topic.name}
                    </p>
                    <p style={{ fontSize: 11, color: "#9ca3af" }}>{topic.courseName}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence update */}
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
              Update confidence
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {[...new Set(todaysPlan.map(t => t.courseId))].map(courseId => {
                const course = courses.find(c => c.id === courseId);
                if (!course) return null;
                return (
                  <div key={courseId}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{course.name}</label>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
                        {eveningConfidence[courseId] || course.confidence}/5
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={eveningConfidence[courseId] || course.confidence}
                      onChange={(e) => setEveningConfidence({ ...eveningConfidence, [courseId]: e.target.value })}
                      style={{ width: "100%" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>Not confident</span>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>Very confident</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowEveningModal(false)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, color: "#6b7280", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={EveningCheckIn}
                style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "#0f0f0f", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}
              >
                Submit check-in
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Topic Modal */}
      {showTopicModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>

            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>Add topic</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{selectedCourse?.name}</p>
              </div>
              <button
                onClick={() => setShowTopicModal(false)}
                style={{ background: "transparent", border: "none", fontSize: 20, color: "#9ca3af", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {/* Topic name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>
                Topic name
              </label>
              <input
                type="text"
                placeholder="e.g. Process scheduling algorithms"
                value={topicForm.name}
                onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fafafa", fontSize: 13, color: "#111", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Estimated time */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>
                Estimated time
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["30min", "1hr", "2hr"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopicForm({ ...topicForm, estimatedTime: t })}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid",
                      borderColor: topicForm.estimatedTime === t ? "#2563eb" : "#e5e7eb",
                      background: topicForm.estimatedTime === t ? "#eff6ff" : "#fff",
                      color: topicForm.estimatedTime === t ? "#2563eb" : "#6b7280",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>
                Difficulty: <span style={{ color: "#2563eb" }}>{topicForm.difficulty}/5</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={topicForm.difficulty}
                onChange={(e) => setTopicForm({ ...topicForm, difficulty: e.target.value })}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>Easy</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>Hard</span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowTopicModal(false)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, color: "#6b7280", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTopic}
                disabled={savingTopic || !topicForm.name}
                style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "#2563eb", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: savingTopic || !topicForm.name ? 0.6 : 1 }}
              >
                {savingTopic ? "Saving..." : "Add topic"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}