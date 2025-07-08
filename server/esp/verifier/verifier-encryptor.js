import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Encrypts a user ID using verify-public.pem (local file)
 */
export function encryptVerificationId(userId) {
  try {
    const publicKeyPath = path.join(__dirname, 'verify-public.pem');
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

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
 * Decrypts encrypted ID using VERIFY_PRIVATE_PEM_B64 from env
 */
export function decryptVerificationId(encryptedId) {
  try {
    const privateKey = Buffer.from(process.env.VERIFY_PRIVATE_PEM_B64, 'base64').toString('utf8');

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
