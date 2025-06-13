// server/routes.js
import express from "express";
import {
  getPublicProfileData,
  getPublicProfileDataById,
  getProtectedProfileData,
  updateTokenAmount
} from "./db.js";
import { decrypt } from "./encryptor.js";

const router = express.Router();

// ✅ Middleware: log incoming requests
router.use((req, res, next) => {
  console.log(`▶️ API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Health check
router.get("/ping", (req, res) => {
  res.send("✅ API is live");
});

// ✅ Public profile route using encrypted ID
router.get("/profile/:encryptedId", async (req, res) => {
  const { encryptedId } = req.params;

  try {
    const userId = decrypt(encryptedId);
    console.log("🔐 Decrypted userId:", userId);

    const publicData = await getPublicProfileDataById(userId);
    res.json({ publicData });
  } catch (err) {
    console.error("❌ Error decrypting or fetching profile:", err.message);
    res.status(404).json({ error: "Invalid or expired profile link" });
  }
});

// ✅ Public profile route (by username — legacy support)
router.get("/:username([a-zA-Z0-9_]+)", async (req, res) => {
  const { username } = req.params;

  try {
    const publicData = await getPublicProfileData(username);
    res.json({ publicData });
  } catch (error) {
    console.error("❌ Error in public profile (username):", error.message);
    res.status(404).json({ error: error.message });
  }
});

// ✅ Protected profile route
router.get("/:username/protected", async (req, res) => {
  const { username } = req.params;
  const { token } = req.query;

  try {
    const protectedData = await getProtectedProfileData(username, token);
    res.json({ protectedData });
  } catch (error) {
    console.error("❌ Error in protected profile:", error.message);
    res.status(401).json({ error: error.message });
  }
});

// ✅ Update token amount (protected)
router.post("/:username/protected/update-token", async (req, res) => {
  const { username } = req.params;
  const { token, new_token_amount } = req.body;

  try {
    const result = await updateTokenAmount(username, token, new_token_amount);
    res.json(result);
  } catch (error) {
    console.error("❌ Error updating token amount:", error.message);
    res.status(400).json({ error: error.message });
  }
});

export default router;
