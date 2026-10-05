/**
 * AllInOne AVATAR & ROSTER DUAL-ENGINE
 * File: js/avatar-engine.js
 * 
 * Features:
 * - 16 Distinct Inline SVG Vector Mascots
 * - Procedural Nickname Generator (Adjective + Noun)
 * - Dual-Mode Support: "Mascot Mode" (Procedural) & "Custom Name Mode" (Manual)
 * - Auto-initialization (5 randomized players on clean boot)
 * - Backwards compatibility with legacy string-array rosters
 * - Native Web Audio API UI synthesis (zero external audio files)
 * - Standalone injected management modal with reactive events
 */

(function (window) {
  "use strict";

  /* ==========================================================================
     1. WEB AUDIO SYNTHESIZER
     ========================================================================== */
  const Sfx = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    },
    play(type) {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === "pop") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(840, now + 0.06);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);
        } else if (type === "roll") {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.setValueAtTime(480, now + 0.03);
          osc.frequency.setValueAtTime(640, now + 0.06);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === "delete") {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === "toggle") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(550, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
        } else if (type === "success") {
          [523, 659, 784].forEach((freq, idx) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = "sine";
            o.frequency.setValueAtTime(freq, now + idx * 0.05);
            g.gain.setValueAtTime(0.1, now + idx * 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.08);
            o.connect(g);
            g.connect(this.ctx.destination);
            o.start(now + idx * 0.05);
            o.stop(now + idx * 0.05 + 0.08);
          });
        }
      } catch (e) {}
    }
  };

  /* ==========================================================================
     2. 16 DISTINCT INLINE SVG VECTOR MASCOTS
     ========================================================================== */
  const MASCOTS = [
    {
      id: "cyber-dino",
      name: "Cyber Dino",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14l2-8h6l3 3h4l2 4v4h-3l-2 3h-4l-1-2H7l-3-4z"/><circle cx="10" cy="9" r="1" fill="currentColor"/><path d="M7 14h2v3H7zM12 14h2v3h-2z"/></svg>`
    },
    {
      id: "neon-fox",
      name: "Neon Fox",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l4 4h8l4-4v10l-8 7-8-7V4z"/><circle cx="8.5" cy="11.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="11.5" r="1.5" fill="currentColor"/><path d="M12 16l-1-1.5h2L12 16z"/></svg>`
    },
    {
      id: "glitch-skull",
      name: "Glitch Skull",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="7"/><path d="M8 17v4h8v-4M9 21h6M8 10h.01M16 10h.01M9 14h6"/></svg>`
    },
    {
      id: "robo-duck",
      name: "Robo Duck",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16a4 4 0 0 0 4 4h7a5 5 0 0 0 5-5v-1a5 5 0 0 0-5-5h-3l-3-4H6l1 4a5 5 0 0 0-2 4v1z"/><circle cx="9" cy="8.5" r="1.5" fill="currentColor"/><path d="M2 13h4"/></svg>`
    },
    {
      id: "astro-cat",
      name: "Astro Cat",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8L3 3l5 2h8l5-2-2 5v7a7 7 0 0 1-14 0V8z"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><path d="M10 16c1 .5 3 .5 4 0"/></svg>`
    },
    {
      id: "laser-frog",
      name: "Laser Frog",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M4 14c0-4 3.5-6 8-6s8 2 8 6a6 6 0 0 1-12 0"/><path d="M9 13c1.5 1 4.5 1 6 0"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="18" cy="6" r="1" fill="currentColor"/></svg>`
    },
    {
      id: "turbo-panda",
      name: "Turbo Panda",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="5" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="12" cy="13" r="8"/><circle cx="9" cy="11.5" r="1.5" fill="currentColor"/><circle cx="15" cy="11.5" r="1.5" fill="currentColor"/><ellipse cx="12" cy="15.5" rx="2" ry="1.2" fill="currentColor"/></svg>`
    },
    {
      id: "byte-ghost",
      name: "Byte Ghost",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 16 0v8l-3-2-3 2-2-2-2 2-3-2-3 2V12z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg>`
    },
    {
      id: "rad-taco",
      name: "Rad Taco",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15C3 8.37 8.37 3 15 3h6v6c0 6.63-5.37 12-12 12H3v-6z"/><path d="M8 8l3 3M12 7l2 2M15 12l2 2"/><circle cx="7.5" cy="13.5" r="1" fill="currentColor"/></svg>`
    },
    {
      id: "zap-bunny",
      name: "Zap Bunny",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v8M17 2v8"/><rect x="4" y="9" width="16" height="12" rx="6"/><circle cx="9" cy="14" r="1.5" fill="currentColor"/><circle cx="15" cy="14" r="1.5" fill="currentColor"/><path d="M12 17v1"/></svg>`
    },
    {
      id: "mech-bear",
      name: "Mech Bear",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="4" r="2.5"/><circle cx="20" cy="4" r="2.5"/><rect x="4" y="7" width="16" height="14" rx="4"/><line x1="8" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="16" y2="12"/><path d="M10 16h4"/></svg>`
    },
    {
      id: "pixel-alien",
      name: "Pixel Alien",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h2V6h2V4h10v2h2v2h2v6h-2v2h-2v2H7v-2H5v-2H3V8z"/><rect x="7" y="8" width="2" height="3" fill="currentColor"/><rect x="15" y="8" width="2" height="3" fill="currentColor"/><path d="M8 14h8v2H8z"/></svg>`
    },
    {
      id: "cyber-crab",
      name: "Cyber Crab",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="14" rx="7" ry="5"/><path d="M5 9c0-3 3-5 3-5M19 9c0-3-3-5-3-5M3 13l-2 2M21 13l2 2M4 17l-2 3M20 17l2 3"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/></svg>`
    },
    {
      id: "retro-bot",
      name: "Retro Bot",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M12 2v4M8 2h8"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><circle cx="15" cy="11" r="1.5" fill="currentColor"/><path d="M8 16h8"/></svg>`
    },
    {
      id: "star-shroom",
      name: "Star Shroom",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13C3 7 7 3 12 3s9 4 9 10H3z"/><path d="M7 13v5a3 3 0 0 0 6 0v-5M11 18a3 3 0 0 0 6 0v-5"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/></svg>`
    },
    {
      id: "turbo-snail",
      name: "Turbo Snail",
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="10" r="6"/><circle cx="14" cy="10" r="2.5"/><path d="M2 18h16a4 4 0 0 0 4-4v-1l-3-2M5 18l-3-7M7 18l-1-7"/><circle cx="2" cy="11" r="1" fill="currentColor"/><circle cx="6" cy="11" r="1" fill="currentColor"/></svg>`
    }
  ];

  /* ==========================================================================
     3. PROCEDURAL NICKNAME GENERATOR
     ========================================================================== */
  const ADJECTIVES = [
    "Cyber", "Neon", "Turbo", "Glitch", "Hyper", "Laser", "Retro", "Pixel",
    "Astro", "Atomic", "Sonic", "Mega", "Shadow", "Cosmic", "Vortex", "Quantum",
    "Radical", "Sneaky", "Captain", "DJ", "Doctor", "Sir", "Baron", "Agent"
  ];

  const NOUNS = [
    "Chaos", "Goblin", "Viper", "Sips", "Blaster", "Phantom", "Rogue", "Pickle",
    "Bandit", "Spark", "Ninja", "Wizard", "Titan", "Rider", "Nomad", "Havoc",
    "Striker", "Falcon", "Glitch", "Comet", "Rebel", "Gizmo", "Kraken", "Breeze"
  ];

  function generateNickname() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adj} ${noun}`;
  }

  /* ==========================================================================
     4. ROSTER STORE & NORMALIZER
     ========================================================================== */
  const STORAGE_KEY = "AllInOne_players";

  function normalizePlayer(p, idx) {
    if (typeof p === "string") {
      const mascot = MASCOTS[idx % MASCOTS.length];
      return {
        id: "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        name: p.trim() || `Player ${idx + 1}`,
        avatarId: mascot.id,
        svg: mascot.svg
      };
    }
    if (p && typeof p === "object") {
      const mascot = MASCOTS.find(m => m.id === p.avatarId) || MASCOTS[idx % MASCOTS.length];
      return {
        id: p.id || ("p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6)),
        name: (p.name || `Player ${idx + 1}`).trim(),
        avatarId: mascot.id,
        svg: mascot.svg
      };
    }
    const fallbackMascot = MASCOTS[idx % MASCOTS.length];
    return {
      id: "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: `Player ${idx + 1}`,
      avatarId: fallbackMascot.id,
      svg: fallbackMascot.svg
    };
  }

  function getRawStoredRoster() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p, i) => normalizePlayer(p, i));
      }
    } catch (e) {}
    return null;
  }

  function generateDefaultRoster() {
    const shuffled = MASCOTS.slice().sort(() => Math.random() - 0.5);
    const defaults = [];
    for (let i = 0; i < 5; i++) {
      const mascot = shuffled[i % shuffled.length];
      defaults.push({
        id: "p_init_" + i + "_" + Math.random().toString(36).substring(2, 6),
        name: generateNickname(),
        avatarId: mascot.id,
        svg: mascot.svg
      });
    }
    return defaults;
  }

  let activeRoster = getRawStoredRoster();
  if (!activeRoster || activeRoster.length === 0) {
    activeRoster = generateDefaultRoster();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeRoster));
    } catch (e) {}
  }

  function syncAndDispatch(roster) {
    activeRoster = roster.map((p, i) => normalizePlayer(p, i));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeRoster));
    } catch (e) {}

    const ev = new CustomEvent("AllInOne:rosterupdated", {
      detail: { roster: activeRoster.slice() }
    });
    window.dispatchEvent(ev);
    document.dispatchEvent(ev);
  }

  /* ==========================================================================
     5. MODAL UI BUILDER
     ========================================================================== */
  let activeModalMode = "mascot"; // 'mascot' | 'custom'
  let selectedMascotId = MASCOTS[0].id;
  let customNameValue = "";

  function ensureModalDOM() {
    let modal = document.getElementById("pd-roster-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "pd-roster-modal";
    modal.className = "pd-avatar-modal-backdrop";
    modal.innerHTML = `
      <div class="pd-avatar-modal-card">
        <!-- Modal Top Bar -->
        <header class="pd-avatar-modal-top">
          <div class="pd-avatar-title-group">
            <span class="pd-avatar-modal-title">Party Lineup</span>
            <span class="pd-avatar-modal-sub" id="pdRosterCount">5 Seated Players</span>
          </div>
          <button type="button" class="pd-avatar-btn-close" id="pdBtnCloseRoster" aria-label="Close Roster">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>

        <!-- Mode Toggle Segmented Control -->
        <div class="pd-avatar-mode-bar">
          <button type="button" class="pd-mode-btn is-active" id="pdTabMascot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Mascot Mode
          </button>
          <button type="button" class="pd-mode-btn" id="pdTabCustom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Custom Name
          </button>
        </div>

        <!-- Creator Panel -->
        <section class="pd-avatar-creator-panel">
          <!-- Mascot Mode Creator -->
          <div class="pd-creator-pane is-active" id="pdPaneMascot">
            <div class="pd-mascot-roll-bar">
              <div class="pd-mascot-preview-box" id="pdMascotRollPreview"></div>
              <div class="pd-mascot-meta">
                <span class="pd-mascot-meta-name" id="pdMascotRollName">Captain Chaos</span>
                <span class="pd-mascot-meta-sub" id="pdMascotRollType">Cyber Dino</span>
              </div>
              <button type="button" class="pd-btn-roll" id="pdBtnRerollPreview" title="Re-roll Mascot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                Roll
              </button>
            </div>
            <button type="button" class="pd-btn-add-primary" id="pdBtnAddMascot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Mascot Player
            </button>
          </div>

          <!-- Custom Name Mode Creator -->
          <div class="pd-creator-pane" id="pdPaneCustom">
            <div class="pd-custom-input-bar">
              <div class="pd-custom-avatar-btn" id="pdBtnPickCustomAvatar" title="Change Avatar Icon"></div>
              <input type="text" id="pdInputCustomName" class="pd-custom-input" placeholder="Type player name..." maxlength="16" autocomplete="off" />
              <button type="button" class="pd-btn-add-custom" id="pdBtnAddCustom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
            <!-- Collapsible Avatar Grid for Custom Picker -->
            <div class="pd-mascot-picker-grid" id="pdCustomAvatarGrid"></div>
          </div>
        </section>

        <!-- Seated Players Section -->
        <div class="pd-roster-list-header">
          <span>Active Roster</span>
          <button type="button" class="pd-btn-wipe" id="pdBtnWipeRoster">Reset All</button>
        </div>
        <ul class="pd-roster-list" id="pdRosterItemsHost"></ul>

        <!-- Modal Footer Actions -->
        <footer class="pd-avatar-modal-footer">
          <button type="button" class="pd-btn-done" id="pdBtnDoneRoster">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Save &amp; Play
          </button>
        </footer>
      </div>
    `;

    document.body.appendChild(modal);
    bindModalEvents(modal);
    return modal;
  }

  let tempRollMascot = MASCOTS[0];
  let tempRollName = generateNickname();

  function rollNewMascotPreview() {
    tempRollMascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    tempRollName = generateNickname();
    const prev = document.getElementById("pdMascotRollPreview");
    const nameEl = document.getElementById("pdMascotRollName");
    const typeEl = document.getElementById("pdMascotRollType");
    if (prev) prev.innerHTML = tempRollMascot.svg;
    if (nameEl) nameEl.textContent = tempRollName;
    if (typeEl) typeEl.textContent = tempRollMascot.name;
    Sfx.play("roll");
  }

  function renderRosterListUI() {
    const list = document.getElementById("pdRosterItemsHost");
    const countEl = document.getElementById("pdRosterCount");
    if (!list) return;

    if (countEl) {
      countEl.textContent = `${activeRoster.length} Seated Player${activeRoster.length === 1 ? "" : "s"}`;
    }

    if (activeRoster.length === 0) {
      list.innerHTML = `
        <li class="pd-roster-empty">
          <span>No players added yet. Add a mascot or name above!</span>
        </li>
      `;
      return;
    }

    list.innerHTML = activeRoster
      .map(
        (player, idx) => `
      <li class="pd-roster-item" data-id="${player.id}">
        <span class="pd-roster-seat">#${idx + 1}</span>
        <div class="pd-roster-avatar-ico">${player.svg}</div>
        <span class="pd-roster-name">${player.name}</span>
        <div class="pd-roster-item-actions">
          <button type="button" class="pd-btn-row-action btn-reroll" data-reroll="${player.id}" title="Re-roll Avatar & Name">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          </button>
          <button type="button" class="pd-btn-row-action btn-del" data-del="${player.id}" title="Remove Player">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </li>
    `
      )
      .join("");
  }

  function renderCustomAvatarGrid() {
    const grid = document.getElementById("pdCustomAvatarGrid");
    const pickBtn = document.getElementById("pdBtnPickCustomAvatar");
    if (!grid) return;

    const currentMascot = MASCOTS.find(m => m.id === selectedMascotId) || MASCOTS[0];
    if (pickBtn) pickBtn.innerHTML = currentMascot.svg;

    grid.innerHTML = MASCOTS.map(
      m => `
      <button type="button" class="pd-grid-mascot-tile ${m.id === selectedMascotId ? "is-selected" : ""}" data-mascot="${m.id}" title="${m.name}">
        ${m.svg}
      </button>
    `
    ).join("");
  }

  function bindModalEvents(modal) {
    // Mode Switch
    const tabMascot = modal.querySelector("#pdTabMascot");
    const tabCustom = modal.querySelector("#pdTabCustom");
    const paneMascot = modal.querySelector("#pdPaneMascot");
    const paneCustom = modal.querySelector("#pdPaneCustom");

    tabMascot.onclick = () => {
      activeModalMode = "mascot";
      tabMascot.classList.add("is-active");
      tabCustom.classList.remove("is-active");
      paneMascot.classList.add("is-active");
      paneCustom.classList.remove("is-active");
      Sfx.play("toggle");
    };

    tabCustom.onclick = () => {
      activeModalMode = "custom";
      tabCustom.classList.add("is-active");
      tabMascot.classList.remove("is-active");
      paneCustom.classList.add("is-active");
      paneMascot.classList.remove("is-active");
      renderCustomAvatarGrid();
      Sfx.play("toggle");
    };

    // Re-roll Preview
    modal.querySelector("#pdBtnRerollPreview").onclick = rollNewMascotPreview;

    // Add Mascot Player
    modal.querySelector("#pdBtnAddMascot").onclick = () => {
      if (activeRoster.length >= 16) return;
      activeRoster.push({
        id: "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        name: tempRollName,
        avatarId: tempRollMascot.id,
        svg: tempRollMascot.svg
      });
      syncAndDispatch(activeRoster);
      renderRosterListUI();
      rollNewMascotPreview();
      Sfx.play("pop");
    };

    // Add Custom Player
    const customInput = modal.querySelector("#pdInputCustomName");
    const addCustomAction = () => {
      const val = customInput.value.trim();
      if (!val || activeRoster.length >= 16) return;
      const mascot = MASCOTS.find(m => m.id === selectedMascotId) || MASCOTS[0];
      activeRoster.push({
        id: "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        name: val,
        avatarId: mascot.id,
        svg: mascot.svg
      });
      customInput.value = "";
      syncAndDispatch(activeRoster);
      renderRosterListUI();
      Sfx.play("pop");
    };

    modal.querySelector("#pdBtnAddCustom").onclick = addCustomAction;
    customInput.onkeydown = e => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomAction();
      }
    };

    // Custom Avatar Grid Pick
    modal.querySelector("#pdCustomAvatarGrid").onclick = e => {
      const b = e.target.closest("[data-mascot]");
      if (!b) return;
      selectedMascotId = b.dataset.mascot;
      renderCustomAvatarGrid();
      Sfx.play("toggle");
    };

    // Roster Items Delegate (Re-roll single or Delete)
    modal.querySelector("#pdRosterItemsHost").onclick = e => {
      const btnDel = e.target.closest("[data-del]");
      if (btnDel) {
        const id = btnDel.dataset.del;
        activeRoster = activeRoster.filter(p => p.id !== id);
        syncAndDispatch(activeRoster);
        renderRosterListUI();
        Sfx.play("delete");
        return;
      }
      const btnReroll = e.target.closest("[data-reroll]");
      if (btnReroll) {
        const id = btnReroll.dataset.reroll;
        const target = activeRoster.find(p => p.id === id);
        if (target) {
          const freshMascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
          target.name = generateNickname();
          target.avatarId = freshMascot.id;
          target.svg = freshMascot.svg;
          syncAndDispatch(activeRoster);
          renderRosterListUI();
          Sfx.play("roll");
        }
      }
    };

    // Reset All
    modal.querySelector("#pdBtnWipeRoster").onclick = () => {
      activeRoster = generateDefaultRoster();
      syncAndDispatch(activeRoster);
      renderRosterListUI();
      Sfx.play("delete");
    };

    // Close Modal
    const closeModal = () => {
      modal.classList.remove("is-open");
      Sfx.play("success");
      if (typeof modal._onClose === "function") {
        modal._onClose(activeRoster.slice());
      }
    };

    modal.querySelector("#pdBtnCloseRoster").onclick = closeModal;
    modal.querySelector("#pdBtnDoneRoster").onclick = closeModal;
    modal.onclick = e => {
      if (e.target === modal) closeModal();
    };
  }

  /* ==========================================================================
     6. PUBLIC API SPECIFICATION
     ========================================================================== */
  const AllInOneAvatars = {
    getAll() {
      return MASCOTS.slice();
    },

    getById(id) {
      return MASCOTS.find(m => m.id === id) || MASCOTS[0];
    },

    generateNickname() {
      return generateNickname();
    },

    random() {
      const mascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
      return {
        id: mascot.id,
        name: generateNickname(),
        svg: mascot.svg
      };
    },

    renderAvatarSVG(id, size = 32) {
      const mascot = this.getById(id);
      return `<span class="pd-avatar-icon-wrap" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;color:currentColor;">${mascot.svg}</span>`;
    },

    getRoster() {
      return activeRoster.slice();
    },

    saveRoster(newRoster) {
      syncAndDispatch(newRoster);
    },

    openRosterModal(onCloseCallback) {
      const modal = ensureModalDOM();
      modal._onClose = onCloseCallback;
      rollNewMascotPreview();
      renderRosterListUI();
      renderCustomAvatarGrid();
      modal.classList.add("is-open");
      Sfx.play("pop");
    }
  };

  window.AllInOneAvatars = AllInOneAvatars;
})(window);