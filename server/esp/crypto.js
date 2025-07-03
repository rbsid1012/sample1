// server/esp/crypto.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Resolve directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Safe function to load key lazily
function loadKey(filename) {
  const filePath = path.join(__dirname, filename);
  return fs.readFileSync(filePath, 'utf8');
}

// ✅ Decrypt incoming payload using private key
export function decryptPayload(base64Encrypted) {
  try {
    const privateKey = loadKey('private.pem');
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

// ✅ Encrypt response using public key
export function encryptResponse(text) {
  try {
    const publicKey = loadKey('public.pem');
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
