import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../FireBase";
import { signInWithGoogle } from "../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = async () => {
      try {
        const user = await signInWithGoogle();
        console.log(user);
        navigate("/dashboard");
      } catch (err) {
        setError(err.message);
      }
    };
  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("All fields are required.");
      return;
    }
    setError("");

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Try again.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Incorrect email or password. Try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  const fields = [
    { label: "Email address", name: "email", type: "email", placeholder: "tolu@email.com" },
    { label: "Password", name: "password", type: "password", placeholder: "Your password" },
  ];

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

        {/* Heading */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 font-semibold cursor-pointer"
          >
            Sign up
          </span>
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          ))}

          {/* Forgot password */}
          <p className="text-sm text-blue-600 font-semibold cursor-pointer text-right -mt-2" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </p>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:opacity-90 transition-opacity mt-2"
          >
            Log in
          </button>
          
          {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center mt-2 gap-3 w-full py-3.5 border rounded-[28px] bg-white hover:bg-gray-100 transition "
            >

              {/* Google Icon */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.9-6.9C35.64 2.36 30.2 0 24 0 14.6 0 6.46 5.4 2.56 13.28l8.04 6.24C12.6 13.2 17.8 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24c0-1.64-.14-3.2-.4-4.72H24v9h12.7c-.55 2.96-2.2 5.48-4.7 7.2l7.2 5.6C43.98 36.8 46.5 30.9 46.5 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.6 28.5c-.5-1.48-.78-3.06-.78-4.7s.28-3.22.78-4.7l-8.04-6.24C.92 16.36 0 20.08 0 24s.92 7.64 2.56 10.94l8.04-6.44z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.2 0 11.4-2.04 15.2-5.56l-7.2-5.6c-2 1.36-4.56 2.16-8 2.16-6.2 0-11.4-3.7-13.4-9.02l-8.04 6.44C6.46 42.6 14.6 48 24 48z"
                />
              </svg>

              <span className="text-gray-700 font-medium">
                Sign in with Google
              </span>
            </button>
        </div>

      </div>
    </div>
  );
}