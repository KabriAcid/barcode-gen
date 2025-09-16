// Bottom navigation logic
function renderBottomNav(active) {
  const nav = document.createElement("nav");
  nav.className =
    "fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg flex justify-around items-center py-2 z-50";
  nav.innerHTML = `
    <a href="index.html" class="flex flex-col items-center text-xs ${
      active === "home" ? "text-primary-500" : "text-gray-500"
    }">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" /></svg>
      Home
    </a>
    <a href="history.html" class="flex flex-col items-center text-xs ${
      active === "history" ? "text-primary-500" : "text-gray-500"
    }">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17l4 4 4-4m-4-5v9" /></svg>
      History
    </a>
    <a href="profile.html" class="flex flex-col items-center text-xs ${
      active === "profile" ? "text-primary-500" : "text-gray-500"
    }">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      Profile
    </a>
  `;
  document.body.appendChild(nav);
}

// Usage: renderBottomNav('home'), renderBottomNav('history'), renderBottomNav('profile')
// Call this in each page's script with the correct active value.
