/**
 * TELE-SKETCH Canvas Engine
 * High-performance HTML5 retina touch drawing engine.
 */
class CanvasEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.isDrawing = false;
    this.currentColor = "#000000";
    this.brushSize = 5;
    this.points = [];
    this.history = [];

    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    
    this.clear(false);
  }

  bindEvents() {
    this.canvas.addEventListener("touchstart", (e) => this.handleStart(e), { passive: false });
    this.canvas.addEventListener("touchmove", (e) => this.handleMove(e), { passive: false });
    this.canvas.addEventListener("touchend", () => this.handleEnd());

    this.canvas.addEventListener("mousedown", (e) => this.handleStart(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleEnd());
    this.canvas.addEventListener("mouseleave", () => this.handleEnd());

    window.addEventListener("resize", () => {
      const state = this.getImageData();
      this.initCanvas();
      this.restoreImage(state);
    });
  }

  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  handleStart(e) {
    e.preventDefault();
    this.saveState();
    this.isDrawing = true;
    const pos = this.getCoordinates(e);
    this.points = [pos];

    this.ctx.beginPath();
    this.ctx.fillStyle = this.currentColor;
    this.ctx.arc(pos.x, pos.y, this.brushSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  handleMove(e) {
    if (!this.isDrawing) return;
    e.preventDefault();

    const pos = this.getCoordinates(e);
    this.points.push(pos);

    if (this.points.length > 2) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.brushSize;

      const p1 = this.points[this.points.length - 2];
      const p2 = this.points[this.points.length - 1];
      const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };

      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      this.ctx.stroke();
    }
  }

  handleEnd() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.points = [];
  }

  setColor(hex) {
    this.currentColor = hex;
  }

  setBrushSize(size) {
    this.brushSize = size;
  }

  clear(save = true) {
    if (save) this.saveState();
    const dpr = window.devicePixelRatio || 1;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
  }

  saveState() {
    if (this.history.length > 15) this.history.shift();
    this.history.push(this.canvas.toDataURL("image/webp", 0.8));
  }

  undo() {
    if (this.history.length === 0) return;
    const previousState = this.history.pop();
    this.restoreImage(previousState);
  }

  getImageData() {
    return this.canvas.toDataURL("image/webp", 0.85);
  }

  restoreImage(dataUrl) {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
      this.ctx.drawImage(img, 0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
    };
    img.src = dataUrl;
  }
}