/**
 * TELE-SKETCH Game State Machine & Turn Controller
 */
document.addEventListener("DOMContentLoaded", () => {
  // Preset Prompts Bank
  const PROMPTS = [
    "Dancing Cactus", "Astronaut on a Donkey", "Laser Cat", "Exploding Pizza", 
    "Penguin in Sunglasses", "Haunted Toaster", "Dinosaur Ballet", "Ninja Turtle at Dentist",
    "SpongeBob at Job Interview", "Zombie Eating Ice Cream", "Robot Walking a Dog", 
    "Grandma Doing a Backflip", "Unicorn in Traffic", "Pirate at a Car Wash",
    "Shark Riding a Bicycle", "Taco Playing Guitar", "Superhero Misses Bus"
  ];

  const PALETTE = [
    "#000000", "#555555", "#e94560", "#ff3366", "#ff9933", 
    "#f6d860", "#00ff88", "#00b4d8", "#6366f1", "#9d4edd", "#8d5b4c", "#ffffff"
  ];

  // DOM Elements
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

  // Game State Variables
  let players = PartyDeck.getPlayers();
  if (players.length < 3) players = ["Player 1", "Player 2", "Player 3", "Player 4"];

  let chains = []; // [{ owner: "Name", steps: [{ type: "prompt"|"draw"|"guess", author: "Name", value: "..." }] }]
  let currentRound = 0;
  let totalRounds = 0;
  let canvasEngine = null;
  let timerInterval = null;
  let timeLeft = 45;

  // Initialize Canvas
  const canvasEl = document.getElementById("paintCanvas");
  canvasEngine = new CanvasEngine(canvasEl);

  // 1. Build Palette
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

  // 2. Setup Screen Management
  function renderSetupList() {
    orderList.innerHTML = players.map((p, i) => `<li>${p}</li>`).join("");
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

  // 3. Start Game
  btnStartGame.addEventListener("click", () => {
    if (players.length < 3) {
      alert("Please add at least 3 players to play Tele-Sketch!");
      return;
    }

    PartyDeck.playSound("success");
    PartyDeck.vibrate([100, 50, 100]);

    // Initialize Chains (one chain starts for each player)
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
    totalRounds = players.length; // Complete when chain returns around
    startTurnSequence();
  });

  // 4. Turn Sequence & State Transitions
  function startTurnSequence() {
    if (currentRound >= totalRounds) {
      showFinale();
      return;
    }

    // Determine current chain and active player
    // Chain rotates: in round R, player i works on chain (i - R + N) % N
    const N = players.length;
    const activePlayerIndex = currentRound % N;
    const activePlayer = players[activePlayerIndex];
    
    // Privacy Shield before turn starts
    nextPlayerPrompt.textContent = `Pass phone to ${activePlayer}`;
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

    stepBadge.textContent = `ROUND ${currentRound + 1}/${totalRounds}`;
    activePlayerIndicator.textContent = `${players[playerIdx]}'s Turn`;

    // Hide all phases
    phaseSetup.classList.add("hidden");
    phaseDraw.classList.add("hidden");
    phaseGuess.classList.add("hidden");
    phaseFinale.classList.add("hidden");

    // Start Timer
    startTimer(45);

    if (lastStep.type === "prompt" || lastStep.type === "guess") {
      // TURN TYPE: DRAW
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
      // TURN TYPE: GUESS
      phaseGuess.classList.remove("hidden");
      imgToGuess.src = lastStep.value;
      guessInput.value = "";
      guessInput.focus();

      btnSubmitGuess.onclick = () => {
        const guess = guessInput.value.trim() || "Something strange";
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

  // 5. Finale Slideshow
  function showFinale() {
    clearInterval(timerInterval);
    phaseSetup.classList.add("hidden");
    phaseDraw.classList.add("hidden");
    phaseGuess.classList.add("hidden");
    phaseFinale.classList.remove("hidden");

    stepBadge.textContent = "GAME OVER";
    activePlayerIndicator.textContent = "All Chains Complete!";
    turnTimer.textContent = "🎉";

    PartyDeck.playSound("success");

    chainsContainer.innerHTML = chains.map((chain, cIdx) => `
      <div class="chain-card">
        <div class="chain-header">CHAIN #${cIdx + 1} (Started by ${chain.owner})</div>
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

  // Navigation Handlers
  btnExit.addEventListener("click", () => PartyDeck.exitToHub());
  btnFinaleExit.addEventListener("click", () => PartyDeck.exitToHub());
  btnRestart.addEventListener("click", () => {
    phaseFinale.classList.add("hidden");
    phaseSetup.classList.remove("hidden");
    stepBadge.textContent = "SETUP";
    activePlayerIndicator.textContent = "Players Setup";
  });
});