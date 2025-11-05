import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeFirestore } from "./lib/initFirestore";

// Initialize Firestore with sample products
initializeFirestore();

createRoot(document.getElementById("root")!).render(<App />);
