import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Fonts bundled locally — no CDN, works offline
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./styles/themes.css";
import "./styles/print.css";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
