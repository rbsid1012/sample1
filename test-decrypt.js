// test-decrypt.js
import fs from "fs";
import crypto from "crypto";
import path from "path";

const readKey = (label, filePath) => {
  const key = fs.readFileSync(filePath, "utf8");
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  console.log(`🔐 Key hash (${label}):`, hash);
  return key;
};

// Load keys + show unique fingerprint of each
const profilePrivate = readKey("profile-private", "server/esp/private.pem");
const profilePublic = readKey("profile-public", "server/esp/public.pem");

const verifierPrivate = readKey("verifier-private", "server/esp/verifier/verify-private.pem");
const verifierPublic = readKey("verifier-public", "server/esp/verifier/verify-public.pem");

const message = "test-user-id";

// Encrypt separately
const encryptedProfile = crypto.publicEncrypt(
  {
    key: profilePublic,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },
  Buffer.from(message)
);

const encryptedVerifier = crypto.publicEncrypt(
  {
    key: verifierPublic,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },
  Buffer.from(message)
);

// Decrypt each
const decryptedFromProfile = crypto.privateDecrypt(
  {
    key: profilePrivate,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },
  encryptedProfile
).toString();

const decryptedFromVerifier = crypto.privateDecrypt(
  {
    key: verifierPrivate,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },
  encryptedVerifier
).toString();

console.log("\n🔓 Decrypted with profile-private.pem:", decryptedFromProfile);
console.log("🔓 Decrypted with verify-private.pem:", decryptedFromVerifier);

if (decryptedFromProfile === decryptedFromVerifier) {
  console.log("⚠️  Result match — key content may be duplicated or reused.");
} else {
  console.log("✅ Keys are distinct — results decrypted independently.");
}
