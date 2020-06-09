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
    ({ctx, canvas} = drawHelpers.initializeCanvas());
    drawHelpers.resetCanvasSize(canvas);
    setupControls();
    attachEventListeners();
  });
}

function attachEventListeners() {
  window.addEventListener('resize', (evnt) => {
    drawHelpers.resetCanvasSize(canvas);
    drawHelpers.redraw(events, ctx, canvas);
  });

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('touchstart', startDrawing);

  window.addEventListener('mouseup', stopDrawing);
  window.addEventListener('touchend', stopDrawing);
  window.addEventListener('touchcancel', stopDrawing);

  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw);

  canvas.addEventListener('click', addCircle);
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
    let lastPositionRelative = drawHelpers.makeRelativePosition(lastPosition, canvas);
    let currentPositionRelative = drawHelpers.makeRelativePosition(position, canvas);

    let drawEvent = {
      type: constants.DRAW_EVENT_TYPE_SEGMENT,
      event: {
        from: lastPositionRelative,
        to: currentPositionRelative,
        width: lineWidth,
        color: lineColor,
      }
    };

    drawHelpers.drawSegment(drawEvent.event, ctx, canvas);
    events.push(drawEvent);
    socket.send(JSON.stringify(drawEvent));
    lastPosition = position;
  }
  evnt.preventDefault();
}

function addCircle(evnt) {
  let position = getCanvasPositionByEvent(evnt);
  let relativeCenter = drawHelpers.makeRelativePosition(position, canvas);

  let drawEvent = {
    type: constants.DRAW_EVENT_TYPE_CIRCLE,
    event: {
      center: relativeCenter,
      diameter: lineWidth,
      color: lineColor,
    }
  };

  drawHelpers.drawCircle(drawEvent.event, ctx, canvas);
  events.push(drawEvent);
  socket.send(JSON.stringify(drawEvent));
}

function getCanvasPositionByEvent(evnt) {
  return {
    x: evnt.pageX - evnt.target.offsetLeft,
    y: evnt.pageY - evnt.target.offsetTop
  };
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
      lineWidth = Number(el.dataset.size);
    });
  });
}

function setupCanvasControls() {
  document.querySelector('#clear-button').addEventListener('click', (evnt) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    events = [];
    socket.send(JSON.stringify({ type: constants.DRAW_EVENT_TYPE_CLEAR }));
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
