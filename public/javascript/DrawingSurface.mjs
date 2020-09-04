import constants from './constants.mjs';
import Point from './Point.mjs';

class DrawingSurface {
  constructor(querySelector, context) {
    this.canvas = document.querySelector(querySelector);
    this.ctx = this.canvas.getContext(context);
    this.lastPosition = null;
    this.lineWidth = constants.DEFAULT_LINE_WIDTH;
    this.lineColor = constants.DEFAULT_LINE_COLOR;

    document.body.style.padding = `${constants.PADDING_PERCENT}vh ${constants.PADDING_PERCENT}vw 0`;
    this.ctx.lineWidth = this.calculateActualLineWidth(constants.DEFAULT_LINE_WIDTH);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  calculateActualLineWidth(width) {
    return Math.max(Math.floor(width / 200 * this.canvas.width), 1);
  }

 drawCircle(center, diameter, color) {
    let radius = Math.floor(diameter / 2);
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fill();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawSegment(from, to, width, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
  }

  makeAbsolutePosition(position) {
    return new Point(Math.floor(position.x * this.canvas.width), Math.floor(position.y * this.canvas.height));
  }

  makeRelativePosition(position) {
    return new Point(position.x / this.canvas.width, position.y / this.canvas.height);
  }

  resetCanvasSize() {
    let width = Math.floor(window.innerWidth * (1 - constants.PADDING_PERCENT * 2 / 100));
    let height = Math.floor(width * constants.RATIO_HEIGHT / constants.RATIO_WIDTH);
    this.canvas.width = width;
    this.canvas.height = height;

    if (window.innerHeight < document.body.scrollHeight) {
      let height = Math.floor(window.innerHeight * (1 - constants.PADDING_PERCENT * 2 / 100));
      this.canvas.height = height;
      this.canvas.width = Math.floor(height * constants.RATIO_WIDTH / constants.RATIO_HEIGHT);
    }
  }
}

export default DrawingSurface;
