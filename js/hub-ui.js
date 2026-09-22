/**
 * PARTYDECK Hub UI Controller
 * Robust modal launching, defensive tag mapping, category filters, and roster syncing.
 */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // Elements
  const gamesGrid = document.getElementById("gamesGrid");
  const filterNav = document.getElementById("filterNav");
  const countAll = document.getElementById("countAll");

  // Roster Modal Elements
  const rosterModal = document.getElementById("rosterModal");
  const rosterList = document.getElementById("rosterList");
  const rosterLabel = document.getElementById("rosterLabel");
  const addPlayerForm = document.getElementById("addPlayerForm");
  const newPlayerName = document.getElementById("newPlayerName");
  const btnManageRoster = document.getElementById("btnManageRoster");
  const btnCloseRoster = document.getElementById("btnCloseRoster");
  const btnClearRoster = document.getElementById("btnClearRoster");
  const btnSaveRoster = document.getElementById("btnSaveRoster");

  // Game Details Preview Modal Elements
  const gameModal = document.getElementById("gameModal");
  const previewIcon = document.getElementById("previewIcon");
  const previewCategory = document.getElementById("previewCategory");
  const previewTitle = document.getElementById("previewTitle");
  const previewTagline = document.getElementById("previewTagline");
  const previewDescription = document.getElementById("previewDescription");
  const previewPlayers = document.getElementById("previewPlayers");
  const previewTime = document.getElementById("previewTime");
  const previewDrink = document.getElementById("previewDrink");
  const previewTags = document.getElementById("previewTags");
  const btnLaunchGame = document.getElementById("btnLaunchGame");
  const btnCloseGameModal = document.getElementById("btnCloseGameModal");
  const btnCancelLaunch = document.getElementById("btnCancelLaunch");

  // Icons Helper with Safe Fallbacks
  function getIcon(key) {
    if (window.Icons && typeof window.Icons.get === "function") {
      return window.Icons.get(key || "palette");
    }
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  // Inject Static UI Icons
  const themeIconSlot = document.getElementById("themeIconSlot");
  if (themeIconSlot) themeIconSlot.innerHTML = getIcon("palette");

  const rosterIconSlot = document.getElementById("rosterIconSlot");
  if (rosterIconSlot) rosterIconSlot.innerHTML = getIcon("users");

  if (btnCloseRoster) btnCloseRoster.innerHTML = getIcon("close");
  if (btnCloseGameModal) btnCloseGameModal.innerHTML = getIcon("close");

  // State
  let activeCategory = "all";
  let activeRoster = [];
  try {
    activeRoster = JSON.parse(localStorage.getItem("partydeck_players") || "[]");
    if (!Array.isArray(activeRoster)) activeRoster = [];
  } catch (e) {
    activeRoster = [];
  }

  // Render Game Cards
  function renderGames(category = "all") {
    if (!gamesGrid) return;
    const games = Array.isArray(window.PARTY_GAMES) ? window.PARTY_GAMES : [];
    const filtered = category === "all" ? games : games.filter((g) => g.category === category);

    if (countAll) countAll.textContent = games.length;

    gamesGrid.innerHTML = filtered
      .map((game) => {
        const tagsList = Array.isArray(game.tags) ? game.tags : [];
        const tagBadges = tagsList
          .slice(0, 2)
          .map((t) => `<span class="badge-tag">${t}</span>`)
          .join("");

        return `
        <article class="game-card" data-id="${game.id}" tabindex="0" role="button" aria-label="${game.title}">
          <div class="card-hero">
            <span class="card-icon-slot">${getIcon(game.icon || "palette")}</span>
            <span class="card-cat">${(game.category || "Party").toUpperCase()}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${game.title}</h3>
            <p class="card-tagline">${game.tagline || ""}</p>
            <div class="card-meta-row">
              <span>${game.minPlayers || 2}–${game.maxPlayers || 12} Players</span>
              <span>${game.estimatedTime || "15m"}</span>
            </div>
            <div class="card-tags-row">${tagBadges}</div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  // Open Game Modal (Defensive against undefined values)
  function openGameModal(gameId) {
    const games = Array.isArray(window.PARTY_GAMES) ? window.PARTY_GAMES : [];
    const game = games.find((g) => g.id === gameId);
    if (!game || !gameModal) return;

    if (previewIcon) previewIcon.innerHTML = getIcon(game.icon || "palette");
    if (previewCategory) previewCategory.textContent = (game.category || "Party").toUpperCase();
    if (previewTitle) previewTitle.textContent = game.title || "Game Preview";
    if (previewTagline) previewTagline.textContent = game.tagline || "";
    if (previewDescription) previewDescription.textContent = game.description || "No description provided.";
    if (previewPlayers) previewPlayers.textContent = `${game.minPlayers || 2}–${game.maxPlayers || 12} Players`;
    if (previewTime) previewTime.textContent = game.estimatedTime || "15 min";
    if (previewDrink) previewDrink.textContent = game.drinkingMode ? "Drinking Game" : "Casual / Casual Party";

    // Safe Tag Mapping (Defends against Line 145 Uncaught TypeError)
    if (previewTags) {
      const tagsList = Array.isArray(game.tags) ? game.tags : [];
      previewTags.innerHTML = tagsList.map((tag) => `<span class="tag-pill">${tag}</span>`).join("");
    }

    if (btnLaunchGame) {
      btnLaunchGame.href = game.entryPath || "#";
    }

    if (typeof gameModal.showModal === "function") {
      gameModal.showModal();
    } else {
      gameModal.setAttribute("open", "");
    }
  }

  // Click on Game Card
  if (gamesGrid) {
    gamesGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".game-card");
      if (card && card.dataset.id) {
        if (window.PartyDeck && PartyDeck.playSound) PartyDeck.playSound("click");
        openGameModal(card.dataset.id);
      }
    });

    gamesGrid.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest(".game-card");
        if (card && card.dataset.id) {
          e.preventDefault();
          openGameModal(card.dataset.id);
        }
      }
    });
  }

  // Category Filter Pills
  if (filterNav) {
    filterNav.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;

      filterNav.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.dataset.category || "all";
      renderGames(activeCategory);
      if (window.PartyDeck && PartyDeck.playSound) PartyDeck.playSound("click");
    });
  }

  // Roster Management
  function updateRosterUI() {
    if (rosterLabel) {
      if (activeRoster.length === 0) {
        rosterLabel.innerHTML = `Active Roster: <strong>None set</strong>`;
      } else {
        rosterLabel.innerHTML = `Active Roster: <strong>${activeRoster.length} (${activeRoster.join(", ")})</strong>`;
      }
    }

    if (rosterList) {
      rosterList.innerHTML = activeRoster
        .map(
          (name, idx) => `
        <li class="roster-tag">
          <span>${name}</span>
          <button type="button" class="roster-tag-remove" data-idx="${idx}" aria-label="Remove ${name}">
            ${getIcon("close")}
          </button>
        </li>
      `
        )
        .join("");
    }

    try {
      localStorage.setItem("partydeck_players", JSON.stringify(activeRoster));
    } catch (e) {}
  }

  if (addPlayerForm) {
    addPlayerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = newPlayerName.value.trim();
      if (name && !activeRoster.includes(name)) {
        activeRoster.push(name);
        newPlayerName.value = "";
        if (window.PartyDeck && PartyDeck.playSound) PartyDeck.playSound("click");
        updateRosterUI();
      }
    });
  }

  if (rosterList) {
    rosterList.addEventListener("click", (e) => {
      const btn = e.target.closest(".roster-tag-remove");
      if (btn) {
        const idx = parseInt(btn.dataset.idx, 10);
        activeRoster.splice(idx, 1);
        if (window.PartyDeck && PartyDeck.playSound) PartyDeck.playSound("click");
        updateRosterUI();
      }
    });
  }

  if (btnClearRoster) {
    btnClearRoster.addEventListener("click", () => {
      activeRoster = [];
      if (window.PartyDeck && PartyDeck.playSound) PartyDeck.playSound("click");
      updateRosterUI();
    });
  }

  if (btnManageRoster && rosterModal) {
    btnManageRoster.addEventListener("click", () => {
      if (window.PartyDeck && PartyDeck.playSound) PartyDeck.playSound("click");
      if (typeof rosterModal.showModal === "function") rosterModal.showModal();
      else rosterModal.setAttribute("open", "");
    });
  }

  // Close Modals
  const closeModal = (modal) => {
    if (!modal) return;
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  };

  if (btnCloseRoster) btnCloseRoster.addEventListener("click", () => closeModal(rosterModal));
  if (btnSaveRoster) btnSaveRoster.addEventListener("click", () => closeModal(rosterModal));
  if (btnCloseGameModal) btnCloseGameModal.addEventListener("click", () => closeModal(gameModal));
  if (btnCancelLaunch) btnCancelLaunch.addEventListener("click", () => closeModal(gameModal));

  // Initialize
  renderGames();
  updateRosterUI();
});