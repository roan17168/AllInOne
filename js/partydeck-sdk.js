/**
 * PARTYDECK SDK
 * Lightweight shared bridge for standalone games.
 */
const PartyDeck = {
  // Theme helpers
  getTheme: () => localStorage.getItem("partydeck_theme") || "cyber-neon",
  
  // Player roster helpers
  getPlayers: () => {
    try {
      return JSON.parse(localStorage.getItem("partydeck_players") || "[]");
    } catch (e) {
      return [];
    }
  },
  
  setPlayers: (playersArray) => {
    localStorage.setItem("partydeck_players", JSON.stringify(playersArray));
  },

  // Haptic feedback
  vibrate: (pattern = [40]) => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {}
    }
  },

  // Audio helper using Web Audio API (zero external asset files needed)
  playSound: (type = "click") => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "click") {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "success") {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "alert") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {}
  },

  // Navigation
  exitToHub: () => {
    window.location.href = "../../index.html";
  }
};

// Auto-sync theme on load for standalone pages
(function() {
  const currentTheme = PartyDeck.getTheme();
  document.documentElement.setAttribute("data-theme", currentTheme);
})();