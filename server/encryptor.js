// server/encryptor.js
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ⛓️ Resolve directory and .env path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

// ✅ Load .env
dotenv.config({ path: envPath });

const ENCRYPTION_KEY = process.env.PROFILE_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("❌ PROFILE_ENCRYPTION_KEY is not set in .env!");
}

const key = Buffer.from(ENCRYPTION_KEY, 'hex'); // 32-byte key for AES-256

// 🔁 Helper to encode to URL-safe base64
function base64url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// 🔁 Helper to decode from URL-safe base64
function fromBase64url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4 !== 0) str += '=';
  return Buffer.from(str, 'base64');
}

// ✅ AES-256-GCM Encryption (Compact)
export function encrypt(text) {
  const iv = crypto.randomBytes(12); // 12-byte IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  const payload = Buffer.concat([iv, authTag, encrypted]);
  return base64url(payload); // ~56–64 chars
}

// ✅ AES-256-GCM Decryption
export function decrypt(encoded) {
  const data = fromBase64url(encoded);

  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}
