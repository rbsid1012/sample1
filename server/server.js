// server/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes.js";        // Existing profile-related routes
import espRouter from "./esp/router.js"; // ✅ ESP verification route

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Log folder paths
console.log("📂 Server root:", __dirname);
console.log("🧾 Frontend folder:", path.join(__dirname, "../frontend"));

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Mount API routes
app.use("/api", routes);
app.use("/api/esp", espRouter);

// ✅ Explicit route for /verification-1/:encryptedId
app.get("/verification-1/:encryptedId", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/verification.html"));
});

// ✅ Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ✅ Wildcard fallback (must be LAST)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 API: /api/...`);
  console.log(`📟 ESP: /api/esp/verify`);
  console.log(`🧭 Verification page: /verification-1/:encryptedId`);
});
