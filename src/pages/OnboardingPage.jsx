import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../FireBase";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    maxTopics: "",
    maxHardTopics: "",
  });
  const [courses, setCourses] = useState([]);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;

      // Save preferences to users collection
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName || "Student",
        email: user.email,
        maxTopics: Number(preferences.maxTopics) || 5,
        maxHardTopics: Number(preferences.maxHardTopics) || 2,
        createdAt: new Date().toISOString(),
      });

      // Save each course to courses collection
      for (const course of courses) {
        await addDoc(collection(db, "courses"), {
          userId: user.uid,
          name: course.name,
          creditUnits: Number(course.units),
          examDate: course.examDate,
          confidence: Number(course.confidence),
          totalTopics: 0,
          remainingTopics: 0,
          createdAt: new Date().toISOString(),
        });
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving onboarding data:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-blue-600 font-extrabold text-xl mb-8">
          🛫 StudyPilot
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                height: 4,
                flex: 1,
                borderRadius: 99,
                background: s <= step ? "#2563eb" : "#e5e7eb",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">
              Welcome to StudyPilot 🛫
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-10">
              Let's set up your semester in 3 quick steps. We'll use this to
              build your personalised study schedule — no more guessing what
              to read next.
            </p>
            <button
              onClick={nextStep}
              className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              Let's go →
            </button>
          </div>
        )}

        {/* Step 2 — Preferences */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Set your preferences
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              This helps StudyPilot know how much to assign you each day.
            </p>

            <div className="flex flex-col gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Max topics per day
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  How many topics can you realistically cover in one day?
                </p>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={preferences.maxTopics}
                  onChange={(e) => setPreferences({ ...preferences, maxTopics: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="e.g. 5"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Max difficult topics per day
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Hard topics drain energy fast. How many can you handle in one day?
                </p>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={preferences.maxHardTopics}
                  onChange={(e) => setPreferences({ ...preferences, maxHardTopics: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="e.g. 2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={prevStep} className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-full text-sm hover:bg-gray-50 transition">
                ← Back
              </button>
              <button onClick={nextStep} className="flex-1 py-3.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:opacity-90 transition-opacity">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Add courses */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Add your courses
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Add all the courses you're taking this semester.
            </p>

            <div className="flex flex-col gap-3 mb-4">
              {courses.map((course, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{course.name}</p>
                    <p className="text-xs text-gray-400">{course.units} units · Exam: {course.examDate} · Confidence: {course.confidence}/5</p>
                  </div>
                  <button
                    onClick={() => setCourses(courses.filter((_, i) => i !== index))}
                    className="text-gray-400 hover:text-red-500 text-lg font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <AddCourseForm onAdd={(course) => setCourses([...courses, course])} />

            <div className="flex gap-3 mt-8">
              <button onClick={prevStep} className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-full text-sm hover:bg-gray-50 transition">
                ← Back
              </button>
              <button
                onClick={nextStep}
                disabled={courses.length === 0}
                className="flex-1 py-3.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div className="text-center">
            <div className="text-5xl mb-6">🎉</div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              You're all set!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-10">
              StudyPilot has everything it needs to build your schedule. Let's go.
            </p>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Saving..." : "View my dashboard →"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function AddCourseForm({ onAdd }) {
  const [form, setForm] = useState({
    code: "",
    title: "",
    units: "",
    examDate: "",
    confidence: "3",
  });

  const handleAdd = () => {
    if (!form.code || !form.title || !form.units || !form.examDate) return;
    onAdd({
      ...form,
      name: `${form.code} - ${form.title}`,
    });
    setForm({ code: "", title: "", units: "", examDate: "", confidence: "3" });
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add a course</p>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Course code e.g. CSC 425"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
        />
        <input
          type="text"
          placeholder="Course title e.g. Database Systems"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="flex-[2] px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
        />
      </div>

      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Credit units"
          value={form.units}
          onChange={(e) => setForm({ ...form, units: e.target.value })}
          min={1}
          max={6}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
        />
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs text-gray-500">Exam date</label>
          <input
            type="date"
            value={form.examDate}
            onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">
          Confidence level: <span className="font-semibold text-blue-600">{form.confidence}/5</span>
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={form.confidence}
          onChange={(e) => setForm({ ...form, confidence: e.target.value })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Not confident</span>
          <span>Very confident</span>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="w-full py-2.5 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:opacity-80 transition-opacity"
      >
        + Add course
      </button>
    </div>
  );
}