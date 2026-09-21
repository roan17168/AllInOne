/**
 * PARTYDECK Theme Engine
 */
(function () {
  const THEME_KEY = "partydeck_theme";
  const DEFAULT_THEME = "cyber-neon";

  const themeMetaColors = {
    "cyber-neon": "#08090c",
    "sunset-rave": "#0f071d",
    "retro-arcade": "#12131c",
    "minimal-light": "#f4f6f9"
  };

  function applyTheme(themeName) {
    const validTheme = themeMetaColors[themeName] ? themeName : DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", validTheme);
    
    const metaTag = document.getElementById("metaThemeColor");
    if (metaTag) {
      metaTag.setAttribute("content", themeMetaColors[validTheme]);
    }

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