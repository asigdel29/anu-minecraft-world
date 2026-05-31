import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.jsx";
import { initAnalytics } from "./lib/analytics";

// Start product analytics before the app mounts so the initial pageview and
// session are captured (no-op when no key is configured).
initAnalytics();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
