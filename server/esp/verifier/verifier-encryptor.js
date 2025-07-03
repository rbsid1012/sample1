// server/verifier/verifier-encryptor.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load verification-specific keys
const privateKey = fs.readFileSync(path.join(__dirname, "verify-private.pem"), "utf8");
const publicKey = fs.readFileSync(path.join(__dirname, "verify-public.pem"), "utf8");

export function encryptVerificationId(userId) {
  const buffer = Buffer.from(userId, "utf8");
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    },
    buffer
  );
  return encrypted.toString("base64url");
}

export function decryptVerificationId(encryptedId) {
  try {
    const buffer = Buffer.from(encryptedId, "base64");
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      },
      buffer
    );
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("❌ Verification ID decrypt failed:", err.message);
    throw new Error("Invalid or expired link");
  }
}
