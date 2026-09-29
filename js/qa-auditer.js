/**
 * PARTYDECK IN-GAME QA AUDIT & ERROR COMPILER
 * File: js/qa-auditor.js
 * 
 * Zero-framework, zero-backend persistent bug reporter and error trap.
 */
(function (window, document) {
  "use strict";

  const STORAGE_KEY = "partydeck_qa_audit_log";

  /* ==========================================================================
     1. RUNTIME ERROR & CONSOLE INTERCEPTOR
     ========================================================================== */
  const sessionErrors = [];

  function recordError(type, message, source, lineno, colno, stack) {
    const errObj = {
      timestamp: new Date().toLocaleTimeString(),
      type: type || "Error",
      message: message || "Unknown runtime exception",
      location: source ? `${source}:${lineno || 0}:${colno || 0}` : "Unknown location",
      stack: stack || (new Error().stack || "No stack trace available")
    };
    sessionErrors.push(errObj);
    updatePillBadge();
  }

  window.addEventListener("error", function (e) {
    recordError("Runtime Error", e.message, e.filename, e.lineno, e.colno, e.error ? e.error.stack : "");
  });

  window.addEventListener("unhandledrejection", function (e) {
    const reason = e.reason;
    recordError(
      "Unhandled Promise Rejection",
      reason ? (reason.message || String(reason)) : "Promise rejected",
      "", 0, 0,
      reason && reason.stack ? reason.stack : ""
    );
  });

  const originalConsoleError = console.error;
  console.error = function (...args) {
    originalConsoleError.apply(console, args);
    const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
    recordError("console.error", msg, "", 0, 0, new Error().stack);
  };

  /* ==========================================================================
     2. AUDIT STORE MANAGEMENT (localStorage)
     ========================================================================== */
  function getAuditLog() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAuditLog(log) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    } catch (e) {}
  }

  function detectCurrentGameId() {
    const path = window.location.pathname;
    const match = path.match(/\/games\/([^/]+)\//);
    if (match) return match[1];
    if (path.endsWith("index.html") || path === "/" || path === "") return "hub-root";
    return path.split("/").filter(Boolean).pop() || "unknown-module";
  }

  /* ==========================================================================
     3. STYLES (Cyber Arcade QA Theme)
     ========================================================================== */
  const styles = `
    #pd-qa-fab {
      position: fixed;
      bottom: max(16px, env(safe-area-inset-bottom));
      right: 16px;
      z-index: 999999;
      background: #11141c;
      border: 1.5px solid #ff0055;
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 999px;
      font-family: 'Space Mono', monospace, sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255, 0, 85, 0.4), 0 0 10px rgba(0,0,0,0.8);
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }
    #pd-qa-fab.has-errors {
      background: #ff0055;
      color: #fff;
      animation: pd-qa-pulse 1.2s infinite;
    }
    @keyframes pd-qa-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,0,85, 0.7); }
      50% { box-shadow: 0 0 0 10px rgba(255,0,85, 0); }
    }
    .pd-qa-count {
      background: rgba(255,255,255,0.25);
      padding: 1px 6px;
      border-radius: 8px;
      font-size: 10px;
    }
    #pd-qa-modal {
      position: fixed;
      inset: 0;
      z-index: 1000000;
      background: rgba(5, 7, 10, 0.92);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      color: #f0f4f8;
    }
    #pd-qa-modal.is-open { display: flex; }
    .pd-qa-card {
      background: #12161f;
      border: 1.5px solid rgba(56, 189, 248, 0.3);
      border-radius: 16px;
      width: 100%;
      max-width: 580px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 50px rgba(0,0,0,0.9);
      overflow: hidden;
    }
    .pd-qa-header {
      padding: 14px 18px;
      background: #181f2c;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pd-qa-title {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 900;
      font-size: 16px;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pd-qa-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
      line-height: 1;
      padding: 4px 8px;
    }
    .pd-qa-body {
      padding: 16px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .pd-qa-section-title {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .pd-qa-tags {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .pd-qa-tag-label {
      background: #1a2230;
      border: 1px solid rgba(255,255,255,0.08);
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .pd-qa-tag-label input { cursor: pointer; accent-color: #ff0055; }
    .pd-qa-textarea {
      width: 100%;
      min-height: 90px;
      background: #090c12;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 8px;
      color: #fff;
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      padding: 10px;
      box-sizing: border-box;
      outline: none;
      resize: vertical;
    }
    .pd-qa-textarea:focus { border-color: #38bdf8; }
    .pd-qa-console-box {
      background: #06080c;
      border: 1px solid rgba(255,0,85,0.3);
      border-radius: 8px;
      padding: 10px;
      max-height: 120px;
      overflow-y: auto;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      color: #ff557f;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .pd-qa-footer {
      padding: 12px 16px;
      background: #181f2c;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: space-between;
    }
    .pd-qa-btn {
      padding: 10px 14px;
      border-radius: 8px;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .pd-qa-btn-primary { background: #ff0055; color: #fff; }
    .pd-qa-btn-sec { background: #38bdf8; color: #04121a; }
    .pd-qa-btn-ghost { background: #242f42; color: #cbd5e1; }
    .pd-qa-btn-danger { background: rgba(255,0,85,0.15); color: #ff557f; border: 1px solid #ff0055; }
    .pd-qa-badge-game {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      color: #00ffaa;
      background: rgba(0, 255, 170, 0.1);
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(0, 255, 170, 0.25);
    }
  `;

  /* ==========================================================================
     4. INJECT UI INTO DOM
     ========================================================================== */
  function injectUI() {
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // FAB Button
    const fab = document.createElement("button");
    fab.id = "pd-qa-fab";
    fab.type = "button";
    fab.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/>
      </svg>
      <span>QA Logger</span>
      <span class="pd-qa-count" id="pd-qa-badge">0</span>
    `;
    document.body.appendChild(fab);

    // Modal Sheet
    const modal = document.createElement("div");
    modal.id = "pd-qa-modal";
    modal.innerHTML = `
      <div class="pd-qa-card">
        <div class="pd-qa-header">
          <div class="pd-qa-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
            PartyDeck Game Bug Auditor
          </div>
          <button type="button" class="pd-qa-close" id="pd-qa-btn-close">&times;</button>
        </div>

        <div class="pd-qa-body">
          <div>
            <div class="pd-qa-section-title">Inspected Module</div>
            <span class="pd-qa-badge-game" id="pd-qa-current-game">Detecting...</span>
          </div>

          <div>
            <div class="pd-qa-section-title">Common Flaw Categories</div>
            <div class="pd-qa-tags">
              <label class="pd-qa-tag-label"><input type="checkbox" value="Unclickable/Cut-Off Buttons (100vh)" class="pd-qa-tag-cb"> Button/Layout Cut Off</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="Half-Screen/Blurry Canvas DPR" class="pd-qa-tag-cb"> Tiny/Blurry Canvas</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="Silent/Audio Synthesizer Dead" class="pd-qa-tag-cb"> No Audio / Silent</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="Touch/Orientation Not Responding" class="pd-qa-tag-cb"> Controls Frozen</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="State Machine/Loop Stuck" class="pd-qa-tag-cb"> Game Won't Progress</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="Visual/Theme Desync Glitch" class="pd-qa-tag-cb"> Visual Glitch</label>
            </div>
          </div>

          <div>
            <div class="pd-qa-section-title">Observations / Notes (What went wrong?)</div>
            <textarea class="pd-qa-textarea" id="pd-qa-notes" placeholder="e.g. When tapping 'Start Game' on iOS Safari, the canvas stays black and no dice shake..."></textarea>
          </div>

          <div>
            <div class="pd-qa-section-title">Captured Console / JS Crash Logs (<span id="pd-qa-err-count">0</span>)</div>
            <div class="pd-qa-console-box" id="pd-qa-err-box">No JS runtime exceptions detected in this session.</div>
          </div>
        </div>

        <div class="pd-qa-footer">
          <button type="button" class="pd-qa-btn pd-qa-btn-primary" id="pd-qa-btn-save">
            Flag &amp; Save Game
          </button>
          <button type="button" class="pd-qa-btn pd-qa-btn-sec" id="pd-qa-btn-export">
            Download Audit Report (.MD)
          </button>
          <button type="button" class="pd-qa-btn pd-qa-btn-danger" id="pd-qa-btn-clear" title="Clear all saved reports">
            Clear Log
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    bindEvents();
    updatePillBadge();
  }

  function updatePillBadge() {
    const badge = document.getElementById("pd-qa-badge");
    const fab = document.getElementById("pd-qa-fab");
    const allLogs = getAuditLog();
    const count = allLogs.length;

    if (badge) badge.textContent = `${count} Flagged`;
    if (fab) {
      if (sessionErrors.length > 0) {
        fab.classList.add("has-errors");
      } else {
        fab.classList.remove("has-errors");
      }
    }
  }

  function bindEvents() {
    const fab = document.getElementById("pd-qa-fab");
    const modal = document.getElementById("pd-qa-modal");
    const btnClose = document.getElementById("pd-qa-btn-close");
    const btnSave = document.getElementById("pd-qa-btn-save");
    const btnExport = document.getElementById("pd-qa-btn-export");
    const btnClear = document.getElementById("pd-qa-btn-clear");
    const currentGameEl = document.getElementById("pd-qa-current-game");
    const errBox = document.getElementById("pd-qa-err-box");
    const errCount = document.getElementById("pd-qa-err-count");
    const notesInput = document.getElementById("pd-qa-notes");

    fab.addEventListener("click", () => {
      const gameId = detectCurrentGameId();
      currentGameEl.textContent = `${gameId} (${window.location.pathname})`;
      
      // Render caught errors
      errCount.textContent = sessionErrors.length;
      if (sessionErrors.length > 0) {
        errBox.textContent = sessionErrors.map(e => `[${e.timestamp}] ${e.type}: ${e.message}\n  At: ${e.location}\n  Stack: ${e.stack}`).join("\n\n");
      } else {
        errBox.textContent = "No JS runtime exceptions detected in this session.";
      }

      // Check if this game is already logged
      const existing = getAuditLog().find(item => item.gameId === gameId);
      if (existing) {
        notesInput.value = existing.userNotes || "";
        document.querySelectorAll(".pd-qa-tag-cb").forEach(cb => {
          cb.checked = (existing.categories || []).includes(cb.value);
        });
      }

      modal.classList.add("is-open");
    });

    btnClose.addEventListener("click", () => modal.classList.remove("is-open"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("is-open");
    });

    // Save Flag
    btnSave.addEventListener("click", () => {
      const gameId = detectCurrentGameId();
      const selectedTags = Array.from(document.querySelectorAll(".pd-qa-tag-cb:checked")).map(cb => cb.value);
      const notes = notesInput.value.trim();

      const reportEntry = {
        gameId: gameId,
        path: window.location.pathname,
        url: window.location.href,
        date: new Date().toISOString(),
        diagnostics: {
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          dpr: window.devicePixelRatio || 1,
          userAgent: navigator.userAgent,
          theme: document.documentElement.getAttribute("data-theme") || "default"
        },
        categories: selectedTags,
        userNotes: notes || "No manual notes provided.",
        runtimeErrors: [...sessionErrors]
      };

      let currentLogs = getAuditLog();
      // Remove previous entry for this game if updating
      currentLogs = currentLogs.filter(l => l.gameId !== gameId);
      currentLogs.push(reportEntry);
      saveAuditLog(currentLogs);

      alert(`✅ Flagged "${gameId}" saved to audit suite! Total flagged: ${currentLogs.length}`);
      updatePillBadge();
      modal.classList.remove("is-open");
    });

    // Export Markdown Document
    btnExport.addEventListener("click", () => {
      const logs = getAuditLog();
      if (logs.length === 0) {
        alert("No games flagged yet! Play games and flag issues first.");
        return;
      }
      exportReportMarkdown(logs);
    });

    // Clear Log
    btnClear.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all flagged audit records?")) {
        localStorage.removeItem(STORAGE_KEY);
        sessionErrors.length = 0;
        updatePillBadge();
        notesInput.value = "";
        document.querySelectorAll(".pd-qa-tag-cb").forEach(cb => cb.checked = false);
        alert("Audit log wiped clean.");
      }
    });
  }

  /* ==========================================================================
     5. MARKDOWN REPORT GENERATOR & DOWNLOADER
     ========================================================================== */
  function exportReportMarkdown(logs) {
    let md = `# 🛠️ PARTYDECK COMPREHENSIVE QA AUDIT & FIX REPORT\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n`;
    md += `**Total Flagged Modules:** ${logs.length}\n\n`;
    md += `---\n\n`;
    md += `## 📋 MASTER TASK FOR AI (VS CODE AGENT / CLAUDE / GEMINI)\n`;
    md += `Please review the following compiled list of broken, unplayable, or glitching PartyDeck games.\n`;
    md += `For every game listed below, inspect its file path, resolve the reported user feedback and caught JavaScript runtime errors, and provide 100% complete, working replacements adhering to:\n`;
    md += `1. Full \`100dvh\` mobile viewport with scrollable touch containers.\n`;
    md += `2. DPR-scaled canvas rendering (up to 2.5 DPR).\n`;
    md += `3. Zero raw emojis (100% SVG inline markup).\n`;
    md += `4. Web Audio API synthesis for all sounds.\n\n`;
    md += `---\n\n`;

    logs.forEach((item, index) => {
      md += `### ${index + 1}. \`games/${item.gameId}/index.html\`\n`;
      md += `- **Module ID:** \`${item.gameId}\`\n`;
      md += `- **Path:** \`${item.path}\`\n`;
      md += `- **Environment:** Viewport ${item.diagnostics.viewport} | DPR ${item.diagnostics.dpr} | Theme \`${item.diagnostics.theme}\`\n`;
      md += `- **Flagged Flaw Categories:** ${item.categories.length > 0 ? item.categories.join(", ") : "General Bug"}\n`;
      md += `- **User Observations / Problem Description:**\n  > ${item.userNotes.replace(/\n/g, "\n  > ")}\n\n`;

      if (item.runtimeErrors && item.runtimeErrors.length > 0) {
        md += `- **Captured Runtime JS Exceptions (${item.runtimeErrors.length}):**\n\`\`\`text\n`;
        item.runtimeErrors.forEach(err => {
          md += `[${err.timestamp}] ${err.type}: ${err.message}\nLocation: ${err.location}\nStack:\n${err.stack}\n---\n`;
        });
        md += `\`\`\`\n\n`;
      } else {
        md += `- **Runtime Errors:** Zero console crashes captured (Issue is primarily visual/UI/logical).\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PARTYDECK_BUG_AUDIT_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* Boot on DOM load */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectUI);
  } else {
    injectUI();
  }
})(window, document);