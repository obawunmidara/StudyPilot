
import { useNavigate } from "react-router-dom"


export function AppNavbar() {
  const navigate = useNavigate();
  return (
    <>
      <div className="max-w-3xl mx-auto px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-5">
            Study <span className="text-blue-600">smarter.</span><br />Stress less.
          </h1>
          <p className="text-xl text-[#5a5854] dark:text-[#8a8880] font-light max-w-lg mx-auto mb-10 leading-relaxed">
            Tell StudyPilot your courses, exam dates, and how confident you feel — it builds your perfect reading schedule automatically.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate("/signup")}
              className="bg-blue-600 text-white p-4 rounded-xl text-sm font-medium hover:-translate-y-0.5 hover:opacity-90 transition-all"
            >
              Build my schedule →
            </button>
            <button
              onClick={() => navigate("/onboarding")}
              className="border border-black/10 dark:border-white/10 p-4 rounded-xl text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              See how it works
            </button>
          </div>
      </div>
    </>
  );
}
export default AppNavbar;
