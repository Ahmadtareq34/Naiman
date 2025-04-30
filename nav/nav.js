const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://naiman.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded. Initializing navigation...");

  const initializeNavigation = () => {
    const navbarRight = document.querySelector(".navbar-right");
    const dropdownIcon = document.querySelector(".dropdown-icon");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const searchBar = document.querySelector(".search-bar");

    if (!navbarRight || !dropdownIcon || !dropdownMenu || !searchBar) {
      console.error("Required navbar elements not found.");
      return;
    }

    const authButtons = navbarRight.querySelector("#auth-buttons");
    const accountSection = navbarRight.querySelector("#account-section");
    const userEmail = navbarRight.querySelector("#user-email");
    const logoutButton = navbarRight.querySelector("#logout-button");
    const accountIcon = navbarRight.querySelector("#account-icon");
    const accountDropdown = navbarRight.querySelector("#account-dropdown");

    if (!authButtons || !accountSection || !userEmail || !logoutButton || !accountIcon || !accountDropdown) {
      console.warn("Some elements inside navbar-right are missing. Retrying on next mutation...");
      return;
    }

    // Check session
    fetch(`${BASE_URL}/auth/user-status`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.loggedIn) {
          authButtons.classList.add("hidden");
          accountSection.classList.remove("hidden");
          userEmail.textContent = data.email;
        } else {
          authButtons.classList.remove("hidden");
          accountSection.classList.add("hidden");
        }
      })
      .catch((error) => {
        console.error("Error fetching user status:", error);
      });

    // Toggle account dropdown
    accountIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      accountDropdown.classList.toggle("show-dropdown");
    });

    // Toggle category dropdown
    dropdownIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", function (e) {
      if (!accountSection.contains(e.target)) {
        accountDropdown.classList.remove("show-dropdown");
      }
      if (!dropdownIcon.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = "none";
      }
    });

    // Logout
    logoutButton.addEventListener("click", () => {
      fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error logging out:", error);
        });
    });

    // ====== Search Suggestions ======
    const suggestions = [
      { label: "Home", path: "/home/index.html" },
      { label: "Recommended", path: "/recommend/recommended.html" },
      { label: "About Us", path: "/aboutus/about.html" },
      { label: "My Bookings", path: "/bookings/mybookings.html" },
      { label: "Barber Shop", path: "/categories/barbershop.html" },
      { label: "Hair Salon", path: "/categories/hairsalon.html" },
      { label: "Nail Salon", path: "/categories/nailsalon.html" },
      { label: "Massage", path: "/categories/massage.html" },
      { label: "Makeup", path: "/categories/makeup.html" },
      { label: "Hair Removal", path: "/categories/hairremoval.html" },
      { label: "Skin Care", path: "/categories/skincare.html" },
      { label: "Spa", path: "/categories/spa.html" },
      { label: "Therapy", path: "/categories/therapy.html" },
    ];

    // Create suggestion dropdown
    const suggestionBox = document.createElement("div");
    suggestionBox.classList.add("search-suggestions");
    suggestionBox.style.position = "absolute";
    suggestionBox.style.top = "100%";
    suggestionBox.style.left = "0";
    suggestionBox.style.right = "0";
    suggestionBox.style.background = "white";
    suggestionBox.style.color = "black";
    suggestionBox.style.zIndex = "999";
    suggestionBox.style.border = "1px solid #ccc";
    suggestionBox.style.borderTop = "none";
    suggestionBox.style.maxHeight = "200px";
    suggestionBox.style.overflowY = "auto";
    suggestionBox.style.display = "none";
    suggestionBox.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
    suggestionBox.style.fontSize = "14px";

    searchBar.parentElement.style.position = "relative";
    searchBar.parentElement.appendChild(suggestionBox);

    // Show suggestions (partial match)
    searchBar.addEventListener("input", function () {
      const query = this.value.trim().toLowerCase();
      suggestionBox.innerHTML = "";

      if (query.length === 0) {
        suggestionBox.style.display = "none";
        return;
      }

      const matches = suggestions.filter((item) =>
        item.label.toLowerCase().includes(query) // <-- partial match
      );

      if (matches.length > 0) {
        matches.forEach((item) => {
          const option = document.createElement("div");
          option.textContent = item.label;
          option.style.padding = "10px";
          option.style.cursor = "pointer";
          option.addEventListener("click", () => {
            window.location.href = item.path;
          });
          option.addEventListener("mouseover", () => {
            option.style.background = "#eee";
          });
          option.addEventListener("mouseout", () => {
            option.style.background = "white";
          });
          suggestionBox.appendChild(option);
        });
        suggestionBox.style.display = "block";
      } else {
        suggestionBox.style.display = "none";
      }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchBar.contains(e.target) && !suggestionBox.contains(e.target)) {
        suggestionBox.style.display = "none";
      }
    });
  };

  const observer = new MutationObserver(() => {
    const navbarRight = document.querySelector(".navbar-right");
    if (navbarRight) {
      initializeNavigation();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
