import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { ApplicationForm } from "./components/ApplicationForm";
import { SuccessPage } from "./components/SuccessPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";
import { Toaster } from "./components/ui/sonner";

type Page = "landing" | "application" | "success" | "admin" | "admin-login";
type Track = "baby" | "staff";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedTrack, setSelectedTrack] = useState<Track>("baby");
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [adminTokenValue, setAdminTokenValue] = useState<string | null>(null);

  const adminToken = (import.meta.env.VITE_ADMIN_TOKEN as string | undefined)?.trim();

  useEffect(() => {
    let shiftCount = 0;
    let shiftTimer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        shiftCount++;
        
        if (shiftCount === 5) {
          e.preventDefault();
          setCurrentPage("admin-login");
          shiftCount = 0;
        }
        
        clearTimeout(shiftTimer);
        shiftTimer = setTimeout(() => {
          shiftCount = 0;
        }, 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(shiftTimer);
    };
  }, []);

  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track);
    setCurrentPage("application");
  };

  const handleSubmit = () => {
    setCurrentPage("success");
  };

  const handleBackToHome = () => {
    setCurrentPage("landing");
  };

  const handleBackFromForm = () => {
    setCurrentPage("landing");
  };

  const handleAdminLogin = (token: string) => {
    setIsAdminAuthorized(true);
    setAdminTokenValue(token);
    setCurrentPage("admin");
  };

  const handleAdminLogout = () => {
    setIsAdminAuthorized(false);
    setAdminTokenValue(null);
    setCurrentPage("landing");
  };

  return (
    <>
      {currentPage === "landing" && (
        <div>
          <LandingPage onSelectTrack={handleSelectTrack} />
        </div>
      )}
      {currentPage === "application" && (
        <ApplicationForm
          track={selectedTrack}
          onSubmit={handleSubmit}
          onBack={handleBackFromForm}
        />
      )}
      {currentPage === "success" && (
        <SuccessPage onBackToHome={handleBackToHome} />
      )}
      {currentPage === "admin-login" && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onBack={handleBackToHome}
        />
      )}
      {currentPage === "admin" && (
        isAdminAuthorized ? (
          <AdminDashboard 
            onBack={handleAdminLogout}
            adminToken={adminTokenValue ?? ""} 
          />
        ) : (
          <LandingPage onSelectTrack={handleSelectTrack} />
        )
      )}
      <Toaster position="top-center" richColors />
    </>
  );
}