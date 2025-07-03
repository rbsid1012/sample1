// server/key-loader.js
import fs from "fs";
import path from "path";

// Utility to decode and write a key
const writeKey = (envVar, filePath) => {
  const base64 = process.env[envVar];
  if (!base64) {
    console.warn(`⚠️ Missing environment variable: ${envVar}`);
    return;
  }
  const decoded = Buffer.from(base64, "base64").toString("utf8");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, decoded, { mode: 0o600 });
  console.log(`✅ Key written: ${filePath}`);
};

// 🔐 Write keys from environment vars
writeKey("PRIVATE_PEM_B64", "server/esp/private.pem");
writeKey("VERIFY_PRIVATE_PEM_B64", "server/esp/verifier/verify-private.pem");
