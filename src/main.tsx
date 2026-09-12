import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./yuniko/index.css";
import "./yuniko/light-mode-fixes.css";
import "./yuniko/responsive.css";

createRoot(document.getElementById("root")!).render(<App />);
