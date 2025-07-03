// server/esp/crypto.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load private and public keys
const privateKey = fs.readFileSync(path.join(__dirname, 'private.pem'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, 'public.pem'), 'utf8');

// Decrypt an incoming payload (encrypted with public key)
export function decryptPayload(base64Encrypted) {
  try {
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

// Encrypt server response using public key
export function encryptResponse(text) {
  try {
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
