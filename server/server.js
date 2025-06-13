import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debugging - log the paths we're using
console.log("Server directory:", __dirname);
console.log("Frontend directory:", path.join(__dirname, "../frontend"));

// Parse JSON bodies
app.use(express.json());

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Mount your API routes with /api prefix
app.use("/api", routes);

// Handle root route explicitly (optional but recommended)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Fallback route for SPA routing (if needed)
app.get("*", (req, res) => {
  // This will handle any routes not matched above
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`API routes available at http://localhost:${PORT}/api/[username]`);
});