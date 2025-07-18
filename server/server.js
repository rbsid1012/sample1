// server/server.js
import "./key-loader.js"; // Ensure keys load first
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes.js";        // ✅ Default export from routes.js
import espRouter from "./esp/router.js"; // ✅ ESP verification routes

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logging
console.log("📂 Server root:", __dirname);
console.log("🧾 Frontend folder:", path.join(__dirname, "../frontend"));

// ✅ Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Mount routes
app.use("/api", routes);         // General routes
app.use("/api/esp", espRouter);  // ESP-specific routes

// ✅ Serve verification page
app.get("/verification-1/:encryptedId", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/verification.html"));
});

// ✅ Root fallback
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ✅ Catch-all fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 API: /api/...`);
  console.log(`📟 ESP: /api/esp/verify`);
});
