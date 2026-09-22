/**
 * PARTYDECK Universal Theme Engine
 * Syncs and persists 4 arcade themes across Hub & all 20 game modules.
 */
(function () {
  "use strict";

  const THEME_KEY = "partydeck_theme";
  const DEFAULT_THEME = "cyber-neon";
  const THEME_COLORS = {
    "cyber-neon": "#08090c",
    "sunset-rave": "#0f071d",
    "retro-arcade": "#12131c",
    "minimal-light": "#f4f6f9"
  };

  function applyTheme(themeName) {
    const theme = THEME_COLORS[themeName] ? themeName : DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}

    // Update browser status bar / notch color
    const metaTheme = document.getElementById("metaThemeColor") || document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", THEME_COLORS[theme]);
    }

    // Sync any theme select dropdown on page
    const themeSelector = document.getElementById("themeSelect") || document.getElementById("themeSelector");
    if (themeSelector && themeSelector.value !== theme) {
      themeSelector.value = theme;
    }
  }

  // Load saved theme immediately on script execution
  let savedTheme = DEFAULT_THEME;
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  } catch (e) {}
  applyTheme(savedTheme);

  // Bind change event when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(savedTheme);
    const themeSelector = document.getElementById("themeSelect") || document.getElementById("themeSelector");
    if (themeSelector) {
      themeSelector.value = savedTheme;
      themeSelector.addEventListener("change", (e) => {
        applyTheme(e.target.value);
        if (window.PartyDeck && PartyDeck.playSound) {
          PartyDeck.playSound("click");
        }
      });
    }
  });

  // Export to global scope
  window.ThemeEngine = { applyTheme, getTheme: () => localStorage.getItem(THEME_KEY) || DEFAULT_THEME };
})();