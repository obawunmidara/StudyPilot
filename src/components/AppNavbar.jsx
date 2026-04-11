import { useNavigate } from "react-router-dom";
import NewButton from "../ui/NewButton";
import ThemeToggle from "../ui/ThemeToggle"; 


export default function AppNavbar({ dark, setDark }) {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        background: dark ? "" : "#ffffff",
        borderBottom: dark ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.08)",
        transition: "background 0.3s",
      }}
      className="flex items-center justify-between p-4"
    >
      <div className="font-logo font-bold xl:text-3xl text-xl tracking-tight">
         StudyPilot
      </div>
      <div className="flex items-center gap-3">
        <NewButton onClick={() => navigate("/signup")}>Get Started</NewButton>
        <ThemeToggle dark={dark} setDark={setDark} />
      </div>
    </nav>
  );
}