/**
 * PARTYDECK Hub UI Controller
 * Vector icon binding, filtering, and modal launchers.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Inject Static Icons
  const themeIconSlot = document.getElementById("themeIconSlot");
  if (themeIconSlot) themeIconSlot.innerHTML = Icons.get("palette");

  const rosterIconSlot = document.getElementById("rosterIconSlot");
  if (rosterIconSlot) rosterIconSlot.innerHTML = Icons.get("users");

  const btnCloseRoster = document.getElementById("btnCloseRoster");
  if (btnCloseRoster) btnCloseRoster.innerHTML = Icons.get("close");

  const btnCloseGameModal = document.getElementById("btnCloseGameModal");
  if (btnCloseGameModal) btnCloseGameModal.innerHTML = Icons.get("close");

  const rosterModalTitle = document.getElementById("rosterModalTitle");
  if (rosterModalTitle) {
    rosterModalTitle.innerHTML = `${Icons.get("users")} <span>PARTY ROSTER</span>`;
  }

  const gamesGrid = document.getElementById("gamesGrid");
  const filterPills = document.querySelectorAll(".filter-pill");
  const countAll = document.getElementById("countAll");

  const rosterModal = document.getElementById("rosterModal");
  const gameModal = document.getElementById("gameModal");
  const btnEditRoster = document.getElementById("btnEditRoster");
  const btnSaveRoster = document.getElementById("btnSaveRoster");
  const btnClearRoster = document.getElementById("btnClearRoster");
  const addPlayerForm = document.getElementById("addPlayerForm");
  const newPlayerName = document.getElementById("newPlayerName");
  const rosterList = document.getElementById("rosterList");
  const rosterLabel = document.getElementById("rosterLabel");

  const btnCancelLaunch = document.getElementById("btnCancelLaunch");
  const btnLaunchGame = document.getElementById("btnLaunchGame");

  const previewIconBox = document.getElementById("previewIconBox");
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
          <div class="card-icon-box">${Icons.get(game.iconKey)}</div>
          <span class="card-badge">${game.category}</span>
        </div>
        <div>
          <h3 class="game-title">${game.title}</h3>
          <p class="game-tagline">${game.tagline}</p>
        </div>
        <div class="card-meta">
          <span class="meta-indicator">${Icons.get('users')} ${game.minPlayers}–${game.maxPlayers}P</span>
          <span class="meta-indicator">${Icons.get('clock')} ${game.estimatedTime}</span>
          ${game.drinkingMode ? `<span class="meta-indicator drink-pill">${Icons.get('beer')} DRINK</span>` : ''}
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

  function openGameModal(game) {
    PartyDeck.playSound("click");
    previewIconBox.innerHTML = Icons.get(game.iconKey);
    previewCategory.textContent = `MODULE // ${game.category.toUpperCase()}`;
    previewTitle.textContent = game.title;
    previewTagline.textContent = game.tagline;
    previewDescription.textContent = game.description;
    previewPlayers.textContent = `${game.minPlayers}–${game.maxPlayers}P`;
    previewTime.textContent = game.estimatedTime;
    previewDrink.textContent = game.drinkingMode ? "Enabled" : "Disabled";

    previewTags.innerHTML = game.tags
      .map(t => `<span class="game-tag-badge">#${t}</span>`)
      .join("");

    btnLaunchGame.href = game.entryPath;
    btnLaunchGame.innerHTML = `${Icons.get('play')} Launch Module`;
    gameModal.showModal();
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      PartyDeck.playSound("click");
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.dataset.category;
      renderGames(activeCategory);
    });
  });

  function updateRosterUI() {
    rosterList.innerHTML = "";
    if (activeRoster.length === 0) {
      rosterLabel.innerHTML = `Active Roster: <strong>None set</strong>`;
    } else {
      rosterLabel.innerHTML = `Active Roster: <strong>${activeRoster.length} (${activeRoster.join(", ")})</strong>`;
    }

    activeRoster.forEach((name, idx) => {
      const li = document.createElement("li");
      li.className = "roster-tag";
      li.innerHTML = `
        <span>${name}</span>
        <button type="button" class="roster-tag-remove" data-idx="${idx}" aria-label="Remove ${name}">
          ${Icons.get('close')}
        </button>
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
    const btn = e.target.closest(".roster-tag-remove");
    if (btn) {
      const idx = parseInt(btn.dataset.idx, 10);
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

  renderGames();
  updateRosterUI();
});