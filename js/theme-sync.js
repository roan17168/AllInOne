(function () {
  "use strict";

  const THEME_KEY = "partydeck_theme";
  const VALID_THEMES = new Set([
    "nordic-slate",
    "tokyo-sunset",
    "terracotta-clay",
    "alpine-mist",
    "emerald-lounge",
    "synthwave-84"
  ]);

  function syncTheme(value) {
    let theme = value;
    if (typeof theme !== "string") {
      try {
        theme = localStorage.getItem(THEME_KEY);
      } catch (error) {
        return;
      }
    }
    if (!VALID_THEMES.has(theme)) theme = "nordic-slate";
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    const background = getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim();
    if (meta && background) meta.setAttribute("content", background);
  }

  syncTheme();
  window.addEventListener("storage", function (event) {
    if (event.key === THEME_KEY) syncTheme(event.newValue);
  });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) syncTheme();
  });
})();
