/**
 * PARTYDECK Hub UI Controller
 * Handles grid rendering, filtering, modals, and player roster management.
 */
document.addEventListener("DOMContentLoaded", () => {
  const gamesGrid = document.getElementById("gamesGrid");
  const filterPills = document.querySelectorAll(".filter-pill");
  const countAll = document.getElementById("countAll");

  // Modals
  const rosterModal = document.getElementById("rosterModal");
  const gameModal = document.getElementById("gameModal");
  const btnEditRoster = document.getElementById("btnEditRoster");
  const btnCloseRoster = document.getElementById("btnCloseRoster");
  const btnSaveRoster = document.getElementById("btnSaveRoster");
  const btnClearRoster = document.getElementById("btnClearRoster");
  const addPlayerForm = document.getElementById("addPlayerForm");
  const newPlayerName = document.getElementById("newPlayerName");
  const rosterList = document.getElementById("rosterList");
  const rosterLabel = document.getElementById("rosterLabel");

  const btnCloseGameModal = document.getElementById("btnCloseGameModal");
  const btnCancelLaunch = document.getElementById("btnCancelLaunch");
  const btnLaunchGame = document.getElementById("btnLaunchGame");

  // Preview elements
  const previewIcon = document.getElementById("previewIcon");
  const previewCategory = document.getElementById("previewCategory");
  const previewTitle = document.getElementById("previewTitle");
  const previewTagline = document.getElementById("previewTagline");
  const previewDescription = document.getElementById("previewDescription");
  const previewPlayers = document.getElementById("previewPlayers");
  const previewTime = document.getElementById("previewTime");
  const previewDrink = document.getElementById("previewDrink");
  const previewTags = document.getElementById("previewTags");

  let activeCategory = "all";
  let activeRoster = PartyDeck.getPlayers();

  // 1. Render Games Grid
  function renderGames(category = "all") {
    if (countAll) countAll.textContent = PARTY_GAMES.length;
    gamesGrid.innerHTML = "";

    const filtered = category === "all" 
      ? PARTY_GAMES 
      : PARTY_GAMES.filter(g => g.category === category);

    filtered.forEach(game => {
      const card = document.createElement("article");
      card.className = "game-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `View details for ${game.title}`);

      card.innerHTML = `
        <div class="card-top">
          <span class="card-icon">${game.icon}</span>
          <span class="card-badge">${game.category}</span>
        </div>
        <div>
          <h3 class="game-title">${game.title}</h3>
          <p class="game-tagline">${game.tagline}</p>
        </div>
        <div class="card-meta">
          <span>👥 ${game.minPlayers}–${game.maxPlayers} players</span>
          <span>⏱️ ${game.estimatedTime}</span>
          ${game.drinkingMode ? '<span class="drink-indicator">🍻 Drinking</span>' : ''}
        </div>
      `;

      card.addEventListener("click", () => openGameModal(game));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openGameModal(game);
        }
      });

      gamesGrid.appendChild(card);
    });
  }

  // 2. Open Game Details Modal
  function openGameModal(game) {
    PartyDeck.playSound("click");
    previewIcon.textContent = game.icon;
    previewCategory.textContent = game.category.toUpperCase();
    previewTitle.textContent = game.title;
    previewTagline.textContent = game.tagline;
    previewDescription.textContent = game.description;
    previewPlayers.textContent = `${game.minPlayers}–${game.maxPlayers}`;
    previewTime.textContent = game.estimatedTime;
    previewDrink.textContent = game.drinkingMode ? "Yes (Optional)" : "No";

    previewTags.innerHTML = game.tags
      .map(t => `<span class="game-tag-badge">#${t}</span>`)
      .join("");

    btnLaunchGame.href = game.entryPath;
    gameModal.showModal();
  }

  // 3. Category Filter Handlers
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      PartyDeck.playSound("click");
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.dataset.category;
      renderGames(activeCategory);
    });
  });

  // 4. Player Roster Management
  function updateRosterUI() {
    rosterList.innerHTML = "";
    if (activeRoster.length === 0) {
      rosterLabel.innerHTML = `Active Players: <strong>None set</strong>`;
    } else {
      rosterLabel.innerHTML = `Active Players: <strong>${activeRoster.length} (${activeRoster.join(", ")})</strong>`;
    }

    activeRoster.forEach((name, idx) => {
      const li = document.createElement("li");
      li.className = "roster-tag";
      li.innerHTML = `
        <span>${name}</span>
        <button type="button" class="roster-tag-remove" data-idx="${idx}" aria-label="Remove ${name}">✕</button>
      `;
      rosterList.appendChild(li);
    });

    PartyDeck.setPlayers(activeRoster);
  }

  addPlayerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = newPlayerName.value.trim();
    if (name && !activeRoster.includes(name)) {
      activeRoster.push(name);
      newPlayerName.value = "";
      PartyDeck.playSound("click");
      updateRosterUI();
    }
  });

  rosterList.addEventListener("click", (e) => {
    if (e.target.classList.contains("roster-tag-remove")) {
      const idx = parseInt(e.target.dataset.idx, 10);
      activeRoster.splice(idx, 1);
      PartyDeck.playSound("click");
      updateRosterUI();
    }
  });

  btnClearRoster.addEventListener("click", () => {
    activeRoster = [];
    PartyDeck.playSound("click");
    updateRosterUI();
  });

  btnEditRoster.addEventListener("click", () => {
    PartyDeck.playSound("click");
    rosterModal.showModal();
  });

  btnCloseRoster.addEventListener("click", () => rosterModal.close());
  btnSaveRoster.addEventListener("click", () => rosterModal.close());

  btnCloseGameModal.addEventListener("click", () => gameModal.close());
  btnCancelLaunch.addEventListener("click", () => gameModal.close());

  // Initialize
  renderGames();
  updateRosterUI();
});