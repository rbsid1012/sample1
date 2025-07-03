// server/verifier/verifier-encryptor-test.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// ✅ ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔑 Load the verifier public key
const publicKey = fs.readFileSync(path.join(__dirname, "verify-public.pem"), "utf8");

// 🧑‍💼 Replace with actual user_id
const userId = "a002bad6-a859-4fa6-9cd2-c831fcc090ee";

// 🔐 Encrypt using RSA OAEP SHA256
const buffer = Buffer.from(userId, "utf8");

const encrypted = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },
  buffer
);

// 📦 Base64 URL-safe encoding
const encryptedId = encrypted.toString("base64url");

console.log("✅ Encrypted user_id:");
console.log(encryptedId);

console.log("\n🔗 Direct test link:");
console.log(`http://localhost:3000/verification-1/${encryptedId}`);
