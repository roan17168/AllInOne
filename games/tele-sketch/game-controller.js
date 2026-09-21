/**
 * TELE-SKETCH Controller (Arcade & Vector Icon Edition)
 */
document.addEventListener("DOMContentLoaded", () => {
  // Bind Vector Icons into Tele-Sketch UI
  document.getElementById("exitIconSlot").innerHTML = Icons.get("arrowRight");
  document.getElementById("setupHeroIcon").innerHTML = Icons.get("palette");
  document.getElementById("startIconSlot").innerHTML = Icons.get("play");
  document.getElementById("undoIconSlot").innerHTML = Icons.get("undo");
  document.getElementById("trashIconSlot").innerHTML = Icons.get("trash");
  document.getElementById("passDrawIconSlot").innerHTML = Icons.get("arrowRight");
  document.getElementById("passGuessIconSlot").innerHTML = Icons.get("arrowRight");
  document.getElementById("restartIconSlot").innerHTML = Icons.get("refresh");
  document.getElementById("shieldLockIconSlot").innerHTML = Icons.get("lock");
  document.getElementById("unlockIconSlot").innerHTML = Icons.get("unlock");

  const PROMPTS = [
    "Dancing Cactus", "Astronaut on a Donkey", "Laser Cat", "Exploding Pizza", 
    "Penguin in Sunglasses", "Haunted Toaster", "Dinosaur Ballet", "Ninja Turtle at Dentist",
    "Robot Walking a Dog", "Grandma Doing a Backflip", "Unicorn in Traffic", "Pirate at a Car Wash",
    "Shark Riding a Bicycle", "Taco Playing Guitar", "Superhero Misses Bus"
  ];

  const PALETTE = [
    "#000000", "#555555", "#e94560", "#ff3366", "#ff9933", 
    "#ffcc00", "#00ff66", "#0099ff", "#6366f1", "#9d4edd", "#8d5b4c", "#ffffff"
  ];

  const phaseSetup = document.getElementById("phaseSetup");
  const phaseDraw = document.getElementById("phaseDraw");
  const phaseGuess = document.getElementById("phaseGuess");
  const phaseFinale = document.getElementById("phaseFinale");
  const privacyShield = document.getElementById("privacyShield");

  const orderList = document.getElementById("orderList");
  const setupPlayerInput = document.getElementById("setupPlayerInput");
  const setupAddForm = document.getElementById("setupAddForm");
  const btnStartGame = document.getElementById("btnStartGame");
  const btnExit = document.getElementById("btnExit");
  const btnFinaleExit = document.getElementById("btnFinaleExit");
  const btnRestart = document.getElementById("btnRestart");

  const stepBadge = document.getElementById("stepBadge");
  const activePlayerIndicator = document.getElementById("activePlayerIndicator");
  const turnTimer = document.getElementById("turnTimer");
  const nextPlayerPrompt = document.getElementById("nextPlayerPrompt");
  const btnUnlockShield = document.getElementById("btnUnlockShield");

  const currentPromptText = document.getElementById("currentPromptText");
  const paletteRibbon = document.getElementById("paletteRibbon");
  const brushSize = document.getElementById("brushSize");
  const btnUndo = document.getElementById("btnUndo");
  const btnClearCanvas = document.getElementById("btnClearCanvas");
  const btnFinishDrawing = document.getElementById("btnFinishDrawing");

  const imgToGuess = document.getElementById("imgToGuess");
  const guessInput = document.getElementById("guessInput");
  const btnSubmitGuess = document.getElementById("btnSubmitGuess");
  const chainsContainer = document.getElementById("chainsContainer");

  let players = PartyDeck.getPlayers();
  if (players.length < 3) players = ["Player 1", "Player 2", "Player 3", "Player 4"];

  let chains = [];
  let currentRound = 0;
  let totalRounds = 0;
  let canvasEngine = null;
  let timerInterval = null;
  let timeLeft = 45;

  const canvasEl = document.getElementById("paintCanvas");
  canvasEngine = new CanvasEngine(canvasEl);

  PALETTE.forEach((color, i) => {
    const swatch = document.createElement("button");
    swatch.className = `color-swatch ${i === 0 ? "active" : ""}`;
    swatch.style.backgroundColor = color;
    swatch.setAttribute("aria-label", `Color ${color}`);
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      canvasEngine.setColor(color);
      PartyDeck.playSound("click");
    });
    paletteRibbon.appendChild(swatch);
  });

  brushSize.addEventListener("input", (e) => {
    canvasEngine.setBrushSize(parseInt(e.target.value, 10));
  });

  btnUndo.addEventListener("click", () => {
    PartyDeck.playSound("click");
    canvasEngine.undo();
  });

  btnClearCanvas.addEventListener("click", () => {
    PartyDeck.playSound("click");
    canvasEngine.clear(true);
  });

  function renderSetupList() {
    orderList.innerHTML = players.map(p => `<li>${p}</li>`).join("");
    PartyDeck.setPlayers(players);
  }

  setupAddForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = setupPlayerInput.value.trim();
    if (name) {
      players.push(name);
      setupPlayerInput.value = "";
      renderSetupList();
      PartyDeck.playSound("click");
    }
  });

  renderSetupList();

  btnStartGame.addEventListener("click", () => {
    if (players.length < 3) {
      alert("Please add at least 3 players to start Tele-Sketch.");
      return;
    }

    PartyDeck.playSound("success");
    PartyDeck.vibrate([100, 50, 100]);

    chains = players.map(player => {
      const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
      return {
        owner: player,
        steps: [
          { type: "prompt", author: player, value: randomPrompt }
        ]
      };
    });

    currentRound = 0;
    totalRounds = players.length;
    startTurnSequence();
  });

  function startTurnSequence() {
    if (currentRound >= totalRounds) {
      showFinale();
      return;
    }

    const N = players.length;
    const activePlayerIndex = currentRound % N;
    const activePlayer = players[activePlayerIndex];
    
    nextPlayerPrompt.textContent = `Pass terminal to ${activePlayer}`;
    privacyShield.classList.remove("hidden");
    PartyDeck.vibrate([60]);

    btnUnlockShield.onclick = () => {
      privacyShield.classList.add("hidden");
      PartyDeck.playSound("click");
      executePlayerTurn(activePlayerIndex);
    };
  }

  function executePlayerTurn(playerIdx) {
    const N = players.length;
    const chainIdx = (playerIdx - currentRound + N) % N;
    const currentChain = chains[chainIdx];
    const lastStep = currentChain.steps[currentChain.steps.length - 1];

    stepBadge.textContent = `ROUND // ${currentRound + 1} OF ${totalRounds}`;
    activePlayerIndicator.textContent = `${players[playerIdx]}`;

    phaseSetup.classList.add("hidden");
    phaseDraw.classList.add("hidden");
    phaseGuess.classList.add("hidden");
    phaseFinale.classList.add("hidden");

    startTimer(45);

    if (lastStep.type === "prompt" || lastStep.type === "guess") {
      phaseDraw.classList.remove("hidden");
      currentPromptText.textContent = lastStep.value;
      canvasEngine.clear(false);

      btnFinishDrawing.onclick = () => {
        clearInterval(timerInterval);
        const drawingData = canvasEngine.getImageData();
        currentChain.steps.push({
          type: "draw",
          author: players[playerIdx],
          value: drawingData
        });

        PartyDeck.playSound("success");
        currentRound++;
        startTurnSequence();
      };
    } else if (lastStep.type === "draw") {
      phaseGuess.classList.remove("hidden");
      imgToGuess.src = lastStep.value;
      guessInput.value = "";
      guessInput.focus();

      btnSubmitGuess.onclick = () => {
        const guess = guessInput.value.trim() || "Unidentified Sketch";
        clearInterval(timerInterval);
        currentChain.steps.push({
          type: "guess",
          author: players[playerIdx],
          value: guess
        });

        PartyDeck.playSound("success");
        currentRound++;
        startTurnSequence();
      };
    }
  }

  function startTimer(seconds) {
    clearInterval(timerInterval);
    timeLeft = seconds;
    turnTimer.textContent = `${timeLeft}s`;

    timerInterval = setInterval(() => {
      timeLeft--;
      turnTimer.textContent = `${timeLeft}s`;
      if (timeLeft <= 5 && timeLeft > 0) {
        PartyDeck.playSound("alert");
        PartyDeck.vibrate([30]);
      }
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        PartyDeck.playSound("alert");
      }
    }, 1000);
  }

  function showFinale() {
    clearInterval(timerInterval);
    phaseSetup.classList.add("hidden");
    phaseDraw.classList.add("hidden");
    phaseGuess.classList.add("hidden");
    phaseFinale.classList.remove("hidden");

    stepBadge.textContent = "COMPLETE";
    activePlayerIndicator.textContent = "All Chains Resolved";
    turnTimer.textContent = "DONE";

    PartyDeck.playSound("success");

    chainsContainer.innerHTML = chains.map((chain, cIdx) => `
      <div class="chain-card">
        <div class="chain-header">LOG // CHAIN #${cIdx + 1} (ORIGIN: ${chain.owner.toUpperCase()})</div>
        <div class="chain-steps">
          ${chain.steps.map(s => `
            <div class="step-row">
              <span class="step-author">${s.author}:</span>
              ${s.type === 'draw' 
                ? `<img class="step-content-img" src="${s.value}" alt="Drawing" />` 
                : `<span class="step-content-text">"${s.value}"</span>`}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  btnExit.addEventListener("click", () => PartyDeck.exitToHub());
  btnFinaleExit.addEventListener("click", () => PartyDeck.exitToHub());
  btnRestart.addEventListener("click", () => {
    phaseFinale.classList.add("hidden");
    phaseSetup.classList.remove("hidden");
    stepBadge.textContent = "SETUP // PHASE";
    activePlayerIndicator.textContent = "Roster Initialization";
  });
});