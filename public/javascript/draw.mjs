import constants from './constants.mjs';
import * as drawHelpers from './drawHelpers.mjs';
import DrawingSurface from './DrawingSurface.mjs';
import Point from './Point.mjs';

let surface = null;
let drawing = false;
let lastPosition = null;
let lineWidth = constants.DEFAULT_LINE_WIDTH;
let lineColor = constants.DEFAULT_LINE_COLOR;
let events = [];
const socket = new WebSocket(`${constants.SOCKET_DRAW_BASE_URL}/${drawingId}`);

function main() {
  document.body.style.padding = `${constants.PADDING_PERCENT}vh ${constants.PADDING_PERCENT}vw`;

  socket.addEventListener('open', () => {
    surface = new DrawingSurface('#syncboard', '2d');
    surface.resetCanvasSize();
    setupControls();
    attachEventListeners();
  });

  socket.addEventListener('message', function (evnt) {
    try {
      let count = JSON.parse(evnt.data).count;
      document.querySelector('#active-clients p').textContent = `${count} connected clients`;
    } catch (e) {
      console.error(`Error: ${e.message}`);
      console.error(`Data: ${evnt.data}`);
    }
  });

}

function attachEventListeners() {
  let canvas = document.querySelector('#syncboard');

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('touchstart', startTouchDrawing);

  window.addEventListener('mouseup', stopDrawing);
  window.addEventListener('touchend', stopTouchDrawing);
  window.addEventListener('touchcancel', stopTouchDrawing);

  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', touchDraw);

  canvas.addEventListener('click', addCircle);
  canvas.addEventListener('touchend', addCircle);

  window.addEventListener('resize', (_) => {
    surface.resetCanvasSize();
    drawHelpers.redraw(events, surface);
  });
}

function startDrawing(evnt) {
  drawing = true;
  lastPosition = getCanvasPositionFromEvent(evnt);
}

function startTouchDrawing(evnt) {
  evnt.preventDefault();
  let e = {};
  e.target = evnt.target;
  e.pageX = evnt.pageX || evnt.touches[0].pageX;
  e.pageY = evnt.pageY || evnt.touches[0].pageY;
  startDrawing(e);
}

function stopDrawing() {
  drawing = false;
}

function stopTouchDrawing(evnt) {
  evnt.preventDefault();
  stopDrawing();
}

function draw(evnt) {
  if (drawing) {
    let currentPosition = getCanvasPositionFromEvent(evnt);
    let lastPositionRelative = surface.makeRelativePosition(lastPosition);
    let currentPositionRelative = surface.makeRelativePosition(currentPosition);
    let actualLineWidth = surface.calculateActualLineWidth(lineWidth);
    let drawEvent = {
      type: constants.DRAW_EVENT_TYPE_SEGMENT,
      event: {
        from: lastPositionRelative,
        to: currentPositionRelative,
        width: lineWidth,
        color: lineColor,
      }
    };

    surface.drawSegment(lastPosition, currentPosition, actualLineWidth, lineColor);
    events.push(drawEvent);
    socket.send(JSON.stringify(drawEvent));
    lastPosition = currentPosition;
  }
}

function touchDraw(evnt) {
  evnt.preventDefault();
  let e = {};
  e.target = evnt.target;
  e.pageX = evnt.pageX || evnt.touches[0].pageX;
  e.pageY = evnt.pageY || evnt.touches[0].pageY;
  draw(e);
}

function addCircle(evnt) {
  let center = getCanvasPositionFromEvent(evnt);
  let relativeCenter = surface.makeRelativePosition(center);
  let diameter = surface.calculateActualLineWidth(lineWidth);

  let drawEvent = {
    type: constants.DRAW_EVENT_TYPE_CIRCLE,
    event: {
      center: relativeCenter,
      diameter: lineWidth,
      color: lineColor,
    }
  };

  surface.drawCircle(center, diameter, lineColor);
  events.push(drawEvent);
  socket.send(JSON.stringify(drawEvent));
}

function getCanvasPositionFromEvent(evnt) {
  return new Point (
    evnt.pageX - evnt.target.offsetLeft,
    evnt.pageY - evnt.target.offsetTop
  );
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

    let eventHandler = (_) => {
      deactivateToggles('.size-control');
      el.classList.toggle('active');
      lineWidth = Number(el.dataset.size);
    };

    el.appendChild(innerEl);
    innerEl.style.width = `${size}%`;
    innerEl.style.height = `${size}%`;
    innerEl.style.margin = `${(100 - size) / 2}% 0 0 ${(100 - size) / 2}%`;
    innerEl.style.borderRadius = '100%';
    innerEl.style.backgroundColor = 'black';

    el.addEventListener('click', eventHandler);
    el.addEventListener('touchstart', eventHandler);
  });
}

function setupCanvasControls() {
  let eventHandler = (_) => {
    surface.clear();
    events = [];
    socket.send(JSON.stringify({ type: constants.DRAW_EVENT_TYPE_CLEAR }));
  };

  document.querySelector('#clear-button').addEventListener('click', eventHandler);
  document.querySelector('#clear-button').addEventListener('touchstart', eventHandler);
}

function setupColorControls() {
  document.querySelectorAll('.color-control').forEach((el) => {
    let color = el.dataset.color;
    let innerEl = document.createElement('div');

    let eventHandler = (_) => {
      deactivateToggles('.color-control');
      el.classList.toggle('active');
      lineColor = color;
    };

    el.appendChild(innerEl);
    innerEl.style.width = '100%';
    innerEl.style.height = '100%';
    innerEl.style.backgroundColor = color;
    el.addEventListener('click', eventHandler);
    el.addEventListener('touchstart', eventHandler);
  });
}

function deactivateToggles(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.classList.remove('active');
  });
}

main();
