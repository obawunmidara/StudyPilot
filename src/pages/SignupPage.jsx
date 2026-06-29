import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../FireBase";
import { signInWithGoogle } from "../utils/auth";
import { HRText } from "flowbite-react";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function SignupPage() {
  const navigate = useNavigate();
  const [dark] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      if (
        err.code === "auth/account-exists-with-different-credential" ||
        err.code === "auth/email-already-in-use"
      ) {
        navigate("/login", {
          state: { message: "You already have an account. Please log in." },
        });
      } else {
        setError(err.message);
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    return errors;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const passwordErrors = validatePassword(form.password);
    if (passwordErrors.length > 0) {
      setError("Password must include:\n• " + passwordErrors.join("\n• "));
      return;
    }

    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        createdAt: new Date().toISOString(),
        role: "student",
      });

      navigate("/onboarding");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        navigate("/login", {
          state: { message: "You already have an account. Please log in." },
        });
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: dark ? "#0a0a0a" : "#ffffff",
        color: dark ? "#f0f0f0" : "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          style={{
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 32,
            cursor: "pointer",
            color: "#2563eb",
          }}
        >
          StudyPilot
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: 8,
            letterSpacing: "-1px",
          }}
        >
          Create your account
        </h1>
        <p
          style={{
            fontSize: 14,
            color: dark ? "#888" : "#666",
            marginBottom: 32,
          }}
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#2563eb", fontWeight: 600, cursor: "pointer" }}
          >
            Log in
          </span>
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 20,
              whiteSpace: "pre-line", // renders the \n• in password errors
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Full name", name: "name", type: "text", placeholder: "e.g Tolu Adeleke" },
            { label: "Email address", name: "email", type: "email", placeholder: "e.g [tolu@gmail.com]" },
            { label: "Password", name: "password", type: "password", placeholder: "e.g Min. 8 characters" },
            { label: "Confirm password", name: "confirmPassword", type: "password", placeholder: "e.g Repeat your password" },
          ].map((field) => (
            <div key={field.name}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: dark ? "#ccc" : "#333",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"}`,
                  background: dark ? "#1a1a1a" : "#f9f9f9",
                  color: dark ? "#f0f0f0" : "#0a0a0a",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border 0.2s",
                }}
              />
            </div>
          ))}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-blue-600 text-white border-0 rounded-[28px] text-[15px] font-semibold cursor-pointer mt-2 transition-opacity duration-200 hover:opacity-90"
          >
            Create account
          </button>

          <HRText text="or" />

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center mt-2 gap-3 w-full py-3.5 border rounded-[28px] bg-white hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.9-6.9C35.64 2.36 30.2 0 24 0 14.6 0 6.46 5.4 2.56 13.28l8.04 6.24C12.6 13.2 17.8 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24c0-1.64-.14-3.2-.4-4.72H24v9h12.7c-.55 2.96-2.2 5.48-4.7 7.2l7.2 5.6C43.98 36.8 46.5 30.9 46.5 24z" />
              <path fill="#FBBC05" d="M10.6 28.5c-.5-1.48-.78-3.06-.78-4.7s.28-3.22.78-4.7l-8.04-6.24C.92 16.36 0 20.08 0 24s.92 7.64 2.56 10.94l8.04-6.44z" />
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2.04 15.2-5.56l-7.2-5.6c-2 1.36-4.56 2.16-8 2.16-6.2 0-11.4-3.7-13.4-9.02l-8.04 6.44C6.46 42.6 14.6 48 24 48z" />
            </svg>
            <span className="text-gray-700 font-medium">Sign up with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}