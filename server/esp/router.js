// server/esp/router.js
import express from "express";
import { decryptPayload, encryptResponse } from "./crypto.js";
import { getUserById } from "../db.js";
import { getCredentialByMac } from "./db-utils.js";
import { encryptVerificationId } from "./verifier/verifier-encryptor.js";

const router = express.Router();

router.post("/verify", async (req, res) => {
  const encrypted = req.body?.data;
  if (!encrypted) {
    return res.status(400).json({ error: "Missing encrypted payload" });
  }

  try {
    // Step 1: Decrypt the ESP32 payload
    const decrypted = decryptPayload(encrypted);
    const payload = JSON.parse(decrypted);
    console.log("🔓 Decrypted ESP payload:", payload);

    const { user_id, mac, timestamp, lat, lng } = payload;

    // Step 2: Validate timestamp (2 minute window)
    const now = Date.now();
    const delta = Math.abs(now - Number(timestamp));
    if (delta > 2 * 60 * 1000) {
      return res.json({ data: encryptResponse("ACCESS DENIED: Timestamp expired") });
    }

    // Step 3: Lookup MAC address and zone in Supabase
    const credential = await getCredentialByMac(mac);
    if (!credential) {
      return res.json({ data: encryptResponse("ACCESS DENIED: MAC address not recognized") });
    }

    const { lat: allowedLat, lng: allowedLng, radius_m } = credential;
    const dist = getDistanceKM(lat, lng, allowedLat, allowedLng);
    if (dist > (radius_m / 1000)) {
      return res.json({ data: encryptResponse("ACCESS DENIED: Outside allowed geofence") });
    }

    // Step 4: Check user permission in database
    const user = await getUserById(user_id);
    if (!user || user.permission?.toLowerCase() !== "yes") {
      return res.json({ data: encryptResponse("ACCESS DENIED: User not authorized") });
    }

    // Step 5: Encrypt response with verifier key
    const encryptedId = encryptVerificationId(user_id);
    const verificationLink = `https://yourdomain.com/verification-1/${encryptedId}`;
    return res.json({ data: encryptResponse(verificationLink) });

  } catch (err) {
    console.error("❌ ESP /verify error:", err.message);
    return res.status(400).json({ error: "Invalid encrypted payload" });
  }
});

// Helper: Haversine formula
function getDistanceKM(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default router;
