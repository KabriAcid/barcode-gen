// Bottom navigation logic
function renderBottomNav(active) {
  // Remove any existing nav
  const existingNav = document.getElementById("bottom-nav");
  if (existingNav) existingNav.remove();

  const nav = document.createElement("nav");
  nav.id = "bottom-nav";
  nav.className =
    "fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white border-t border-gray-200 shadow-lg flex justify-between items-center py-2 px-6 z-50";
  nav.style.margin = "0 auto";
  nav.innerHTML = `
    <a href="generate.html" class="flex flex-col items-center text-xs ${
      active === "home" ? "text-primary-500" : "text-gray-500"
    }">
      <i data-lucide="home" class="mb-1" style="width:24px;height:24px;"></i>
      Home
    </a>
    <a href="history.html" class="flex flex-col items-center text-xs ${
      active === "history" ? "text-primary-500" : "text-gray-500"
    }">
      <i data-lucide="history" class="mb-1" style="width:24px;height:24px;"></i>
      History
    </a>
    <a href="profile.html" class="flex flex-col items-center text-xs ${
      active === "profile" ? "text-primary-500" : "text-gray-500"
    }">
      <i data-lucide="user" class="mb-1" style="width:24px;height:24px;"></i>
      Profile
    </a>
  `;
  document.body.appendChild(nav);
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}
