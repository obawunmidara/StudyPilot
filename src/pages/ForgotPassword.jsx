import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../FireBase";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSubmitted(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("That doesn't look like a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-blue-600 font-extrabold text-xl mb-8 cursor-pointer"
        >
          🛫 StudyPilot
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div>
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl mb-6">
              📬
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              Check your email
            </h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              We sent a password reset link to{" "}
              <span className="text-gray-800 font-semibold">{email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              Back to login
            </button>
            <p
              onClick={() => { setSubmitted(false); setEmail(""); }}
              className="text-center text-sm text-blue-600 font-semibold cursor-pointer mt-4"
            >
              Try a different email
            </p>
          </div>
        ) : (
          /* ── Form state ── */
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Forgot password?
            </h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              No worries. Enter your email and we'll send you a reset link.
            </p>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Email field */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="tolu@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Submit */}
              <button
                id="send-reset-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:opacity-90 transition-opacity mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>

              {/* Back link */}
              <p
                onClick={() => navigate("/login")}
                className="text-center text-sm text-gray-500 cursor-pointer hover:text-gray-700"
              >
                ← Back to login
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}