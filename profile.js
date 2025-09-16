// Profile page logic
const userId = localStorage.getItem("userId");
if (!userId) window.location.href = "index.html";

const form = document.getElementById("profile-form");
const feedback = document.getElementById("profile-feedback");
const logoutBtn = document.getElementById("logout-btn");

// Fetch user details from backend and fill fields
async function loadUserDetails() {
  try {
    const res = await fetch(`/api/user?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to load user");
    const user = await res.json();
    document.getElementById("profile-name").value = user.username || "";
    document.getElementById("profile-phone").value = user.phone || "";
  } catch (e) {
    // fallback: leave blank
  }
}

// Load user settings from localStorage
function loadSettings() {
  const settings = JSON.parse(
    localStorage.getItem(`settings_${userId}`) || "{}"
  );
  document.getElementById("default-label-size").value =
    settings.labelSize || "30mm";
  document.getElementById("default-copies").value = settings.copies || 1;
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("profile-name").value.trim();
  const phone = document.getElementById("profile-phone").value.trim();
  const labelSize = document.getElementById("default-label-size").value;
  const copies = parseInt(document.getElementById("default-copies").value) || 1;
  const settings = { name, phone, labelSize, copies };
  localStorage.setItem(`settings_${userId}`, JSON.stringify(settings));
  feedback.classList.remove("hidden");
  setTimeout(() => feedback.classList.add("hidden"), 2000);
});

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("userId");
  window.location.href = "index.html";
});

loadUserDetails();
loadSettings();

// Render bottom nav with active state
if (typeof renderBottomNav === "function") {
  renderBottomNav("profile");
} else {
  window.addEventListener("DOMContentLoaded", function () {
    if (typeof renderBottomNav === "function") renderBottomNav("profile");
  });
}
