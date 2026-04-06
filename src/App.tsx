import { useEffect, useState, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import liff from "@line/liff";
import "./App.css";

import LaunchPage from "./components/LaunchPage.js";
import TinderPage from "./components/TinderPage.js";
import GalleryPage from "./components/GalleryPage.js";
import RoutingPage from "./components/RoutingPage.js";
import CoinRewardsPage from "./components/CoinRewardsPage.js";
import TravelCompanion from "./components/TravelCompanion.js";
import HistoryPage from "./components/HistoryPage.js";
import AboutPage from "./components/AboutPage.js";
import EventPage from "./components/EventPage.js";
import { appApi } from "./services/apiAdapter";

// Development mode - bypass LIFF authentication
const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";

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
    // Development mode - bypass LIFF and use mock user (for local testing without LINE app)
    if (DEV_MODE) {
      console.log("DEV MODE: Bypassing LIFF authentication");
      const mockUser = {
        userId: "dev_user_" + Date.now(),
        displayName: "Dev User",
        pictureUrl: "https://via.placeholder.com/150/8B5CF6/FFFFFF?text=DEV",
      };
      setIsLiffReady(true);
      setIsLoggedIn(true);
      setUserId(mockUser.userId);
      setDisplayName(mockUser.displayName);
      setPictureUrl(mockUser.pictureUrl);

      // Store in localStorage
      localStorage.setItem("liff_userId", mockUser.userId);
      localStorage.setItem("liff_displayName", mockUser.displayName);
      localStorage.setItem("liff_pictureUrl", mockUser.pictureUrl);

      // Initialize user in backend
      appApi.createOrGetUser(mockUser.userId).catch((err: Error) => {
        console.error("DEV MODE: Failed to initialize mock user:", err);
      });

      return;
    }

    // Production mode - use real LIFF
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

              // Initialize user in backend
              appApi.createOrGetUser(profile.userId).catch((err: Error) => {
                console.error("Failed to initialize user:", err);
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
      <div className="min-h-screen bg-[#FAF7F4] flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto bg-[#C2703E] rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#2D2926]">Loading...</h2>
          <p className="text-[#9C9490] text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  // Show error screen if LIFF failed to initialize
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-14 h-14 mx-auto bg-[#C75050]/10 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-[#C75050]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#2D2926]">Initialization Error</h2>
          <p className="text-[#9C9490] text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-[#C2703E] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#A85C2F] transition-colors"
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
          <Route path="/rewards" element={<CoinRewardsPage />} />
          <Route path="/travel-companion" element={<TravelCompanion />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/event" element={<EventPage />} />
        </Routes>
      </Router>
    </LiffContext.Provider>
  );
}

export default App;
