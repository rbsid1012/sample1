// server/esp/verifier/verifier-encryptor.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// ⛓️ Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Lazy-load key when function runs
function loadKey(filename) {
  const filePath = path.join(__dirname, filename);
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Encrypts a user ID using the verification public key
 * (used by ESP32 to send encrypted payload to /verification-1 route)
 */
export function encryptVerificationId(userId) {
  try {
    const publicKey = loadKey("verify-public.pem");

    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      },
      Buffer.from(userId, "utf8")
    );

    return encrypted.toString("base64url");
  } catch (err) {
    console.error("❌ Encryption error:", err.message);
    throw new Error("Verification ID encryption failed");
  }
}

/**
 * Decrypts a base64-encrypted payload using the verification private key
 * (used by server to decrypt incoming ESP32 payload)
 */
export function decryptVerificationId(encryptedId) {
  try {
    const privateKey = loadKey("verify-private.pem");

    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      },
      Buffer.from(encryptedId, "base64")
    );

    return decrypted.toString("utf8");
  } catch (err) {
    console.error("❌ Verification ID decrypt failed:", err.message);
    throw new Error("Invalid or expired encrypted ID");
  }
}
