import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { ApplicationForm } from "./components/ApplicationForm";
import { SuccessPage } from "./components/SuccessPage";
import { AdminDashboard } from "./components/AdminDashboard";

type Page = "landing" | "application" | "success" | "admin";
type Track = "baby" | "staff";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedTrack, setSelectedTrack] = useState<Track>("baby");
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [adminTokenValue, setAdminTokenValue] = useState<string | null>(null);

  const adminToken = (import.meta.env.VITE_ADMIN_TOKEN as string | undefined)?.trim();
  const showAdminEntry = (import.meta.env.VITE_SHOW_ADMIN_ENTRY as string | undefined) === "true";

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd + Option + A (또는 Ctrl + Alt + A on Windows)
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === "a") {
        e.preventDefault();
        handleAdminAccess();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [adminToken]);

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

  // Admin access (gated by env flag + token)
  const handleAdminAccess = () => {
    if (!adminToken) {
      alert("관리자 토큰이 설정되지 않았습니다. VITE_ADMIN_TOKEN을 환경변수에 넣어주세요.");
      return;
    }

    const input = prompt("관리자 토큰을 입력하세요");

    if (input && input.trim() === adminToken) {
      setIsAdminAuthorized(true);
      setAdminTokenValue(adminToken);
      setCurrentPage("admin");
    } else {
      alert("토큰이 올바르지 않습니다.");
    }
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
      {currentPage === "admin" && (
        isAdminAuthorized ? (
          <AdminDashboard onBack={handleBackToHome} adminToken={adminTokenValue ?? ""} />
        ) : (
          <LandingPage onSelectTrack={handleSelectTrack} />
        )
      )}
    </>
  );
}