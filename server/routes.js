// server/routes.js
import express from "express";
import {
  getPublicProfileData,
  getPublicProfileDataById,
  getProtectedProfileData,
  updateTokenAmount,

  getUserById,
} from "./db.js";

import { decrypt } from "./encryptor.js";
import { decryptVerificationId } from "./esp/verifier/verifier-encryptor.js";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware: log every request
router.use((req, res, next) => {
  console.log(`▶️ API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Health check
router.get("/ping", (req, res) => {
  res.send("✅ API is live");
});

// ✅ /profile/:encryptedId → public profile (uses original encryptor.js)
router.get("/profile/:encryptedId", async (req, res) => {
  try {
    const userId = decrypt(req.params.encryptedId);
    const publicData = await getPublicProfileDataById(userId);
    res.json({ publicData });
  } catch (err) {
    console.error("❌ Profile decrypt error:", err.message);
    res.status(404).json({ error: "Invalid or expired profile link" });
  }
});

// ✅ /:username → fallback legacy support
router.get("/:username([a-zA-Z0-9_]+)", async (req, res) => {
  try {
    const publicData = await getPublicProfileData(req.params.username);
    res.json({ publicData });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// ✅ /:username/protected → secure data with token
router.get("/:username/protected", async (req, res) => {
  try {
    const protectedData = await getProtectedProfileData(req.params.username, req.query.token);
    res.json({ protectedData });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ✅ Update token balance in profile
router.post("/:username/protected/update-token", async (req, res) => {
  try {
    const { token, new_token_amount } = req.body;
    const result = await updateTokenAmount(req.params.username, token, new_token_amount);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Serve frontend: /verification-1/:encryptedId
router.get("/verification-1/:encryptedId", (req, res) => {
  const filePath = path.join(__dirname, "../frontend/verification.html");
  res.sendFile(filePath);
});

// ✅ API route: /verify-user-by-id/:encryptedId (decrypts ID using verifier keys)
router.get("/verify-user-by-id/:encryptedId", async (req, res) => {
  try {
    const encryptedId = req.params.encryptedId;
    const userId = decryptVerificationId(encryptedId);
    console.log("✅ Decrypted user_id:", userId);

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("👤 Fetched profile by ID:", user);

    res.json({
      user_id: user.id,
      permission: user.permission,
      zone: "General Access",
      timestamp: new Date().toLocaleString(),
      name: user.public_data?.name || "Anonymous",
      image_url: user.image_url || null,
    });
  } catch (err) {
    console.error("❌ Error loading verification profile:", err.message);
    res.status(400).json({ error: "Invalid or expired verification ID" });
  }
});

export default router;
