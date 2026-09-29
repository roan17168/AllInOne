/**
 * PARTYDECK AVATAR & MASCOT ENGINE (Kahoot-Style)
 * File: js/avatar-engine.js
 * 
 * Provides 16 custom SVG mascots, procedural arcade nicknames,
 * and an interactive modal picker for seamless roster assignment.
 * Zero Unicode emojis — 100% Vector SVG.
 */

(function (window) {
  "use strict";

  /* ==========================================================================
     1. PROCEDURAL NICKNAME GENERATOR LEXICON
     ========================================================================== */
  const ADJECTIVES = [
    "Captain", "Glitch", "Turbo", "DJ", "Sneaky", "Laser", "Cyber", "Mega",
    "Atomic", "Retro", "Pixel", "Hyper", "Rad", "Cosmic", "Shadow", "Dr.",
    "Boba", "Cheeky", "Wobbly", "Sir", "Neon", "Spicy", "Quantum", "Velvet"
  ];

  const NOUNS = [
    "Chaos", "Goblin", "Quack", "Sips", "Pickle", "Bandit", "Potato", "Vortex",
    "Waffle", "Wizard", "Ninja", "Falcon", "Badger", "Panda", "Gremlin", "Kraken",
    "Noodle", "Blaster", "Biscuit", "Ranger", "Toast", "Comet", "Dynamo", "Chupacabra"
  ];

  /* ==========================================================================
     2. THE 16 ARCADE VECTOR MASCOTS (Pure SVG, 24x24 viewBox)
     ========================================================================== */
  const MASCOTS = [
    {
      id: "cyber-dino",
      name: "Cyber Dino",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5h-2v3h-3v2h4v2h-2v3h-2v2H7v-2H5v-4H3v-4h2V8h2V6h4V3h5z"/><circle cx="17" cy="6" r="1" fill="currentColor"/><path d="M7 15h2v2H7zM11 15h2v2h-2z"/></svg>`
    },
    {
      id: "neon-fox",
      name: "Neon Fox",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l4 4h8l4-4v10l-8 7-8-7V4z"/><circle cx="8.5" cy="11.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="11.5" r="1.5" fill="currentColor"/><path d="M12 16l-1-1.5h2L12 16z"/></svg>`
    },
    {
      id: "glitch-skull",
      name: "Glitch Skull",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a8 8 0 1 1 16 0c0 3-1.5 5.5-4 6.5V21H8v-3.5C5.5 16.5 4 14 4 11z"/><line x1="8" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="16" y2="12"/><path d="M9 17v2h2v-2h2v2h2v-2"/></svg>`
    },
    {
      id: "robo-duck",
      name: "Robo Duck",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c0-4 3.5-7 8-7 3 0 5 1.5 6 3.5L22 11l-5 2c-.5 3-3 5-6 5-4.5 0-8-2.5-8-5z"/><circle cx="11" cy="9" r="1.5" fill="currentColor"/><path d="M7 17l-3 4h12l-2-4"/></svg>`
    },
    {
      id: "astro-cat",
      name: "Astro Cat",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6L3 13v7h18v-7L19 6l-3.5 3h-7L5 6z"/><circle cx="8" cy="15" r="1.5" fill="currentColor"/><circle cx="16" cy="15" r="1.5" fill="currentColor"/><path d="M11 17l1 1 1-1"/></svg>`
    },
    {
      id: "laser-frog",
      name: "Laser Frog",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M3 14c0-3.5 4-6 9-6s9 2.5 9 6c0 4-4 7-9 7s-9-3-9-7z"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="18" cy="6" r="1" fill="currentColor"/><line x1="8" y1="15" x2="16" y2="15"/></svg>`
    },
    {
      id: "turbo-panda",
      name: "Turbo Panda",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="5" r="2.5" fill="currentColor"/><circle cx="20" cy="5" r="2.5" fill="currentColor"/><circle cx="12" cy="13" r="8"/><ellipse cx="8.5" cy="11.5" rx="2" ry="1.5" fill="currentColor"/><ellipse cx="15.5" cy="11.5" rx="2" ry="1.5" fill="currentColor"/><path d="M10 16.5c1 .8 3 .8 4 0"/></svg>`
    },
    {
      id: "byte-ghost",
      name: "Byte Ghost",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9a8 8 0 0 1 16 0v10l-3-2-2.5 2-2.5-2-2.5 2-2.5-2L4 19z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M10 14h4"/></svg>`
    },
    {
      id: "rad-taco",
      name: "Rad Taco",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15a9 9 0 0 1 18 0H3z"/><path d="M7 15c0-2 2-4 5-4s5 2 5 4"/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="9" r="1" fill="currentColor"/><circle cx="16" cy="11" r="1" fill="currentColor"/></svg>`
    },
    {
      id: "zap-bunny",
      name: "Zap Bunny",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l2 8M16 2l-2 8"/><ellipse cx="12" cy="15" rx="7" ry="6"/><circle cx="9" cy="14" r="1.5" fill="currentColor"/><circle cx="15" cy="14" r="1.5" fill="currentColor"/><path d="M11 17l1 1 1-1"/></svg>`
    },
    {
      id: "mech-bear",
      name: "Mech Bear",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h3v3H4zM17 4h3v3h-3z"/><rect x="4" y="7" width="16" height="13" rx="3"/><line x1="8" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="16" y2="12"/><path d="M10 16h4"/></svg>`
    },
    {
      id: "pixel-alien",
      name: "Pixel Alien",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h2V6h2V4h10v2h2v2h2v6h-2v2h-2v2H7v-2H5v-2H3V8z"/><rect x="7" y="8" width="2" height="3" fill="currentColor"/><rect x="15" y="8" width="2" height="3" fill="currentColor"/><path d="M8 14h8v2H8z"/></svg>`
    },
    {
      id: "cyber-crab",
      name: "Cyber Crab",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="15" rx="7" ry="5"/><path d="M5 13L2 8c2.5-.5 4.5.5 5 2M19 13l3-5c-2.5-.5-4.5.5-5 2M8 10V7M16 10V7"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="16" cy="6" r="1" fill="currentColor"/></svg>`
    },
    {
      id: "retro-bot",
      name: "Retro Bot",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="6" width="14" height="13" rx="2"/><path d="M12 2v4M2 12h3M19 12h3"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><circle cx="15" cy="11" r="1.5" fill="currentColor"/><path d="M8 15h8"/></svg>`
    },
    {
      id: "star-shroom",
      name: "Star Shroom",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c0-5 4-9 9-9s9 4 9 9H3z"/><path d="M8 13v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6"/><circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="9.5" r="1.5" fill="currentColor"/></svg>`
    },
    {
      id: "turbo-snail",
      name: "Turbo Snail",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="10" r="6"/><circle cx="14" cy="10" r="2.5"/><path d="M2 18h16a4 4 0 0 0 4-4v-1l-3-2M5 18l-3-7M7 18l-1-7"/><circle cx="2" cy="11" r="1" fill="currentColor"/><circle cx="6" cy="11" r="1" fill="currentColor"/></svg>`
    }
  ];

  /* ==========================================================================
     3. AUDIO SYNTHESIS HELPER
     ========================================================================== */
  function playBeep(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "roll") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "pick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      }
    } catch (e) {}
  }

  /* ==========================================================================
     4. PUBLIC API DEFINITION
     ========================================================================== */
  const PartyDeckAvatars = {
    getAll: function () {
      return MASCOTS.slice();
    },

    getById: function (id) {
      return MASCOTS.find((m) => m.id === id) || MASCOTS[0];
    },

    generateNickname: function () {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      return `${adj} ${noun}`;
    },

    random: function () {
      const mascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
      return {
        id: mascot.id,
        name: this.generateNickname(),
        svg: mascot.svg
      };
    },

    renderAvatarSVG: function (id, size = 32) {
      const mascot = this.getById(id);
      return `<div class="avatar-svg-wrap" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;">${mascot.svg}</div>`;
    },

    openAvatarPicker: function (currentName = "", onSelectCallback) {
      let modal = document.getElementById("pd-avatar-picker-modal");
      if (modal) modal.remove();

      let selectedId = MASCOTS[0].id;
      let activeName = currentName.trim() || this.generateNickname();

      modal = document.createElement("div");
      modal.id = "pd-avatar-picker-modal";
      modal.className = "pd-avatar-modal-backdrop";
      modal.innerHTML = `
        <div class="pd-avatar-modal-card">
          <div class="pd-avatar-modal-header">
            <div class="pd-avatar-header-title">
              <span class="pd-avatar-pill">MASCOT ROSTER</span>
              <h2>Choose Identity</h2>
            </div>
            <button type="button" class="pd-avatar-close-btn" id="pdAvatarClose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="pd-avatar-preview-banner">
            <div class="pd-avatar-big-preview" id="pdBigPreview">
              ${MASCOTS[0].svg}
            </div>
            <div class="pd-avatar-name-box">
              <input type="text" id="pdAvatarNameInput" maxlength="18" value="${activeName}" placeholder="Enter arcade alias..." />
              <button type="button" class="pd-avatar-roll-btn" id="pdRollBtn" title="Roll Random Mascot & Name">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>ROLL</span>
              </button>
            </div>
          </div>

          <div class="pd-avatar-grid-title">SELECT MASCOT (16 MODELS)</div>
          <div class="pd-avatar-grid" id="pdAvatarGrid">
            ${MASCOTS.map(
              (m) => `
              <button type="button" class="pd-avatar-tile ${m.id === selectedId ? "is-selected" : ""}" data-id="${m.id}" title="${m.name}">
                <div class="pd-tile-svg">${m.svg}</div>
                <span class="pd-tile-name">${m.name}</span>
              </button>
            `
            ).join("")}
          </div>

          <div class="pd-avatar-footer">
            <button type="button" class="pd-avatar-confirm-btn" id="pdConfirmBtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>CONFIRM IDENTITY</span>
            </button>
          </div>
        </div>
      `;

      // Inject Scoped Styles for Modal
      if (!document.getElementById("pd-avatar-picker-styles")) {
        const style = document.createElement("style");
        style.id = "pd-avatar-picker-styles";
        style.textContent = `
          .pd-avatar-modal-backdrop {
            position: fixed; inset: 0; z-index: 1000;
            background: rgba(5, 7, 10, 0.88);
            backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            padding: 1rem;
            animation: pdFadeIn .18s ease-out;
          }
          @keyframes pdFadeIn { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: scale(1); } }
          .pd-avatar-modal-card {
            background: var(--bg-surface, #12161f);
            border: 2px solid var(--border-ui, rgba(56, 189, 248, 0.25));
            box-shadow: 0 16px 40px rgba(0,0,0,0.8), 0 0 24px var(--accent-glow, rgba(56, 189, 248, 0.2));
            border-radius: var(--r-lg, 18px);
            width: 100%; max-width: 480px;
            max-height: 90dvh;
            display: flex; flex-direction: column;
            overflow: hidden;
            color: var(--text-primary, #ffffff);
            font-family: var(--font-body, system-ui, sans-serif);
          }
          .pd-avatar-modal-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 1rem 1.25rem .75rem;
            border-bottom: 1px solid var(--border-ui, rgba(255,255,255,0.08));
          }
          .pd-avatar-pill {
            font-family: var(--font-mono, monospace);
            font-size: .62rem; font-weight: 800; letter-spacing: .15em;
            color: var(--accent, #38bdf8);
          }
          .pd-avatar-header-title h2 {
            font-family: var(--font-display, sans-serif);
            font-size: 1.25rem; font-weight: 900; margin: 0; line-height: 1.2;
          }
          .pd-avatar-close-btn {
            background: transparent; border: 1px solid var(--border-ui, rgba(255,255,255,0.1));
            color: var(--text-secondary, #94a3b8);
            width: 36px; height: 36px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
          }
          .pd-avatar-close-btn svg { width: 18px; height: 18px; }
          .pd-avatar-preview-banner {
            display: flex; align-items: center; gap: 1rem;
            padding: 1rem 1.25rem;
            background: var(--bg-elevated, #1a202c);
            border-bottom: 1px solid var(--border-ui, rgba(255,255,255,0.08));
          }
          .pd-avatar-big-preview {
            width: 60px; height: 60px; flex-shrink: 0;
            background: var(--bg-surface, #12161f);
            border: 2px solid var(--accent, #38bdf8);
            border-radius: var(--r-md, 12px);
            display: flex; align-items: center; justify-content: center;
            color: var(--accent, #38bdf8);
            box-shadow: 0 0 16px var(--accent-glow, rgba(56, 189, 248, 0.3));
          }
          .pd-avatar-big-preview svg { width: 38px; height: 38px; }
          .pd-avatar-name-box {
            flex: 1; display: flex; gap: .5rem;
          }
          .pd-avatar-name-box input {
            flex: 1; min-width: 0;
            background: var(--bg-surface, #12161f);
            border: 1px solid var(--border-ui, rgba(255,255,255,0.15));
            border-radius: var(--r-sm, 8px);
            color: var(--text-primary, #ffffff);
            font-family: var(--font-mono, monospace);
            font-size: .95rem; font-weight: 700;
            padding: .5rem .75rem; outline: none;
          }
          .pd-avatar-name-box input:focus {
            border-color: var(--accent, #38bdf8);
          }
          .pd-avatar-roll-btn {
            background: var(--accent, #38bdf8);
            color: var(--accent-contrast, #031525);
            border: none; border-radius: var(--r-sm, 8px);
            padding: 0 .75rem; font-family: var(--font-mono, monospace);
            font-size: .75rem; font-weight: 800;
            display: flex; align-items: center; gap: 4px; cursor: pointer;
          }
          .pd-avatar-roll-btn svg { width: 14px; height: 14px; }
          .pd-avatar-grid-title {
            padding: .75rem 1.25rem .25rem;
            font-family: var(--font-mono, monospace);
            font-size: .65rem; font-weight: 800; letter-spacing: .12em;
            color: var(--text-muted, #64748b);
          }
          .pd-avatar-grid {
            flex: 1; overflow-y: auto;
            padding: .5rem 1.25rem 1rem;
            display: grid; grid-template-columns: repeat(4, 1fr); gap: .6rem;
            -webkit-overflow-scrolling: touch;
          }
          .pd-avatar-tile {
            background: var(--bg-elevated, #1a202c);
            border: 1px solid var(--border-ui, rgba(255,255,255,0.08));
            border-radius: var(--r-md, 12px);
            padding: .6rem .3rem;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
            cursor: pointer; color: var(--text-secondary, #94a3b8);
            transition: all .15s ease;
          }
          .pd-avatar-tile:active { transform: scale(.94); }
          .pd-avatar-tile.is-selected {
            border-color: var(--accent, #38bdf8);
            background: rgba(56, 189, 248, 0.12);
            color: var(--accent, #38bdf8);
            box-shadow: 0 0 12px var(--accent-glow, rgba(56, 189, 248, 0.25));
          }
          .pd-tile-svg { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
          .pd-tile-svg svg { width: 100%; height: 100%; }
          .pd-tile-name {
            font-family: var(--font-mono, monospace);
            font-size: .58rem; font-weight: 700;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
          }
          .pd-avatar-footer {
            padding: .75rem 1.25rem 1.25rem;
            border-top: 1px solid var(--border-ui, rgba(255,255,255,0.08));
          }
          .pd-avatar-confirm-btn {
            width: 100%; min-height: 48px;
            background: var(--accent, #38bdf8);
            color: var(--accent-contrast, #031525);
            border: none; border-radius: var(--r-sm, 8px);
            font-family: var(--font-mono, monospace);
            font-size: .88rem; font-weight: 900; letter-spacing: .08em;
            display: flex; align-items: center; justify-content: center; gap: 6px;
            cursor: pointer; box-shadow: 0 0 16px var(--accent-glow, rgba(56, 189, 248, 0.3));
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(modal);

      // Event Bindings
      const preview = document.getElementById("pdBigPreview");
      const nameInput = document.getElementById("pdAvatarNameInput");
      const rollBtn = document.getElementById("pdRollBtn");
      const grid = document.getElementById("pdAvatarGrid");
      const closeBtn = document.getElementById("pdAvatarClose");
      const confirmBtn = document.getElementById("pdConfirmBtn");

      function updateSelectedUI(id) {
        selectedId = id;
        const mascot = PartyDeckAvatars.getById(id);
        preview.innerHTML = mascot.svg;
        grid.querySelectorAll(".pd-avatar-tile").forEach((tile) => {
          tile.classList.toggle("is-selected", tile.dataset.id === id);
        });
      }

      grid.addEventListener("click", (e) => {
        const tile = e.target.closest(".pd-avatar-tile");
        if (!tile) return;
        playBeep("pick");
        updateSelectedUI(tile.dataset.id);
      });

      rollBtn.addEventListener("click", () => {
        playBeep("roll");
        const rolled = PartyDeckAvatars.random();
        nameInput.value = rolled.name;
        updateSelectedUI(rolled.id);
      });

      closeBtn.addEventListener("click", () => {
        modal.remove();
      });

      confirmBtn.addEventListener("click", () => {
        playBeep("pick");
        const finalName = nameInput.value.trim() || activeName;
        const result = {
          name: finalName,
          avatarId: selectedId,
          svg: PartyDeckAvatars.getById(selectedId).svg
        };
        modal.remove();
        if (typeof onSelectCallback === "function") {
          onSelectCallback(result);
        }
      });
    }
  };

  window.PartyDeckAvatars = PartyDeckAvatars;
})(window);