import { useState} from "react";
import AppNavbar from "../components/AppNavbar";
import HeroSection from "../components/HeroSection";
import FeatureGrid from "../components/FeatureGrid";
import StepsSection from "../components/StepsSection";
import FooterSection from "../components/FooterSection";

const LandingPage = () => {
  const [dark, setDark] = useState(false);

  // Apply dark class to <html> for Tailwind dark mode
  
  return (
    <div
      style={{ backgroundColor: dark ? "#030712" : "#ffffff", color: dark ? "#f9fafb" : "#111827" }}
      className="font-body transition-colors duration-300 min-h-screen"
    >
      <AppNavbar dark={dark} setDark={setDark} />
      <HeroSection dark={dark} />
      <FeatureGrid dark={dark} />
      <StepsSection dark={dark} />
      <FooterSection dark={dark} />
    </div>
  )
};


export default LandingPage;