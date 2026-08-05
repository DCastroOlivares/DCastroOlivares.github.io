(() => {
  document.documentElement.classList.add("has-js");

  const themeButtons = [...document.querySelectorAll("[data-theme-option]")];
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  const currentTheme = () =>
    document.documentElement.dataset.theme || (systemTheme.matches ? "dark" : "light");

  const syncThemeButtons = () => {
    const theme = currentTheme();
    themeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeOption === theme));
    });
  };

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const theme = button.dataset.themeOption;
      document.documentElement.dataset.theme = theme;
      try {
        window.localStorage.setItem("site-theme", theme);
      } catch (_) {
        // El tema sigue funcionando aunque el almacenamiento esté deshabilitado.
      }
      syncThemeButtons();
    });
  });

  try {
    const savedTheme = window.localStorage.getItem("site-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch (_) {
    // Se usa la preferencia del sistema cuando no hay almacenamiento disponible.
  }

  systemTheme.addEventListener("change", () => {
    if (!document.documentElement.dataset.theme) syncThemeButtons();
  });
  syncThemeButtons();

  const timeline = document.querySelector("[data-timeline]");
  if (timeline) {
    const filterButtons = [...timeline.querySelectorAll("[data-filter]")];
    const items = [...timeline.querySelectorAll(".timeline-item")];
    const secretItems = [...timeline.querySelectorAll("[data-secret]")];
    const secretToggle = timeline.querySelector("[data-secret-toggle]");
    const easterContainer = timeline.querySelector("[data-easter-container]");
    const secretStatus = timeline.querySelector("[data-secret-status]");
    const status = timeline.querySelector("[data-filter-status]");
    let activeFilter = "all";
    let secretUnlocked = false;

    const setPressed = (button, pressed) => {
      button.setAttribute("aria-pressed", String(pressed));
      button.classList.toggle("is-active", pressed);
    };

    const applyFilters = () => {
      easterContainer.hidden = activeFilter !== "all" && activeFilter !== "experiencia";
      let visible = 0;

      items.forEach((item) => {
        const categoryMatch = activeFilter === "all" || item.dataset.category === activeFilter;
        const secretMatch = !item.hasAttribute("data-secret") || secretUnlocked;
        item.hidden = !(categoryMatch && secretMatch);
        if (!item.hidden) visible += 1;
      });

      status.textContent = `${visible} ${visible === 1 ? "hito visible" : "hitos visibles"}`;
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((candidate) => setPressed(candidate, candidate === button));
        applyFilters();
      });
    });

    secretToggle.addEventListener("click", () => {
      secretUnlocked = !secretUnlocked;
      secretToggle.setAttribute("aria-expanded", String(secretUnlocked));
      secretToggle.setAttribute(
        "aria-label",
        secretUnlocked ? "Ocultar experiencias entre líneas" : "Mostrar experiencias entre líneas"
      );
      secretStatus.textContent = secretUnlocked
        ? "Los estudios no se pagan solos 🫣 · 2 experiencias entre líneas visibles"
        : "";
      if (!secretUnlocked) {
        secretItems.forEach((item) => {
          item.querySelector("details").open = false;
        });
      }
      applyFilters();
    });

    applyFilters();
  }

  const mobileQuery = window.matchMedia("(max-width: 760px)");
  document.querySelectorAll("[data-collapsible-section]").forEach((section) => {
    const button = section.querySelector("[data-section-toggle]");
    const content = section.querySelector("[data-section-content]");
    if (!button || !content) return;

    const syncForViewport = () => {
      if (!mobileQuery.matches) {
        content.hidden = false;
        button.setAttribute("aria-expanded", "true");
      }
    };

    button.addEventListener("click", () => {
      if (!mobileQuery.matches) return;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      content.hidden = expanded;
    });

    syncForViewport();
    mobileQuery.addEventListener("change", syncForViewport);
  });
})();
