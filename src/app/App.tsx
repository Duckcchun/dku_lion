import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { ApplicationForm } from "./components/ApplicationForm";
import { SuccessPage } from "./components/SuccessPage";
import { AdminDashboard } from "./components/AdminDashboard";

type Page = "landing" | "application" | "success" | "admin";
type Track = "baby" | "staff";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedTrack, setSelectedTrack] = useState<Track>("baby");

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

  // Secret admin access (for demo purposes, you should add proper authentication)
  const handleAdminAccess = () => {
    setCurrentPage("admin");
  };

  return (
    <>
      {currentPage === "landing" && (
        <div>
          <LandingPage onSelectTrack={handleSelectTrack} />
          {/* Hidden admin button - press Alt+A to access */}
          <div
            style={{ position: "fixed", bottom: 10, right: 10, opacity: 0.1 }}
            onClick={handleAdminAccess}
            onKeyDown={(e) => e.altKey && e.key === "a" && handleAdminAccess()}
            tabIndex={0}
          >
            Admin
          </div>
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
        <AdminDashboard onBack={handleBackToHome} />
      )}
    </>
  );
}