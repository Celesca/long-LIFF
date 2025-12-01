import { useEffect, useState, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import liff from "@line/liff";
import "./App.css";

import LaunchPage from "./components/LaunchPage.js";
import TinderPage from "./components/TinderPage.js";
import GalleryPage from "./components/GalleryPage.js";
import RoutingPage from "./components/RoutingPage.js";

// Create context for LIFF user data
export const LiffContext = createContext<{
  isLoggedIn: boolean;
  userId: string | null;
  displayName: string | null;
  pictureUrl: string | null;
  isLiffReady: boolean;
}>({
  isLoggedIn: false,
  userId: null,
  displayName: null,
  pictureUrl: null,
  isLiffReady: false,
});

function App() {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize LIFF once when the app mounts.
    // Use Vite's import.meta.env at build time, and a window-level fallback for runtime overrides.
    const liffId =
      (typeof window !== "undefined" && (window as any).__VITE_LIFF_ID__) ||
      ((typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_LIFF_ID) as string) ||
      "";

    if (!liffId) {
      console.warn("LIFF init skipped: VITE_LIFF_ID not provided.");
      setIsLiffReady(true);
      return;
    }

    liff
      .init({ liffId })
      .then(() => {
        console.log("LIFF init succeeded.");
        setIsLiffReady(true);

        // Check if user is logged in
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);

          // Get user profile
          liff
            .getProfile()
            .then((profile) => {
              setUserId(profile.userId);
              setDisplayName(profile.displayName);
              setPictureUrl(profile.pictureUrl || null);
              
              // Store userId in localStorage for persistence
              localStorage.setItem("liff_userId", profile.userId);
              localStorage.setItem("liff_displayName", profile.displayName);
              if (profile.pictureUrl) {
                localStorage.setItem("liff_pictureUrl", profile.pictureUrl);
              }

              console.log("User logged in:", {
                userId: profile.userId,
                displayName: profile.displayName,
              });
            })
            .catch((err) => {
              console.error("Failed to get profile:", err);
              setError("Failed to get user profile");
            });
        } else {
          // User not logged in - trigger login
          console.log("User not logged in, redirecting to login...");
          liff.login();
        }
      })
      .catch((e: Error) => {
        console.error("LIFF init failed:", e);
        setError(`LIFF init failed: ${e.message}`);
        setIsLiffReady(true);
      });
  }, []);

  // Show loading screen while LIFF initializes
  if (!isLiffReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-purple-800">Loading YEEPING...</h2>
          <p className="text-purple-600">Please wait</p>
        </div>
      </div>
    );
  }

  // Show error screen if LIFF failed to initialize
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-red-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-800">Initialization Error</h2>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const liffContextValue = {
    isLoggedIn,
    userId,
    displayName,
    pictureUrl,
    isLiffReady,
  };

  return (
    <LiffContext.Provider value={liffContextValue}>
      <Router>
        <Routes>
          <Route path="/" element={<LaunchPage />} />
          <Route path="/tinder" element={<TinderPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/routing" element={<RoutingPage />} />
        </Routes>
      </Router>
    </LiffContext.Provider>
  );
}

export default App;
