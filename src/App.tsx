import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import liff from "@line/liff";
import "./App.css";

import LaunchPage from "./components/LaunchPage.js";
import TinderPage from "./components/TinderPage.js";
import GalleryPage from "./components/GalleryPage.js";
import RoutingPage from "./components/RoutingPage.js";

function App() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize LIFF once when the app mounts.
    // Use Vite's import.meta.env at build time, and a window-level fallback for runtime overrides.
    const liffId =
      (typeof window !== "undefined" && (window as any).__VITE_LIFF_ID__) ||
      ((typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_LIFF_ID) as string) ||
      "";

    if (!liffId) {
      setMessage("LIFF init skipped: VITE_LIFF_ID not provided.");
      return;
    }

    liff
      .init({ liffId })
      .then(() => setMessage("LIFF init succeeded."))
      .catch((e: Error) => {
        setMessage("LIFF init failed.");
        setError(String(e));
      });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LaunchPage />} />
        <Route path="/tinder" element={<TinderPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/routing" element={<RoutingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
