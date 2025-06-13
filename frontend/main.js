// Extract user ID from URL like /profile/:userId
function getUserIdFromUrl() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[2];
}

// Extract token from URL query string
function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
}

// Display a temporary success/error message
function displayMessage(message, type, duration = 3000) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;

    messageDiv.innerText = message;
    messageDiv.className = `message ${type} show`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 500);
    }, duration);
}

// Spark animation logic
function createSpark(x, y, cardRect) {
    const spark = document.createElement('div');
    spark.className = 'border-spark';
    document.body.appendChild(spark);

    const sparkX = x - cardRect.left;
    const sparkY = y - cardRect.top;

    spark.style.left = `${sparkX}px`;
    spark.style.top = `${sparkY}px`;

    const size = Math.random() * 8 + 4;
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;

    const colors = ['#FF4500', '#FF8C00', '#FFD700', '#FFA500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    spark.style.backgroundColor = color;
    spark.style.boxShadow = `0 0 ${size / 2}px ${size / 4}px ${color}`;

    spark.style.animationDuration = `${Math.random() * 0.8 + 0.4}s`;
    spark.style.animationDelay = `${Math.random() * 0.2}s`;

    spark.style.setProperty('--rise-y', `${-(Math.random() * 50 + 20)}px`);
    spark.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 40}px`);
    spark.style.setProperty('--rotate', `${Math.random() * 360}deg`);

    spark.addEventListener('animationend', () => {
        spark.remove();
    });
}

function initSparkles() {
    const profileCard = document.querySelector('.profile-card');
    if (!profileCard) return;

    let timer = null;
    profileCard.addEventListener('mousemove', (e) => {
        if (!timer) {
            timer = setTimeout(() => {
                const cardRect = profileCard.getBoundingClientRect();
                createSpark(e.clientX, e.clientY, cardRect);
                timer = null;
            }, 80);
        }
    });
}

// Main profile loading function
async function loadProfile() {
    const userId = getUserIdFromUrl();
    const token = getTokenFromUrl();

    if (!userId) {
        displayMessage("User ID missing from URL", 'error');
        return;
    }

    try {
        const url = token
            ? `/api/${userId}/protected?token=${token}`
            : `/api/profile/${userId}`;

        const response = await fetch(url);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Failed to load profile");

        const profileData = json.protectedData || json.publicData;

        // Set public values
        document.getElementById("name").innerText = profileData.name || "Unnamed";
        document.getElementById("role").innerText = profileData.role || "Not specified";
        document.getElementById("bio").innerText = profileData.bio || "No bio available";
        document.getElementById("token_amount").innerText = parseFloat(profileData.token_amount || 0).toFixed(2);

        // Profile image
        const img = document.getElementById("profile-image");
        if (profileData.image_url) {
            img.src = profileData.image_url;
            img.style.display = "block";
            img.onerror = () => {
                img.style.display = "none";
                displayMessage("Failed to load image", 'error');
            };
        } else {
            img.style.display = "none";
        }

        // Links
        const setLink = (id, url) => {
            const el = document.getElementById(id);
            if (el) {
                if (url) {
                    el.href = url;
                    el.style.display = (id === 'pitch-deck-link') ? 'inline-flex' : 'flex';
                } else {
                    el.style.display = 'none';
                }
            }
        };

        setLink("instagram-link", profileData.instagram_url);
        setLink("whatsapp-link", profileData.whatsapp_number);
        setLink("linkedin-link", profileData.linkedin_url);
        setLink("pitch-deck-link", profileData.pitch_deck_url);

        // Always visible public data (phone/email/roll)
        document.getElementById("phone-display").innerText = profileData.phone || "Not provided";
        document.getElementById("email-display").innerText = profileData.email || "Not provided";
        document.getElementById("roll_number-display").innerText = profileData.roll_number || "Not provided";

        document.getElementById("skills-display").innerText = profileData.skills || "No skills listed";
        document.getElementById("more-info").innerText = profileData.more_info || "No additional info";

        // Protected section
        const protectedSection = document.getElementById("protected-section");
        if (json.protectedData && protectedSection) {
            protectedSection.style.display = "block";
            document.getElementById("address").innerText = profileData.address || "Confidential";

            // Update token logic
            const updateTokenBtn = document.getElementById("update-token");
            if (updateTokenBtn) {
                updateTokenBtn.onclick = async () => {
                    const newAmount = document.getElementById("token-amount-input").value;
                    if (isNaN(parseFloat(newAmount))) {
                        displayMessage("Invalid token amount", 'error');
                        return;
                    }

                    const result = await fetch(`/api/${userId}/protected/update-token`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token, new_token_amount: newAmount })
                    });

                    const resData = await result.json();
                    if (result.ok) {
                        displayMessage(resData.message, 'success');
                        loadProfile(); // Refresh
                    } else {
                        displayMessage(resData.error || 'Token update failed', 'error');
                    }
                };
            }
        } else if (protectedSection) {
            protectedSection.style.display = "none";
        }

        displayMessage("Profile loaded successfully!", 'success', 4000);
    } catch (err) {
        console.error("Error loading profile:", err);
        document.getElementById("name").innerText = "Error loading profile.";
        displayMessage(err.message, 'error', 5000);
        const img = document.getElementById("profile-image");
        if (img) img.style.display = "none";
        const protectedSection = document.getElementById("protected-section");
        if (protectedSection) protectedSection.style.display = "none";
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    initSparkles();
});
