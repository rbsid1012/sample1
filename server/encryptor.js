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

// ✅ Load .env from root directory
dotenv.config({ path: envPath });

// 📄 DEBUG: Print .env contents to verify it's being read
try {
  const rawEnv = fs.readFileSync(envPath, 'utf-8');
  console.log("📄 Loaded .env file content:\n", rawEnv);
} catch (err) {
  console.error("❌ Could not read .env file:", err.message);
}

const ENCRYPTION_KEY = process.env.PROFILE_ENCRYPTION_KEY;

console.log("🧪 Loaded ENCRYPTION_KEY =", ENCRYPTION_KEY?.slice(0, 8) || 'undefined');

if (!ENCRYPTION_KEY) {
  throw new Error("❌ PROFILE_ENCRYPTION_KEY is not set in .env!");
}

const IV_LENGTH = 16;

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}
