/**
 * PARTYDECK IN-GAME QA AUDIT & ERROR COMPILER (Bulletproof Mounting)
 * File: js/qa-auditor.js
 */
(function (window, document) {
  "use strict";

  console.log("🐞 [PartyDeck QA Auditor] Initializing...");

  const STORAGE_KEY = "partydeck_qa_audit_log";
  const sessionErrors = [];

  /* Error trapping */
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

  const styles = `
    #pd-qa-fab {
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      background: #11141c !important;
      border: 2px solid #ff0055 !important;
      color: #ffffff !important;
      padding: 10px 16px !important;
      border-radius: 999px !important;
      font-family: monospace, sans-serif !important;
      font-size: 12px !important;
      font-weight: 800 !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      cursor: pointer !important;
      box-shadow: 0 4px 25px rgba(255, 0, 85, 0.6), 0 0 10px rgba(0,0,0,0.9) !important;
      user-select: none !important;
      touch-action: manipulation !important;
    }
    #pd-qa-fab.has-errors {
      background: #ff0055 !important;
      color: #fff !important;
      animation: pd-qa-pulse 1.2s infinite !important;
    }
    @keyframes pd-qa-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,0,85, 0.7); }
      50% { box-shadow: 0 0 0 12px rgba(255,0,85, 0); }
    }
    .pd-qa-count {
      background: rgba(255,255,255,0.25) !important;
      padding: 2px 6px !important;
      border-radius: 8px !important;
      font-size: 10px !important;
    }
    #pd-qa-modal {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      background: rgba(5, 7, 10, 0.94) !important;
      backdrop-filter: blur(10px) !important;
      display: none;
      align-items: center !important;
      justify-content: center !important;
      padding: 12px !important;
      box-sizing: border-box !important;
      font-family: system-ui, sans-serif !important;
      color: #f0f4f8 !important;
    }
    #pd-qa-modal.is-open { display: flex !important; }
    .pd-qa-card {
      background: #12161f !important;
      border: 1.5px solid rgba(56, 189, 248, 0.4) !important;
      border-radius: 16px !important;
      width: 100% !important;
      max-width: 580px !important;
      max-height: 90vh !important;
      display: flex !important;
      flex-direction: column !important;
      box-shadow: 0 20px 50px rgba(0,0,0,0.9) !important;
      overflow: hidden !important;
    }
    .pd-qa-header {
      padding: 14px 18px !important;
      background: #181f2c !important;
      border-bottom: 1px solid rgba(255,255,255,0.08) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
    .pd-qa-title {
      font-weight: 900 !important;
      font-size: 15px !important;
      color: #38bdf8 !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .pd-qa-close {
      background: transparent !important;
      border: none !important;
      color: #94a3b8 !important;
      font-size: 24px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      line-height: 1 !important;
    }
    .pd-qa-body {
      padding: 16px !important;
      overflow-y: auto !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 14px !important;
    }
    .pd-qa-section-title {
      font-size: 11px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.1em !important;
      color: #94a3b8 !important;
      margin-bottom: 4px !important;
      font-family: monospace !important;
    }
    .pd-qa-tags {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 6px !important;
    }
    .pd-qa-tag-label {
      background: #1a2230 !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      padding: 8px 10px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      cursor: pointer !important;
    }
    .pd-qa-tag-label input { accent-color: #ff0055 !important; }
    .pd-qa-textarea {
      width: 100% !important;
      min-height: 80px !important;
      background: #090c12 !important;
      border: 1px solid rgba(255,255,255,0.15) !important;
      border-radius: 8px !important;
      color: #fff !important;
      font-size: 12px !important;
      padding: 10px !important;
      box-sizing: border-box !important;
      outline: none !important;
      resize: vertical !important;
    }
    .pd-qa-console-box {
      background: #06080c !important;
      border: 1px solid rgba(255,0,85,0.3) !important;
      border-radius: 8px !important;
      padding: 10px !important;
      max-height: 100px !important;
      overflow-y: auto !important;
      font-family: monospace !important;
      font-size: 11px !important;
      color: #ff557f !important;
      line-height: 1.4 !important;
      white-space: pre-wrap !important;
      word-break: break-all !important;
    }
    .pd-qa-footer {
      padding: 12px 16px !important;
      background: #181f2c !important;
      border-top: 1px solid rgba(255,255,255,0.08) !important;
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 8px !important;
      justify-content: space-between !important;
    }
    .pd-qa-btn {
      padding: 10px 14px !important;
      border-radius: 8px !important;
      font-family: monospace !important;
      font-size: 11px !important;
      font-weight: 800 !important;
      text-transform: uppercase !important;
      border: none !important;
      cursor: pointer !important;
    }
    .pd-qa-btn-primary { background: #ff0055 !important; color: #fff !important; }
    .pd-qa-btn-sec { background: #38bdf8 !important; color: #04121a !important; }
    .pd-qa-btn-danger { background: rgba(255,0,85,0.15) !important; color: #ff557f !important; border: 1px solid #ff0055 !important; }
  `;

  function updatePillBadge() {
    const badge = document.getElementById("pd-qa-badge");
    const fab = document.getElementById("pd-qa-fab");
    const count = getAuditLog().length;
    if (badge) badge.textContent = `${count} Flagged`;
    if (fab) {
      if (sessionErrors.length > 0) fab.classList.add("has-errors");
      else fab.classList.remove("has-errors");
    }
  }

  function injectUI() {
    if (document.getElementById("pd-qa-fab")) return; // Avoid duplicate mount

    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Button
    const fab = document.createElement("button");
    fab.id = "pd-qa-fab";
    fab.type = "button";
    fab.innerHTML = `🐞 <span>QA Logger</span> <span class="pd-qa-count" id="pd-qa-badge">0 Flagged</span>`;
    document.body.appendChild(fab);

    // Modal
    const modal = document.createElement("div");
    modal.id = "pd-qa-modal";
    modal.innerHTML = `
      <div class="pd-qa-card">
        <div class="pd-qa-header">
          <div class="pd-qa-title">🐞 PartyDeck Bug Logger</div>
          <button type="button" class="pd-qa-close" id="pd-qa-btn-close">&times;</button>
        </div>
        <div class="pd-qa-body">
          <div>
            <div class="pd-qa-section-title">Current Game Path</div>
            <strong id="pd-qa-current-game" style="color:#00ffaa;font-family:monospace;font-size:12px;"></strong>
          </div>
          <div>
            <div class="pd-qa-section-title">Flaw Checklist</div>
            <div class="pd-qa-tags">
              <label class="pd-qa-tag-label"><input type="checkbox" value="Button/Layout Cut Off (100vh)" class="pd-qa-tag-cb"> Button Cut Off</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="Canvas DPR/Blurry" class="pd-qa-tag-cb"> Blurry/Tiny Canvas</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="No Audio" class="pd-qa-tag-cb"> Silent / No Sound</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="Controls Frozen" class="pd-qa-tag-cb"> Controls Frozen</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="State Loop Stuck" class="pd-qa-tag-cb"> Won't Progress</label>
              <label class="pd-qa-tag-label"><input type="checkbox" value="Visual Glitch" class="pd-qa-tag-cb"> Visual Glitch</label>
            </div>
          </div>
          <div>
            <div class="pd-qa-section-title">What went wrong?</div>
            <textarea class="pd-qa-textarea" id="pd-qa-notes" placeholder="e.g. When tapping 'Start', nothing happens..."></textarea>
          </div>
          <div>
            <div class="pd-qa-section-title">Captured Crashes (<span id="pd-qa-err-count">0</span>)</div>
            <div class="pd-qa-console-box" id="pd-qa-err-box">No JS runtime exceptions detected.</div>
          </div>
        </div>
        <div class="pd-qa-footer">
          <button type="button" class="pd-qa-btn pd-qa-btn-primary" id="pd-qa-btn-save">Flag Game</button>
          <button type="button" class="pd-qa-btn pd-qa-btn-sec" id="pd-qa-btn-export">Download Audit (.MD)</button>
          <button type="button" class="pd-qa-btn pd-qa-btn-danger" id="pd-qa-btn-clear">Clear All</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Bindings
    fab.addEventListener("click", () => {
      const gameId = detectCurrentGameId();
      document.getElementById("pd-qa-current-game").textContent = `${gameId} (${window.location.pathname})`;
      document.getElementById("pd-qa-err-count").textContent = sessionErrors.length;
      document.getElementById("pd-qa-err-box").textContent = sessionErrors.length > 0
        ? sessionErrors.map(e => `[${e.timestamp}] ${e.type}: ${e.message}\n${e.location}`).join("\n\n")
        : "No JS runtime exceptions detected in this session.";

      const existing = getAuditLog().find(item => item.gameId === gameId);
      document.getElementById("pd-qa-notes").value = existing ? existing.userNotes : "";
      document.querySelectorAll(".pd-qa-tag-cb").forEach(cb => {
        cb.checked = existing ? (existing.categories || []).includes(cb.value) : false;
      });

      modal.classList.add("is-open");
    });

    document.getElementById("pd-qa-btn-close").addEventListener("click", () => modal.classList.remove("is-open"));
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("is-open"); });

    document.getElementById("pd-qa-btn-save").addEventListener("click", () => {
      const gameId = detectCurrentGameId();
      const selectedTags = Array.from(document.querySelectorAll(".pd-qa-tag-cb:checked")).map(cb => cb.value);
      const notes = document.getElementById("pd-qa-notes").value.trim();

      let currentLogs = getAuditLog().filter(l => l.gameId !== gameId);
      currentLogs.push({
        gameId,
        path: window.location.pathname,
        diagnostics: {
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          dpr: window.devicePixelRatio || 1,
          userAgent: navigator.userAgent
        },
        categories: selectedTags,
        userNotes: notes || "No notes provided.",
        runtimeErrors: [...sessionErrors]
      });
      saveAuditLog(currentLogs);
      alert(`✅ Flagged "${gameId}" saved! Total: ${currentLogs.length}`);
      updatePillBadge();
      modal.classList.remove("is-open");
    });

    document.getElementById("pd-qa-btn-export").addEventListener("click", () => {
      const logs = getAuditLog();
      if (!logs.length) return alert("No games flagged yet!");
      let md = `# 🛠️ PARTYDECK COMPREHENSIVE QA AUDIT & FIX REPORT\n\n`;
      logs.forEach((item, i) => {
        md += `### ${i + 1}. \`${item.path}\` (ID: ${item.gameId})\n`;
        md += `- **Flaws:** ${item.categories.join(", ") || "General"}\n`;
        md += `- **Notes:** ${item.userNotes}\n`;
        if (item.runtimeErrors?.length) {
          md += `- **Errors:**\n\`\`\`text\n${item.runtimeErrors.map(e => e.message).join("\n")}\n\`\`\`\n`;
        }
        md += `\n---\n\n`;
      });
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `PARTYDECK_BUG_AUDIT_${Date.now()}.md`;
      a.click();
    });

    document.getElementById("pd-qa-btn-clear").addEventListener("click", () => {
      if (confirm("Clear all flagged audit records?")) {
        localStorage.removeItem(STORAGE_KEY);
        sessionErrors.length = 0;
        updatePillBadge();
        alert("Cleared.");
      }
    });

    updatePillBadge();
    console.log("🐞 [PartyDeck QA Auditor] Button mounted successfully!");
  }

  // Self-executing bootstrap
  if (document.body) {
    injectUI();
  } else {
    document.addEventListener("DOMContentLoaded", injectUI);
    window.addEventListener("load", injectUI);
  }
})(window, document);