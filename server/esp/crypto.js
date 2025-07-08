import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Resolve directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Decrypt payload using PRIVATE_PEM_B64 (from env)
 */
export function decryptPayload(base64Encrypted) {
  try {
    const privateKey = Buffer.from(process.env.PRIVATE_PEM_B64, 'base64').toString('utf8');
    const buffer = Buffer.from(base64Encrypted, 'base64');

    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      },
      buffer
    );

    return decrypted.toString('utf8');
  } catch (err) {
    console.error("❌ Decryption failed:", err.message);
    throw new Error("Invalid encrypted payload");
  }
}

/**
 * Encrypt response using public.pem from local file
 */
export function encryptResponse(text) {
  try {
    const publicKeyPath = path.join(__dirname, 'public.pem');
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    const buffer = Buffer.from(text, 'utf8');

    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      },
      buffer
    );

    return encrypted.toString('base64');
  } catch (err) {
    console.error("❌ Encryption failed:", err.message);
    throw new Error("Failed to encrypt response");
  }
}
