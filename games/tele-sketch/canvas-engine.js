/**
 * TELE-SKETCH CANVAS ENGINE
 * ---------------------------------------------------------------------------
 * A retina-correct, touch-first drawing surface.
 *
 * Key techniques:
 *  - Device-pixel-ratio scaling (capped at 3) so lines are crisp on phones
 *    without blowing up bitmap memory on high-DPI tablets.
 *  - Quadratic Bézier smoothing: each segment is drawn between the MIDPOINTS
 *    of consecutive sample points, using the shared point as the control
 *    handle. That produces a C1-continuous curve with no visible joints,
 *    which is what makes finger-drawing feel "designed" rather than jagged.
 *  - Pointer Events unify mouse / touch / stylus in one code path, with
 *    getCoalescedEvents() used where available for high-refresh smoothness.
 *  - Lazy fit(): the canvas lives inside a hidden phase at page load, so its
 *    bounding box is 0x0 until the draw phase is shown. fit() is therefore
 *    called at the start of every draw turn and retries on the next frame if
 *    the element has not been laid out yet.
 * ---------------------------------------------------------------------------
 */
class SketchCanvas {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.maxHistory = options.maxHistory || 14;

    this.color = "#101010";
    this.size = 7;

    this.drawing = false;
    this.pts = [];
    this.undoStack = [];
    this.redoStack = [];
    this.restoring = false;          // guards async snapshot restores
    this.cssW = 0;
    this.cssH = 0;

    this.onHistoryChange = null;     // ({canUndo, canRedo}) => void

    this._bindPointer();

    // Re-fit on rotation / resize while preserving current artwork
    this._onResize = () => this.refit();
    window.addEventListener("resize", this._onResize);
    window.addEventListener("orientationchange", () => setTimeout(this._onResize, 260));
  }

  /* =======================================================================
     SIZING
     ===================================================================== */

  /** Measure the element and (re)allocate the bitmap. Blank white surface. */
  fit() {
    const rect = this.canvas.getBoundingClientRect();

    // Element not laid out yet (hidden phase) — retry next frame.
    if (rect.width < 4 || rect.height < 4) {
      requestAnimationFrame(() => this.fit());
      return false;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.cssW = rect.width;
    this.cssH = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.imageSmoothingEnabled = true;

    this.paintWhite();
    return true;
  }

  /** Re-fit after a resize, carrying the existing artwork across. */
  refit() {
    if (!this.cssW) return;
    const snapshot = this.toDataURL();
    if (this.fit() === false) return;
    this._blit(snapshot, false);
  }

  /* =======================================================================
     INPUT
     ===================================================================== */
  _bindPointer() {
    const c = this.canvas;
    c.style.touchAction = "none";

    c.addEventListener("pointerdown", (e) => this._down(e));
    c.addEventListener("pointermove", (e) => this._move(e));
    c.addEventListener("pointerup",   () => this._up());
    c.addEventListener("pointercancel", () => this._up());
    c.addEventListener("pointerleave",  () => this._up());
    c.addEventListener("contextmenu", (e) => e.preventDefault());

    // Belt-and-braces scroll suppression for older iOS Safari, which can
    // still rubber-band the page even with touch-action:none.
    c.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
    c.addEventListener("touchmove",  (e) => e.preventDefault(), { passive: false });
    c.addEventListener("touchend",   (e) => e.preventDefault(), { passive: false });
  }

  _point(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  _down(e) {
    if (this.restoring) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    try { this.canvas.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }

    this.pushHistory();
    this.redoStack.length = 0;
    this.drawing = true;

    const p = this._point(e);
    this.pts = [p, p];

    // A single tap should leave a dot, not nothing.
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(p.x, p.y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();

    this._notify();
  }

  _move(e) {
    if (!this.drawing) return;

    const ctx = this.ctx;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;

    // Coalesced events recover sample points dropped between frames on
    // 120Hz displays — noticeably smoother fast strokes.
    let samples = [e];
    if (typeof e.getCoalescedEvents === "function") {
      const c = e.getCoalescedEvents();
      if (c && c.length) samples = c;
    }

    for (const s of samples) {
      this.pts.push(this._point(s));
      const n = this.pts.length;
      if (n < 3) continue;

      const p0 = this.pts[n - 3];
      const p1 = this.pts[n - 2];   // control point
      const p2 = this.pts[n - 1];

      const m1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const m2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctx.beginPath();
      ctx.moveTo(m1.x, m1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, m2.x, m2.y);
      ctx.stroke();
    }

    // Keep the buffer bounded on long strokes
    if (this.pts.length > 64) this.pts.splice(0, this.pts.length - 8);
  }

  _up() {
    if (!this.drawing) return;
    this.drawing = false;
    this.pts = [];
  }

  /* =======================================================================
     TOOL STATE
     ===================================================================== */
  setColor(hex) { this.color = hex; }
  setSize(px)   { this.size = px; }

  paintWhite() {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
  }

  /** Fresh surface for a new turn — also wipes undo history. */
  reset() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.drawing = false;
    this.pts = [];
    if (this.fit() !== false) this.paintWhite();
    this._notify();
  }

  clear() {
    this.pushHistory();
    this.redoStack.length = 0;
    this.paintWhite();
    this._notify();
  }

  /* =======================================================================
     HISTORY  (data-URL snapshots keep memory predictable on mobile)
     ===================================================================== */
  pushHistory() {
    if (!this.cssW) return;
    if (this.undoStack.length >= this.maxHistory) this.undoStack.shift();
    this.undoStack.push(this.toDataURL());
  }

  undo() {
    if (!this.undoStack.length || this.restoring) return;
    this.redoStack.push(this.toDataURL());
    this._blit(this.undoStack.pop(), true);
    this._notify();
  }

  redo() {
    if (!this.redoStack.length || this.restoring) return;
    this.undoStack.push(this.toDataURL());
    this._blit(this.redoStack.pop(), true);
    this._notify();
  }

  _blit(dataUrl, wipeFirst) {
    if (!dataUrl) return;
    this.restoring = true;
    const img = new Image();
    img.onload = () => {
      if (wipeFirst) this.paintWhite();
      this.ctx.drawImage(img, 0, 0, this.cssW, this.cssH);
      this.restoring = false;
    };
    img.onerror = () => { this.restoring = false; };
    img.src = dataUrl;
  }

  _notify() {
    if (typeof this.onHistoryChange === "function") {
      this.onHistoryChange({
        canUndo: this.undoStack.length > 0,
        canRedo: this.redoStack.length > 0
      });
    }
  }

  /* =======================================================================
     EXPORT
     ===================================================================== */
  /** PNG keeps line art lossless; WebP is the fallback if PNG is blocked. */
  toDataURL() {
    try { return this.canvas.toDataURL("image/png"); }
    catch (err) {
      try { return this.canvas.toDataURL("image/webp", 0.92); }
      catch (e2) { return ""; }
    }
  }

  destroy() {
    window.removeEventListener("resize", this._onResize);
  }
}