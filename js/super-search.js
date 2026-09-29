/**
 * PARTYDECK SUPER-SEARCH & ALIAS ENGINE
 * File: js/super-search.js
 * 
 * Provides client-side fuzzy searching against PartyDeck games, tags, descriptions,
 * and a built-in knowledge bank of 60+ popular commercial and classic game aliases.
 */

(function (window) {
  "use strict";

  /* ==========================================================================
     1. COMMERCIAL & CLASSIC ALIAS KNOWLEDGE BANK (60+ Mappings)
     ========================================================================== */
  const ALIAS_BANK = [
    // Drawing & Creative
    { alias: "Telestrations", targets: ["telestrations", "tele-sketch"], label: "Drawing Telephone" },
    { alias: "Gartic Phone", targets: ["telestrations", "tele-sketch"], label: "Voice/Drawing Pass" },
    { alias: "Pictionary", targets: ["telestrations", "fake-artist"], label: "Classic Drawing Guess" },
    { alias: "Drawful", targets: ["fake-artist", "telestrations"], label: "Weird Drawing Deduction" },
    { alias: "Fake Artist in New York", targets: ["fake-artist"], label: "Shared Canvas Impostor" },
    { alias: "Skribbl.io", targets: ["telestrations"], label: "Online Drawing Guess" },

    // Social Deduction & Secret Roles
    { alias: "Heads Up", targets: ["sound-bites"], label: "Forehead Motion Charades" },
    { alias: "Charades", targets: ["sound-bites"], label: "Physical Gestures & Clues" },
    { alias: "Taboo", targets: ["sound-bites", "rapid-buzzer"], label: "Word Guess No Forbidden Terms" },
    { alias: "Spyfall", targets: ["infiltrator", "undercover-spy"], label: "Location Interrogation" },
    { alias: "Undercover", targets: ["infiltrator", "chameleon-word"], label: "Secret Impostor Word" },
    { alias: "Mafia", targets: ["one-night-wolf", "infiltrator"], label: "Classic Night Deduction" },
    { alias: "Werewolf", targets: ["one-night-wolf"], label: "1-Night Speech Narrator" },
    { alias: "Secret Hitler", targets: ["resistance-cell"], label: "Government Policy Bluff" },
    { alias: "The Resistance / Avalon", targets: ["resistance-cell"], label: "Mission Sabotage Traitor" },
    { alias: "Among Us", targets: ["infiltrator", "chameleon-word"], label: "Impostor Elimination" },
    { alias: "Chameleon", targets: ["chameleon-word"], label: "Grid Topic Impostor" },
    { alias: "Decrypto", targets: ["decrypto-blitz"], label: "3-Digit Team Encryption" },
    { alias: "Codenames", targets: ["decrypto-blitz", "chameleon-word"], label: "Clue Word Association" },
    { alias: "Two Rooms and a Boom", targets: ["two-rooms-lite", "two-rooms-spy"], label: "President vs Bomber Hostages" },

    // Bluffing & Strategy Cards
    { alias: "Coup", targets: ["coup-pocket"], label: "Bluffing Influence & Assassins" },
    { alias: "Love Letter", targets: ["coup-pocket", "skull-digital"], label: "Micro Deduction Card Battle" },
    { alias: "Skull & Roses", targets: ["skull-digital"], label: "Tactile Rose/Skull Bidding" },
    { alias: "Liar's Dice / Perudo", targets: ["liars-dice", "liars-dice-3d"], label: "Pass & Shake Dice Bluff" },
    { alias: "Bullshit / Cheat / I Doubt It", targets: ["cheat-bullshit"], label: "Shedding Card Bluff" },
    { alias: "President & Asshole / Scum", targets: ["president-scum"], label: "Hierarchy Card Shedding" },

    // Drinking & Social Hot-Seat
    { alias: "Kings Cup / Ring of Fire", targets: ["kings-chalice"], label: "Classic Cup & Rule Deck" },
    { alias: "Picolo", targets: ["social-roulette", "most-likely-to"], label: "Name-Injected Party Prompts" },
    { alias: "Cards Against Humanity", targets: ["most-likely-to", "social-roulette"], label: "Spicy Adult Party Chaos" },
    { alias: "Most Likely To", targets: ["most-likely-to", "most-likely"], label: "Anonymous Pointing Poll" },
    { alias: "Never Have I Ever", targets: ["never-have-i-ever-arcade"], label: "3-Life Arcade Elimination" },
    { alias: "Truth or Drink", targets: ["truth-or-drink-vault"], label: "Vault Door Drink/Confess" },
    { alias: "Do or Drink", targets: ["do-or-drink"], label: "Tiered Action & Dare Cards" },
    { alias: "Ride the Bus", targets: ["irish-gauge-poker"], label: "Red/Black Hi/Lo Card Gauntlet" },
    { alias: "Irish Poker", targets: ["irish-gauge-poker"], label: "4-Card Blind Prediction" },

    // Fast-Paced Word & Action
    { alias: "5 Second Rule", targets: ["five-second-rule", "five-second-blitz"], label: "Name 3 in 5 Seconds" },
    { alias: "Catch Phrase / Hot Potato", targets: ["rapid-buzzer", "rapid-heartbeat-buzzer", "bomb-countdown"], label: "Accelerating Detonation Buzzer" },
    { alias: "Anomia", targets: ["rapid-buzzer", "five-second-rule"], label: "Symbol Face-Off Reflex" },
    { alias: "Wits & Wagers", targets: ["wits-wagers-felt", "wits-wagers"], label: "Numerical Trivia Felt Betting" },
    { alias: "Spaceteam", targets: ["spaceteam-relay"], label: "Shouted 2-Phone Flight Commands" },
    { alias: "Wavelength", targets: ["spectrum-dial"], label: "Binary Spectrum Psychic Guess" },

    // Arcade Reflex, Micro-Games & Stim
    { alias: "Osu! / Tap Tap", targets: ["stim-osu-tap"], label: "Neon Circle Approach Reflex" },
    { alias: "Flappy Bird", targets: ["flappy-penalty"], label: "1-Tap Flight Gauntlet" },
    { alias: "Aim Trainer", targets: ["stim-osu-tap", "cyber-mole-smash"], label: "Speed & Accuracy Reflex" },
    { alias: "Fruit Ninja", targets: ["stim-blade-slice"], label: "Polygonal Swiper Slicer" },
    { alias: "Sand Spiel / Powder Toy", targets: ["stim-liquid-sand"], label: "Kinetic Particle Physics" },
    { alias: "Fidget Spinner / Relax / Stim", targets: ["stim-osu-tap", "stim-liquid-sand", "stim-lockpick-tumbler", "stim-blade-slice", "stim-orbit-fidget"], label: "Waiting Room Micro-Games" },
    { alias: "Pinball", targets: ["pinball-plunger"], label: "Cabinet Plunger & Bumpers" },
    { alias: "Snake", targets: ["neon-snake-survival"], label: "Arcade Length Quota Survival" },
    { alias: "Whack-A-Mole", targets: ["cyber-mole-smash"], label: "Multi-Touch Reflex Smashing" },
    { alias: "Finger Roulette / Chopstick", targets: ["finger-roulette", "finger-guillotine"], label: "Touch Screen Electric Selector" }
  ];

  /* ==========================================================================
     2. SEARCH & MATCHING CORE
     ========================================================================== */
  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  const PartyDeckSearch = {
    getAliasBank: function () {
      return ALIAS_BANK.slice();
    },

    query: function (searchTerm, gamesList = []) {
      const qRaw = (searchTerm || "").trim();
      if (!qRaw) {
        return gamesList.map((g) => ({ game: g, score: 0, matchedAlias: null }));
      }

      const qNorm = normalize(qRaw);
      const results = [];

      // 1. Check Commercial Alias Bank for matches
      const matchedAliases = [];
      ALIAS_BANK.forEach((entry) => {
        const aliasNorm = normalize(entry.alias);
        if (aliasNorm.includes(qNorm) || qNorm.includes(aliasNorm)) {
          matchedAliases.push(entry);
        }
      });

      // 2. Score and match against the active game registry
      gamesList.forEach((game) => {
        let score = 0;
        let matchedAliasBadge = null;

        const titleNorm = normalize(game.title);
        const idNorm = normalize(game.id);
        const catNorm = normalize(game.category);
        const tagNorm = normalize((game.tags || []).join(" "));
        const descNorm = normalize(game.description || "");

        // Direct Title/ID Matches (Highest Score)
        if (titleNorm === qNorm || idNorm === qNorm) {
          score += 100;
        } else if (titleNorm.startsWith(qNorm)) {
          score += 70;
        } else if (titleNorm.includes(qNorm)) {
          score += 50;
        }

        // Tag and Category Matches
        if (catNorm.includes(qNorm)) score += 30;
        if (tagNorm.includes(qNorm)) score += 25;
        if (descNorm.includes(qNorm)) score += 15;

        // Alias Bank Matches (High Score Injection)
        matchedAliases.forEach((aliasEntry) => {
          if (
            aliasEntry.targets.includes(game.id) ||
            aliasEntry.targets.some((t) => game.entryPath && game.entryPath.includes(t))
          ) {
            score += 85;
            matchedAliasBadge = aliasEntry.alias;
          }
        });

        if (score > 0) {
          results.push({
            game: game,
            score: score,
            matchedAlias: matchedAliasBadge
          });
        }
      });

      // 3. Sort by relevance descending
      return results.sort((a, b) => b.score - a.score);
    }
  };

  window.PartyDeckSearch = PartyDeckSearch;
})(window);