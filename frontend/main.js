// ✅ Get user ID from URL: /profile/:userId
function getUserIdFromUrl() {
  const pathSegments = window.location.pathname.split('/');
  return pathSegments[2] || null;
}

// ✅ Get ?token=xyz from query string
function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

// ✅ Save as .vcf contact file
function saveToPhone() {
  const name = document.getElementById("name")?.textContent || "Unnamed";
  const emailHref = document.getElementById("email-link")?.href || "";
  const phoneHref = document.getElementById("whatsapp-link")?.href || "";

  const email = emailHref.startsWith("mailto:") ? emailHref.replace("mailto:", "") : "";
  const phone = phoneHref.includes("wa.me") ? phoneHref.split("wa.me/")[1] : "";

  const vcf = `
BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:${phone}
EMAIL:${email}
END:VCARD
  `.trim();

  const blob = new Blob([vcf], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ✅ Load and inject user profile
async function loadProfile() {
  const userId = getUserIdFromUrl();
  const token = getTokenFromUrl();

  if (!userId) {
    alert("❌ User ID is missing from URL.");
    return;
  }

  try {
    const apiUrl = token
      ? `/api/${userId}/protected?token=${token}`
      : `/api/profile/${userId}`;

    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!res.ok) throw new Error(json.error || "Failed to load profile");

    const data = json.protectedData || json.publicData;
    console.log("✅ Loaded profile data:", data);

    // Inject text
    document.getElementById("name").textContent = data.name || "Unnamed";
    document.getElementById("role").textContent = data.role || "Unknown";
    document.getElementById("bio").textContent = data.bio || "No bio available.";

    // Profile image
    const img = document.getElementById("profile-image");
    if (data.image_url) {
      img.src = data.image_url;
      img.style.display = "block";
      img.onerror = () => {
        console.warn("⚠️ Failed to load profile image.");
        img.style.display = "none";
      };
    } else {
      img.style.display = "none";
    }

    // Social links
    const instagram = document.getElementById("instagram-link");
    const whatsapp = document.getElementById("whatsapp-link");
    const email = document.getElementById("email-link");
    const linkedin = document.getElementById("linkedin-link");

    if (instagram) instagram.href = data.instagram_url || "#";

    if (whatsapp && data.whatsapp_number) {
      const number = data.whatsapp_number.replace(/\D/g, '');
      whatsapp.href = `https://wa.me/${number}`;
    }

    if (email && data.email) {
      email.href = `mailto:${data.email}`;
    }

    if (linkedin) linkedin.href = data.linkedin_url || "#";

    // Pitch Deck button handler (uses <button>)
    const pitchDeckBtn = document.getElementById("pitch-deck-button");
    if (pitchDeckBtn && data.pitch_deck_url) {
      pitchDeckBtn.style.display = "inline-block";
      pitchDeckBtn.onclick = () => {
        window.open(data.pitch_deck_url, "_blank");
      };
    }

  } catch (err) {
    console.error("❌ Error loading profile:", err.message);
    const name = document.getElementById("name");
    if (name) name.textContent = "Error loading profile.";
  }
}

// ✅ Init everything
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 main.js loaded");
  loadProfile();

  const saveBtn = document.querySelector('button[onclick="saveToPhone()"]');
  if (saveBtn) {
    saveBtn.addEventListener("click", saveToPhone);
  }
});
