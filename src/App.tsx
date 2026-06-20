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
import LineEntryScreen from "./components/LineEntryScreen.js";
import { appApi } from "./services/apiAdapter";

// Development mode - bypass LIFF authentication
const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";
type LiffStatus = "booting" | "authenticating" | "ready" | "signed-out" | "error" | "missing-config" | "dev";
const getConfiguredLiffId = () =>
  (typeof window !== "undefined" && (window as any).__VITE_LIFF_ID__) ||
  ((typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_LIFF_ID) as string) ||
  "";
const shouldUseMockLiff = (configuredLiffId: string) =>
  DEV_MODE || (import.meta.env.DEV && !configuredLiffId);

// Create context for LIFF user data
export const LiffContext = createContext<{
  isLoggedIn: boolean;
  userId: string | null;
  displayName: string | null;
  pictureUrl: string | null;
  isLiffReady: boolean;
  isInLineClient: boolean;
  liffStatus: LiffStatus;
  loginWithLine: () => void;
  logoutFromLine: () => void;
}>({
  isLoggedIn: false,
  userId: null,
  displayName: null,
  pictureUrl: null,
  isLiffReady: false,
  isInLineClient: false,
  liffStatus: "booting",
  loginWithLine: () => undefined,
  logoutFromLine: () => undefined,
});

function App() {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [liffStatus, setLiffStatus] = useState<LiffStatus>("booting");
  const [isInLineClient, setIsInLineClient] = useState(false);
  const [liffId, setLiffId] = useState("");

  const startMockLiffSession = () => {
    console.log("DEV MODE: Bypassing LIFF authentication");
    const storedUserId = localStorage.getItem("liff_userId");
    const mockUser = {
      userId: storedUserId || "dev_user_local",
      displayName: "Dev User",
      pictureUrl: "https://via.placeholder.com/150/8B5CF6/FFFFFF?text=DEV",
    };

    setError("");
    setIsLiffReady(true);
    setIsLoggedIn(true);
    setUserId(mockUser.userId);
    setDisplayName(mockUser.displayName);
    setPictureUrl(mockUser.pictureUrl);
    setLiffStatus("dev");

    localStorage.setItem("liff_userId", mockUser.userId);
    localStorage.setItem("liff_displayName", mockUser.displayName);
    localStorage.setItem("liff_pictureUrl", mockUser.pictureUrl);

    appApi.createOrGetUser(mockUser.userId, mockUser.displayName, mockUser.pictureUrl).catch((err: Error) => {
      console.error("DEV MODE: Failed to initialize mock user:", err);
    });
  };

  const loginWithLine = () => {
    const configuredLiffId = liffId || getConfiguredLiffId();
    if (shouldUseMockLiff(configuredLiffId)) {
      startMockLiffSession();
      return;
    }

    if (!configuredLiffId) {
      setError("VITE_LIFF_ID is not configured.");
      setLiffStatus("missing-config");
      return;
    }

    setLiffId(configuredLiffId);
    setLiffStatus("authenticating");
    liff.login({ redirectUri: window.location.href });
  };

  const logoutFromLine = () => {
    if (liff.isLoggedIn()) {
      liff.logout();
    }
    setIsLoggedIn(false);
    setUserId(null);
    setDisplayName(null);
    setPictureUrl(null);
    setLiffStatus("signed-out");
    localStorage.removeItem("liff_userId");
    localStorage.removeItem("liff_displayName");
    localStorage.removeItem("liff_pictureUrl");
  };

  const connectLineProfile = async (profile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  }) => {
    setIsLoggedIn(true);
    setUserId(profile.userId);
    setDisplayName(profile.displayName);
    setPictureUrl(profile.pictureUrl || null);
    setLiffStatus("ready");

    localStorage.setItem("liff_userId", profile.userId);
    localStorage.setItem("liff_displayName", profile.displayName);
    if (profile.pictureUrl) {
      localStorage.setItem("liff_pictureUrl", profile.pictureUrl);
    } else {
      localStorage.removeItem("liff_pictureUrl");
    }

    try {
      await appApi.createOrGetUser(profile.userId, profile.displayName, profile.pictureUrl);
    } catch (err) {
      console.error("Failed to initialize user:", err);
    }
  };

  useEffect(() => {
    // Production mode - use real LIFF
    // Initialize LIFF once when the app mounts.
    // Use Vite's import.meta.env at build time, and a window-level fallback for runtime overrides.
    const liffId = getConfiguredLiffId();
    setLiffId(liffId);

    // Local Vite dev can run without a LIFF app ID. Set VITE_LIFF_ID when testing LINE auth.
    if (shouldUseMockLiff(liffId)) {
      startMockLiffSession();
      return;
    }

    if (!liffId) {
      console.warn("LIFF init skipped: VITE_LIFF_ID not provided.");
      setError("VITE_LIFF_ID is required for LINE account linking.");
      setIsLiffReady(true);
      setLiffStatus("missing-config");
      return;
    }

    liff
      .init({ liffId })
      .then(() => {
        console.log("LIFF init succeeded.");
        const inClient = liff.isInClient();
        setIsInLineClient(inClient);
        setIsLiffReady(true);

        // Check if user is logged in
        if (liff.isLoggedIn()) {
          setLiffStatus("authenticating");

          // Get user profile
          liff
            .getProfile()
            .then(async (profile) => {
              console.log("User logged in:", {
                userId: profile.userId,
                displayName: profile.displayName,
              });
              await connectLineProfile(profile);
            })
            .catch((err) => {
              console.error("Failed to get profile:", err);
              setError("Failed to get user profile");
              setLiffStatus("error");
            });
        } else {
          setLiffStatus("signed-out");
          if (inClient) {
            console.log("User not logged in inside LINE, redirecting to login...");
            loginWithLine();
          }
        }
      })
      .catch((e: Error) => {
        console.error("LIFF init failed:", e);
        setError(`LIFF init failed: ${e.message}`);
        setIsLiffReady(true);
        setLiffStatus("error");
      });
  }, []);

  // Show loading screen while LIFF initializes
  if (!isLiffReady || liffStatus === "booting" || liffStatus === "authenticating") {
    return (
      <LineEntryScreen mode="loading" isInLineClient={isInLineClient} liffId={liffId} />
    );
  }

  if (liffStatus === "missing-config") {
    return (
      <LineEntryScreen mode="missing-config" message={error} onRetry={() => window.location.reload()} />
    );
  }

  if (liffStatus === "signed-out" && !isLoggedIn) {
    return (
      <LineEntryScreen
        mode="connect"
        isInLineClient={isInLineClient}
        liffId={liffId}
        onLogin={loginWithLine}
      />
    );
  }

  if (liffStatus === "error") {
    return (
      <LineEntryScreen
        mode="error"
        message={error}
        isInLineClient={isInLineClient}
        liffId={liffId}
        onLogin={loginWithLine}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const liffContextValue = {
    isLoggedIn,
    userId,
    displayName,
    pictureUrl,
    isLiffReady,
    isInLineClient,
    liffStatus,
    loginWithLine,
    logoutFromLine,
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
