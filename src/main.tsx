import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeFirestore } from "./lib/initFirestore";

// Seed products on every run (skips if already present)
initializeFirestore();

createRoot(document.getElementById("root")!).render(<App />);
