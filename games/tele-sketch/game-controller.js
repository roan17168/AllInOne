/**
 * TELE-SKETCH GAME CONTROLLER
 * ---------------------------------------------------------------------------
 * Owns: icon injection, phase routing, roster setup, the turn state machine,
 * the privacy curtain, the countdown timer, the finale strip and PNG export.
 *
 * TURN / CHAIN MATHS  (this is the part that was broken before)
 * ------------------------------------------------------------
 *   n = player count, C = chain count, R = rounds (laps of the table)
 *   totalTurns = R * n
 *
 *   For global turn index t:
 *       seat  = t % n              -> which player holds the device
 *       lap   = floor(t / n)       -> how many complete laps have happened
 *       chain = C === 1 ? 0 : (seat - lap + C) % C
 *
 *   Because `lap` only advances after all n players have played, every player
 *   works on a DIFFERENT chain each lap and never revisits one. Previously
 *   `lap` was incremented every single turn, which collapsed the expression
 *   to chain 0 for everybody — one chain got all the work and the rest stayed
 *   empty. That is fixed here.
 *
 *   Turn type is derived from the last step in the assigned chain:
 *       last step was prompt or guess -> DRAW
 *       last step was a drawing       -> GUESS
 *   All chains advance in lockstep, so laps alternate draw / guess cleanly.
 * ---------------------------------------------------------------------------
 */
(function () {
  "use strict";

  /* =====================================================================
     0 · SAFE DEPENDENCY SHIMS
     The module must run even if icons.js / partydeck-sdk.js are absent.
     ===================================================================== */

  const LOCAL_ICONS = {
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'
  };

  /** Resolve an icon from the shared registry first, then the local set. */
  function icon(name) {
    if (window.Icons && window.Icons.svgs && window.Icons.svgs[name]) {
      return window.Icons.get(name);
    }
    return LOCAL_ICONS[name] || LOCAL_ICONS.palette;
  }

  const SDK = window.PartyDeck || {};
  const PD = {
    getPlayers: SDK.getPlayers || function () {
      try { return JSON.parse(localStorage.getItem("partydeck_players") || "[]"); }
      catch (e) { return []; }
    },
    setPlayers: SDK.setPlayers || function (arr) {
      try { localStorage.setItem("partydeck_players", JSON.stringify(arr)); } catch (e) {}
    },
    vibrate: SDK.vibrate || function (p) {
      if (navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} }
    },
    exitToHub: SDK.exitToHub || function () { window.location.href = "../../index.html"; }
  };

  /* Apply the saved theme immediately (also covers a missing theme-engine). */
  (function applyTheme() {
    let t = "cyber-neon";
    try { t = localStorage.getItem("partydeck_theme") || t; } catch (e) {}
    document.documentElement.setAttribute("data-theme", t);
    const meta = document.getElementById("metaThemeColor");
    const map = { "cyber-neon": "#08090c", "sunset-rave": "#0f071d", "retro-arcade": "#12131c", "minimal-light": "#f4f6f9" };
    if (meta && map[t]) meta.setAttribute("content", map[t]);
  })();

  /* =====================================================================
     1 · ARCADE AUDIO SYNTH  (no asset files, generated on demand)
     ===================================================================== */
  const Sfx = {
    ctx: null,
    _ctxOK() {
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === "suspended") this.ctx.resume();
        return true;
      } catch (e) { return false; }
    },
    _tone(freq, dur, type, vol, slideTo, delay) {
      const ctx = this.ctx, t0 = ctx.currentTime + (delay || 0);
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = type || "square";
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(vol || 0.14, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + dur);
    },
    play(name) {
      if (!this._ctxOK()) return;
      switch (name) {
        case "click":   this._tone(880, 0.045, "square", 0.11, 1250); break;
        case "flip":    this._tone(420, 0.09, "triangle", 0.16, 900); break;
        case "tick":    this._tone(1400, 0.03, "square", 0.09); break;
        case "reveal":  this._tone(300, 0.28, "triangle", 0.16, 1150); break;
        case "success":
          this._tone(523, 0.1, "triangle", 0.15, null, 0);
          this._tone(659, 0.1, "triangle", 0.15, null, 0.08);
          this._tone(784, 0.16, "triangle", 0.15, null, 0.16);
          break;
        case "start":
          this._tone(392, 0.08, "square", 0.13, null, 0);
          this._tone(523, 0.08, "square", 0.13, null, 0.07);
          this._tone(659, 0.08, "square", 0.13, null, 0.14);
          this._tone(880, 0.18, "square", 0.13, null, 0.21);
          break;
        case "buzz":    this._tone(180, 0.3, "sawtooth", 0.2, 90); break;
        case "chime":
          this._tone(1046, 0.13, "sine", 0.15, null, 0);
          this._tone(1318, 0.22, "sine", 0.15, null, 0.1);
          break;
        default: this._tone(700, 0.05);
      }
    }
  };

  /* =====================================================================
     2 · CONTENT
     ===================================================================== */
  const PROMPTS = [
    "Dancing cactus", "Astronaut riding a donkey", "Laser cat", "Exploding pizza",
    "Penguin in sunglasses", "Haunted toaster", "Dinosaur ballet", "Ninja at the dentist",
    "Robot walking a dog", "Grandma doing a backflip", "Unicorn stuck in traffic",
    "Pirate at a car wash", "Shark riding a bicycle", "Taco playing guitar",
    "Superhero missing the bus", "Vampire sunbathing", "Octopus knitting a sweater",
    "Snowman on holiday", "Bodybuilder hamster", "Wizard microwaving a burrito",
    "Cow on a trampoline", "Detective sloth", "Frog wearing a monocle",
    "Skeleton doing yoga", "Alien ordering coffee", "Bear in a hot tub",
    "Toddler CEO", "Giraffe in an elevator", "Chef juggling knives",
    "Turtle street racing", "Mermaid at the gym", "Bee driving a truck",
    "Squirrel bank robbery", "Panda proposing marriage", "Sumo wrestler ice skating",
    "Clown flying a kite", "Grandpa breakdancing", "Cat piloting a jet",
    "Sandwich on trial", "Ghost doing laundry", "Llama DJ set",
    "Zombie wedding cake", "Hedgehog barber", "Snail speeding ticket",
    "Yeti selling ice cream", "Pigeon lawyer", "Whale in a bathtub",
    "Werewolf at a hair salon", "Moose playing chess", "Crab lifting weights",
    "Nun on a skateboard", "Goldfish astronaut", "Raccoon food critic",
    "Dragon blowing out birthday candles", "Snowboarding penguin waiter",
    "Elephant in a phone booth", "Pug wearing a business suit",
    "Knight fighting a vending machine", "Flamingo doing karate",
    "Sloth winning a marathon"
  ];

  const PALETTE = [
    "#101010", "#5a5a5a", "#ffffff", "#ff2b4e", "#ff7a00", "#ffcc00",
    "#7ed321", "#00d68f", "#00b8d9", "#2a6bff", "#8b5cf6", "#ff5cc8"
  ];

  /* =====================================================================
     3 · STATE
     ===================================================================== */
  const S = {
    players: [],
    chains: [],         // [{ owner, steps:[{type:'prompt'|'draw'|'guess', author, value}] }]
    mode: "full",       // 'full' = one chain per player | 'quick' = single shared chain
    turnSeconds: 60,
    turn: 0,
    totalTurns: 0,
    laps: 0,
    viewChain: 0,
    sketch: null,
    timerId: null
  };

  /* =====================================================================
     4 · DOM HANDLES
     ===================================================================== */
  const $ = (id) => document.getElementById(id);

  const el = {
    hudBadge: $("hudBadge"), hudLabel: $("hudLabel"), hudTimer: $("hudTimer"),
    btnExit: $("btnExit"),

    modeRow: $("modeRow"), modeNote: $("modeNote"), timeRow: $("timeRow"),
    rosterForm: $("rosterForm"), rosterInput: $("rosterInput"),
    rosterList: $("rosterList"), rosterWarn: $("rosterWarn"),
    turnForecast: $("turnForecast"), btnStart: $("btnStart"),

    drawKicker: $("drawKicker"), drawPrompt: $("drawPrompt"),
    canvas: $("sketchCanvas"), swatchGrid: $("swatchGrid"),
    brushRange: $("brushRange"), brushPreview: $("brushPreview"),
    btnUndo: $("btnUndo"), btnRedo: $("btnRedo"), btnClear: $("btnClear"),
    btnDoneDraw: $("btnDoneDraw"),

    guessImg: $("guessImg"), guessField: $("guessField"), btnDoneGuess: $("btnDoneGuess"),

    chainPrev: $("chainPrev"), chainNext: $("chainNext"),
    chainCount: $("chainCount"), strip: $("strip"),
    btnExport: $("btnExport"), btnAgain: $("btnAgain"),
    exportCanvas: $("exportCanvas"),

    curtain: $("curtain"), curtainTag: $("curtainTag"),
    curtainName: $("curtainName"), btnUnlock: $("btnUnlock"), unlockTxt: $("unlockTxt")
  };

  /* =====================================================================
     5 · HELPERS
     ===================================================================== */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function goPhase(id) {
    const list = document.querySelectorAll(".phase");
    for (let i = 0; i < list.length; i++) list[i].classList.remove("is-active");
    const target = $(id);
    if (target) target.classList.add("is-active");
    window.scrollTo(0, 0);
  }
  function setHud(badge, label) {
    if (badge != null) el.hudBadge.textContent = badge;
    if (label != null) el.hudLabel.textContent = label;
  }
  function setTimerText(txt, danger) {
    el.hudTimer.textContent = txt;
    el.hudTimer.classList.toggle("is-danger", !!danger);
  }
  function stopTimer() {
    if (S.timerId) { clearInterval(S.timerId); S.timerId = null; }
  }
  function startTimer(seconds, onEnd) {
    stopTimer();
    if (!seconds) { setTimerText("FREE", false); return; }
    let left = seconds;
    setTimerText(left + "s", false);
    S.timerId = setInterval(function () {
      left--;
      const danger = left <= 5;
      setTimerText(Math.max(left, 0) + "s", danger);
      if (danger && left > 0) { Sfx.play("tick"); PD.vibrate([22]); }
      if (left <= 0) {
        stopTimer();
        Sfx.play("buzz");
        PD.vibrate([200, 70, 200]);
        onEnd();
      }
    }, 1000);
  }

  /* Inject every declarative [data-icon] placeholder. */
  (function injectIcons() {
    const nodes = document.querySelectorAll("[data-icon]");
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].innerHTML = icon(nodes[i].getAttribute("data-icon"));
    }
  })();

  /* =====================================================================
     6 · PRIVACY CURTAIN
     ===================================================================== */
  function showCurtain(name, tag, actionLabel, onReady) {
    el.curtainTag.textContent = tag;
    el.curtainName.textContent = "Pass to " + name;
    el.unlockTxt.textContent = actionLabel;
    el.curtain.classList.add("is-active");
    el.curtain.setAttribute("aria-hidden", "false");
    PD.vibrate([55]);

    el.btnUnlock.onclick = function () {
      el.curtain.classList.remove("is-active");
      el.curtain.setAttribute("aria-hidden", "true");
      Sfx.play("click");
      onReady();
    };
  }

  /* =====================================================================
     7 · SETUP PHASE
     ===================================================================== */
  let roster = PD.getPlayers().slice(0, 10);

  function forecast() {
    const n = roster.length;
    if (n < 3) { el.turnForecast.textContent = ""; return; }
    const chains = S.mode === "quick" ? 1 : n;
    const laps = S.mode === "quick" ? 1 : Math.min(n, 6);
    el.turnForecast.textContent =
      chains + (chains === 1 ? " chain" : " chains") + " · " + (laps * n) + " total turns";
  }

  function drawRoster() {
    let html = "";
    for (let i = 0; i < roster.length; i++) {
      html += '<li class="roster-item">' +
        '<span class="seat">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="nm">' + esc(roster[i]) + "</span>" +
        '<button type="button" data-i="' + i + '" aria-label="Remove ' + esc(roster[i]) + '">' +
        icon("close") + "</button></li>";
    }
    el.rosterList.innerHTML = html;
    PD.setPlayers(roster);
    forecast();
  }

  el.rosterForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = el.rosterInput.value.trim();
    if (!name) return;
    if (roster.length >= 10) {
      el.rosterWarn.textContent = "Maximum 10 players.";
      el.rosterWarn.classList.remove("is-hidden");
      Sfx.play("buzz");
      return;
    }
    if (roster.indexOf(name) !== -1) {
      el.rosterWarn.textContent = "That name is already in the list.";
      el.rosterWarn.classList.remove("is-hidden");
      Sfx.play("buzz");
      return;
    }
    roster.push(name);
    el.rosterInput.value = "";
    el.rosterWarn.classList.add("is-hidden");
    Sfx.play("click");
    drawRoster();
  });

  el.rosterList.addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-i]");
    if (!btn) return;
    roster.splice(parseInt(btn.getAttribute("data-i"), 10), 1);
    Sfx.play("click");
    drawRoster();
  });

  el.modeRow.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-mode]");
    if (!btn) return;
    const chips = el.modeRow.querySelectorAll(".chip");
    for (let i = 0; i < chips.length; i++) chips[i].classList.remove("is-on");
    btn.classList.add("is-on");
    S.mode = btn.getAttribute("data-mode");
    el.modeNote.textContent = S.mode === "quick"
      ? "One prompt travels the whole table. Fast — great for big groups."
      : "Longest and funniest. Turn count scales with the group.";
    Sfx.play("click");
    forecast();
  });

  el.timeRow.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-time]");
    if (!btn) return;
    const chips = el.timeRow.querySelectorAll(".chip");
    for (let i = 0; i < chips.length; i++) chips[i].classList.remove("is-on");
    btn.classList.add("is-on");
    S.turnSeconds = parseInt(btn.getAttribute("data-time"), 10);
    Sfx.play("click");
  });

  el.btnStart.addEventListener("click", function () {
    if (roster.length < 3) {
      el.rosterWarn.textContent = "Add at least 3 players to launch.";
      el.rosterWarn.classList.remove("is-hidden");
      Sfx.play("buzz");
      return;
    }
    startGame();
  });

  drawRoster();

  /* =====================================================================
     8 · TOOLBAR
     ===================================================================== */
  S.sketch = new SketchCanvas(el.canvas, { maxHistory: 14 });
  S.sketch.onHistoryChange = function (state) {
    el.btnUndo.disabled = !state.canUndo;
    el.btnRedo.disabled = !state.canRedo;
  };

  (function buildSwatches() {
    let html = "";
    for (let i = 0; i < PALETTE.length; i++) {
      html += '<button type="button" class="swatch' + (i === 0 ? " is-on" : "") +
        '" style="background:' + PALETTE[i] + '" data-hex="' + PALETTE[i] +
        '" aria-label="Colour ' + PALETTE[i] + '"></button>';
    }
    el.swatchGrid.innerHTML = html;
  })();

  el.swatchGrid.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-hex]");
    if (!btn) return;
    const all = el.swatchGrid.querySelectorAll(".swatch");
    for (let i = 0; i < all.length; i++) all[i].classList.remove("is-on");
    btn.classList.add("is-on");
    const hex = btn.getAttribute("data-hex");
    S.sketch.setColor(hex);
    el.brushPreview.style.background = hex;
    Sfx.play("click");
  });

  function syncBrush() {
    const v = parseInt(el.brushRange.value, 10);
    S.sketch.setSize(v);
    const d = Math.max(9, Math.min(26, v + 3));
    el.brushPreview.style.width = d + "px";
    el.brushPreview.style.height = d + "px";
  }
  el.brushRange.addEventListener("input", syncBrush);
  syncBrush();

  el.btnUndo.addEventListener("click", function () { Sfx.play("click"); S.sketch.undo(); });
  el.btnRedo.addEventListener("click", function () { Sfx.play("click"); S.sketch.redo(); });
  el.btnClear.addEventListener("click", function () { Sfx.play("buzz"); S.sketch.clear(); });

  /* =====================================================================
     9 · TURN STATE MACHINE
     ===================================================================== */
  function startGame() {
    S.players = roster.slice();
    const n = S.players.length;

    const chainCount = S.mode === "quick" ? 1 : n;
    S.laps = S.mode === "quick" ? 1 : Math.min(n, 6);
    S.totalTurns = S.laps * n;

    const seeds = shuffle(PROMPTS).slice(0, chainCount);
    S.chains = [];
    for (let i = 0; i < chainCount; i++) {
      const owner = S.mode === "quick" ? S.players[0] : S.players[i];
      S.chains.push({
        owner: owner,
        steps: [{ type: "prompt", author: owner, value: seeds[i] }]
      });
    }

    S.turn = 0;
    S.viewChain = 0;
    Sfx.play("start");
    PD.vibrate([90, 40, 90]);
    nextTurn();
  }

  /** Resolve which chain the current holder works on. See header comment. */
  function chainForTurn(t) {
    const n = S.players.length;
    const C = S.chains.length;
    if (C === 1) return 0;
    const seat = t % n;
    const lap = Math.floor(t / n);
    return ((seat - lap) % C + C) % C;
  }

  function nextTurn() {
    stopTimer();
    setTimerText("--", false);

    if (S.turn >= S.totalTurns) { finale(); return; }

    const seat = S.turn % S.players.length;
    const who = S.players[seat];
    const lap = Math.floor(S.turn / S.players.length) + 1;

    showCurtain(who, "ROUND " + lap + " OF " + S.laps, "I am " + who, function () {
      runTurn(seat, who);
    });
  }

  function runTurn(seat, who) {
    const chain = S.chains[chainForTurn(S.turn)];
    const last = chain.steps[chain.steps.length - 1];

    setHud("TURN " + (S.turn + 1) + " / " + S.totalTurns, who);

    if (last.type === "draw") {
      /* ---------------- GUESS TURN ---------------- */
      goPhase("phGuess");
      el.guessImg.src = last.value;
      el.guessField.value = "";
      setTimeout(function () { el.guessField.focus(); }, 160);

      const commit = function () {
        stopTimer();
        el.btnDoneGuess.onclick = null;
        el.guessField.onkeydown = null;
        chain.steps.push({
          type: "guess",
          author: who,
          value: el.guessField.value.trim() || "(no guess)"
        });
        Sfx.play("success");
        S.turn++;
        nextTurn();
      };

      el.btnDoneGuess.onclick = commit;
      el.guessField.onkeydown = function (e) { if (e.key === "Enter") commit(); };
      startTimer(S.turnSeconds, commit);

    } else {
      /* ---------------- DRAW TURN ---------------- */
      goPhase("phDraw");
      el.drawKicker.textContent = last.type === "prompt"
        ? "Your secret prompt"
        : "Draw this guess from " + last.author;
      el.drawPrompt.textContent = last.value;

      // The phase is now visible, so the canvas can finally be measured.
      requestAnimationFrame(function () { S.sketch.reset(); });

      const commit = function () {
        stopTimer();
        el.btnDoneDraw.onclick = null;
        chain.steps.push({ type: "draw", author: who, value: S.sketch.toDataURL() });
        Sfx.play("success");
        S.turn++;
        nextTurn();
      };

      el.btnDoneDraw.onclick = commit;
      startTimer(S.turnSeconds, commit);
    }
  }

  /* =====================================================================
     10 · FINALE — comic strip slideshow
     ===================================================================== */
  function finale() {
    stopTimer();
    setHud("COMPLETE", "All chains resolved");
    setTimerText("DONE", false);
    Sfx.play("success");
    S.viewChain = 0;
    goPhase("phFinale");
    renderStrip();
  }

  function renderStrip() {
    const chain = S.chains[S.viewChain];
    el.chainCount.textContent = (S.viewChain + 1) + " / " + S.chains.length;

    let html = "";
    for (let i = 0; i < chain.steps.length; i++) {
      const s = chain.steps[i];
      const kind = s.type === "prompt" ? "Original seed" : (s.type === "draw" ? "Sketch" : "Guess");
      const body = s.type === "draw"
        ? '<img class="strip-img" src="' + s.value + '" alt="Sketch by ' + esc(s.author) + '" />'
        : '<div class="strip-text">&ldquo;' + esc(s.value) + '&rdquo;</div>';

      html += '<div class="strip-row' + (s.type === "prompt" ? " is-seed" : "") +
        '" style="animation-delay:' + (i * 70) + 'ms">' +
        '<div class="strip-meta">' +
          '<div class="strip-author">' + esc(s.author) + "</div>" +
          '<div class="strip-kind">' + kind + "</div>" +
        "</div>" + body + "</div>";
    }
    el.strip.innerHTML = html;
    el.strip.scrollTop = 0;
  }

  el.chainPrev.addEventListener("click", function () {
    S.viewChain = (S.viewChain - 1 + S.chains.length) % S.chains.length;
    Sfx.play("flip");
    renderStrip();
  });
  el.chainNext.addEventListener("click", function () {
    S.viewChain = (S.viewChain + 1) % S.chains.length;
    Sfx.play("flip");
    renderStrip();
  });

  /* =====================================================================
     11 · PNG EXPORT — renders the active chain as a shareable comic strip
     ===================================================================== */
  function loadImage(src) {
    return new Promise(function (resolve) {
      const img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }
  function clipText(ctx, text, maxW) {
    let t = text;
    while (ctx.measureText(t).width > maxW && t.length > 4) t = t.slice(0, -2);
    return t === text ? t : t + "\u2026";
  }

  el.btnExport.addEventListener("click", async function () {
    Sfx.play("chime");

    const chain = S.chains[S.viewChain];
    const W = 900, PAD = 26, HEADER = 104;
    const ROW_IMG = 300, ROW_TXT = 104;

    let H = HEADER + PAD;
    for (let i = 0; i < chain.steps.length; i++) {
      H += (chain.steps[i].type === "draw" ? ROW_IMG : ROW_TXT) + PAD;
    }

    const cv = el.exportCanvas;
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");

    // Background + title block
    g.fillStyle = "#08090c";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#00ffcc";
    g.font = "900 38px 'Space Grotesk', Helvetica, Arial, sans-serif";
    g.fillText("TELE-SKETCH", PAD, 52);
    g.fillStyle = "#8b9bb4";
    g.font = "700 16px 'Space Mono', Courier, monospace";
    g.fillText("CHAIN OF " + chain.owner.toUpperCase() + "  \u00B7  PARTYDECK", PAD, 80);
    g.strokeStyle = "rgba(0,255,204,.3)";
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(PAD, 92); g.lineTo(W - PAD, 92); g.stroke();

    let y = HEADER;
    for (let i = 0; i < chain.steps.length; i++) {
      const s = chain.steps[i];
      const h = s.type === "draw" ? ROW_IMG : ROW_TXT;

      g.fillStyle = "#10141b";
      g.fillRect(PAD, y, W - PAD * 2, h);
      g.strokeStyle = s.type === "prompt" ? "#00ffcc" : "rgba(255,255,255,.08)";
      g.lineWidth = s.type === "prompt" ? 2 : 1;
      g.strokeRect(PAD, y, W - PAD * 2, h);

      g.fillStyle = "#00ffcc";
      g.font = "700 14px 'Space Mono', Courier, monospace";
      g.fillText(s.author.toUpperCase() + "  \u00B7  " +
        (s.type === "prompt" ? "SEED" : s.type === "draw" ? "SKETCH" : "GUESS"),
        PAD + 18, y + 28);

      if (s.type === "draw") {
        const img = await loadImage(s.value);
        const side = h - 58;
        g.fillStyle = "#ffffff";
        g.fillRect(PAD + 18, y + 40, side, side);
        if (img) g.drawImage(img, PAD + 18, y + 40, side, side);
      } else {
        g.fillStyle = "#ffffff";
        g.font = "700 28px 'Space Grotesk', Helvetica, Arial, sans-serif";
        g.fillText(clipText(g, '"' + s.value + '"', W - PAD * 2 - 36), PAD + 18, y + 76);
      }
      y += h + PAD;
    }

    const link = document.createElement("a");
    link.download = "telesketch-" + chain.owner.replace(/\s+/g, "-").toLowerCase() + ".png";
    link.href = cv.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  /* =====================================================================
     12 · NAVIGATION
     ===================================================================== */
  el.btnAgain.addEventListener("click", function () {
    stopTimer();
    setHud("SETUP // PHASE", "Roster");
    setTimerText("--", false);
    Sfx.play("click");
    goPhase("phSetup");
  });

  el.btnExit.addEventListener("click", function () {
    stopTimer();
    PD.exitToHub();
  });

  document.addEventListener("gesturestart", function (e) { e.preventDefault(); });

})();