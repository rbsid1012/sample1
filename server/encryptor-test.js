// server/encryptor-test.js
import dotenv from 'dotenv';
dotenv.config(); // ✅ Must come before imports that use env vars

import { encrypt } from './encryptor.js';

// Replace this with the actual user ID from your DB
const userId = 'a002bad6-a859-4fa6-9cd2-c831fcc090ee';

try {
  const encrypted = encrypt(userId);
  console.log("\n🔐 Encrypted profile URL:");
  console.log(`/profile/${encrypted}\n`);
} catch (err) {
  console.error("❌ Failed to encrypt:", err.message);
}
