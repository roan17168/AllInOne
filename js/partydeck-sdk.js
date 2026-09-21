/**
 * PARTYDECK SDK Bridge
 * Web Audio synth sound generator, haptics, and theme bridge.
 */
const PartyDeck = {
  getTheme: () => localStorage.getItem("partydeck_theme") || "cyber-neon",
  
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

  vibrate: (pattern = [40]) => {
    if ("vibrate" in navigator) {
      try { navigator.vibrate(pattern); } catch (err) {}
    }
  },

  playSound: (type = "click") => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "alert") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(240, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch (e) {}
  },

  exitToHub: () => {
    window.location.href = "../../index.html";
  }
};

(function() {
  const currentTheme = PartyDeck.getTheme();
  document.documentElement.setAttribute("data-theme", currentTheme);
})();