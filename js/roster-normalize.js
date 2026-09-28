(function () {
  "use strict";

  const KEY = "partydeck_players";

  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return;
    const parsed = JSON.parse(raw);
    const source = Array.isArray(parsed) ? parsed : [];
    const seen = new Set();
    const roster = [];

    for (const value of source) {
      if (typeof value !== "string") continue;
      const name = value
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .replace(/&/g, " and ")
        .replace(/</g, "‹")
        .replace(/>/g, "›")
        .replace(/"/g, "”")
        .replace(/'/g, "’")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 14);
      const normalized = name.toLowerCase();
      if (!name || seen.has(normalized)) continue;
      seen.add(normalized);
      roster.push(name);
      if (roster.length === 16) break;
    }

    const serialized = JSON.stringify(roster);
    if (serialized !== raw) localStorage.setItem(KEY, serialized);
  } catch (error) {}
})();
