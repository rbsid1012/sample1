window.onload = async () => {
  const encryptedId = window.location.pathname.split("/").pop();
  const badgeEl = document.getElementById("access-badge");
  const nameEl = document.getElementById("display-name");
  const photoEl = document.getElementById("profile-photo");
  const zoneEl = document.getElementById("zone");
  const permissionEl = document.getElementById("permission");
  const timeEl = document.getElementById("time");
  const detailsEl = document.getElementById("details");

  console.log("🔐 Encrypted ID from URL:", encryptedId);

  // Fetch user data from backend
  let data;
  try {
    const res = await fetch(`/api/verify-user-by-id/${encryptedId}`);

    try {
      data = await res.json();
    } catch (jsonErr) {
      console.error("❌ Failed to parse JSON:", jsonErr);
      setBadge("Invalid server response", "denied");
      return;
    }

    if (!res.ok || data.error) {
      console.warn("❌ Server error or user not found:", data.error);
      setBadge(data.error || "User not found", "denied");
      return;
    }

  } catch (err) {
    console.error("❌ Network error:", err);
    setBadge("Network error", "denied");
    return;
  }

  console.log("📦 API Response:", data);

  // Extract safe values
  const granted = data.permission?.toLowerCase() === "yes";
  const name = typeof data.name === "string" ? data.name.trim() : "User";
  const zone = data.zone || "Unknown Zone";
  const permission = data.permission || "unknown";
  const timestamp = data.timestamp || "-";

  // ✅ Set the access badge
  if (granted) {
    setBadge("✅ Access Granted", "granted");
  } else {
    setBadge("🚫 Access Denied", "denied");
  }

  // ✅ Update display name
  nameEl.textContent = name;
  nameEl.classList.remove("hidden");

  // ✅ Show profile photo
  if (data.image_url) {
    photoEl.src = data.image_url;
    photoEl.classList.remove("hidden");
  }

  // ✅ Fill in details
  zoneEl.textContent = zone;
  permissionEl.textContent = permission;
  timeEl.textContent = timestamp;
  detailsEl.classList.remove("hidden");
};

// ✅ Utility: Update badge styling and message
function setBadge(text, type) {
  const badge = document.getElementById("access-badge");
  badge.textContent = text;
  badge.className = `access-badge ${type}`;
}
