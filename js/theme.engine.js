/**
 * PARTYDECK Dynamic Theme Engine
 * Automatically applies themes, manages localStorage, and syncs across iframes/windows.
 */
(function () {
  const THEME_KEY = "partydeck_theme";
  const DEFAULT_THEME = "cyber-neon";

  const themeMetaColors = {
    "cyber-neon": "#0b0c10",
    "sunset-rave": "#120924",
    "retro-arcade": "#1a1a2e",
    "minimal-light": "#f8fafc"
  };

  function applyTheme(themeName) {
    const validTheme = themeMetaColors[themeName] ? themeName : DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", validTheme);
    
    // Update theme-color meta tag for native mobile address bar tinting
    const metaTag = document.getElementById("metaThemeColor");
    if (metaTag) {
      metaTag.setAttribute("content", themeMetaColors[validTheme]);
    }

    // Sync select dropdown if on hub
    const select = document.getElementById("themeSelect");
    if (select && select.value !== validTheme) {
      select.value = validTheme;
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    applyTheme(savedTheme);

    const select = document.getElementById("themeSelect");
    if (select) {
      select.addEventListener("change", (e) => {
        const newTheme = e.target.value;
        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
      });
    }

    // Listen for storage events (multi-tab sync)
    window.addEventListener("storage", (e) => {
      if (e.key === THEME_KEY && e.newValue) {
        applyTheme(e.newValue);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
})();