import constants from './constants.mjs';
import * as drawHelpers from './drawHelpers.mjs';

let canvas = null;
let ctx = null;
let drawing = false;
let lastPosition = { x: null, y: null };
let lineWidth = constants.DEFAULT_LINE_WIDTH;
let lineColor = constants.DEFAULT_LINE_COLOR;
let events = [];
const socket = new WebSocket(`${constants.SOCKET_DRAW_BASE_URL}/${drawingId}`);

function main() {
  socket.addEventListener('open', () => {
    initializeCanvas();
    drawHelpers.resetCanvasSize(canvas);
    setupControls();
    attachEventListeners();
  });
}

function attachEventListeners() {
  window.addEventListener('resize', (evnt) => {
    drawHelpers.resetCanvasSize(canvas);
    redraw();
  });

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('touchstart', startDrawing);

  window.addEventListener('mouseup', stopDrawing);
  window.addEventListener('touchend', stopDrawing);
  window.addEventListener('touchcancel', stopDrawing);

  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw);
}

function startDrawing(evnt) {
  drawing = true;
  lastPosition = getCanvasPositionByEvent(evnt);
}

function stopDrawing() {
  drawing = false;
}

function draw(evnt) {
  if (drawing) {
    let position = getCanvasPositionByEvent(evnt);
    ctx.strokeStyle = lineColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = drawHelpers.calculateActualLineWidth(lineWidth, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
    let lastPositionRelative = drawHelpers.makeRelativePosition(lastPosition, canvas);
    let currentPositionRelative = drawHelpers.makeRelativePosition(position, canvas);

    let drawEvent = {
      from: lastPositionRelative,
      to: currentPositionRelative,
      width: lineWidth,
      color: lineColor,
    };
    events.push(drawEvent);
    socket.send(JSON.stringify(drawEvent));
    lastPosition = position;
  }
  evnt.preventDefault();
}

function getCanvasPositionByEvent(evnt) {
  return {
    x: evnt.pageX - evnt.target.offsetLeft,
    y: evnt.pageY - evnt.target.offsetTop
  };
}

function redraw() {
  events.forEach((evnt) => {
    let fromPosition = drawHelpers.makeAbsolutePosition(evnt.from, canvas);
    let toPosition = drawHelpers.makeAbsolutePosition(evnt.to, canvas);
    ctx.strokeStyle = evnt.color;
    ctx.lineWidth = drawHelpers.calculateActualLineWidth(evnt.width, canvas);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(fromPosition.x, fromPosition.y);
    ctx.lineTo(toPosition.x, toPosition.y);
    ctx.stroke();
  });
}

function initializeCanvas() {
  canvas = document.querySelector('#syncboard');
  document.body.style.padding = `${constants.PADDING_PERCENT}vh ${constants.PADDING_PERCENT}vw`;
  ctx = canvas.getContext('2d');
  ctx.lineWidth = drawHelpers.calculateActualLineWidth(constants.DEFAULT_LINE_WIDTH, canvas);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function setupControls() {
  setupColorControls();
  setupSizeControls();
  setupCanvasControls();
}

function setupSizeControls() {
  document.querySelectorAll('.size-control').forEach((el) => {
    let size = Number(el.dataset.size) * 20;
    let innerEl = document.createElement('div');
    el.appendChild(innerEl);
    innerEl.style.width = `${size}%`;
    innerEl.style.height = `${size}%`;
    innerEl.style.margin = `${(100 - size) / 2}% 0 0 ${(100 - size) / 2}%`;
    innerEl.style.borderRadius = '100%';
    innerEl.style.backgroundColor = 'black';

    el.addEventListener('click', (evnt) => {
      deactivateToggles('.size-control');
      el.classList.toggle('active');
      lineWidth = el.dataset.size;
    });
  });
}

function setupCanvasControls() {
  document.querySelector('#clear-button').addEventListener('click', (evnt) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    events = [];
  });
}

function setupColorControls() {
  document.querySelectorAll('.color-control').forEach((el) => {
    let color = el.dataset.color;
    let innerEl = document.createElement('div');
    el.appendChild(innerEl);
    innerEl.style.width = '100%';
    innerEl.style.height = '100%';
    innerEl.style.backgroundColor = color;
    el.addEventListener('click', (evnt) => {
      deactivateToggles('.color-control');
      el.classList.toggle('active');
      lineColor = color;
    });
  });
}

function deactivateToggles(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.classList.remove('active');
  });
}

main();
