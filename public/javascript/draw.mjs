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
let heartbeatInterval;
const socket = new WebSocket(`${constants.SOCKET_DRAW_BASE_URL}/${drawingId}`);

function main() {
  socket.addEventListener('open', () => {
    console.log('CONNECTED');
    surface = new DrawingSurface('#syncboard', '2d');
    surface.resetCanvasSize();
    setupControls();
    attachEventListeners();
    startHeartbeat();
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

  socket.addEventListener('close', function (evnt) {
    console.log('CLOSE');
    clearInterval(heartbeatInterval);
  });

  socket.addEventListener('error', function (evnt) {
    console.log('ERROR');
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
  canvas.addEventListener('touchend', touchCircle);

  window.addEventListener('resize', (_) => {
    surface.resetCanvasSize();
    drawHelpers.redraw(events, surface);
  });

  let copyButton = document.querySelector('#copy-button');
  copyButton.addEventListener('click', copyLinkToClipboard);
  copyButton.addEventListener('touchend', copyLinkToClipboard);

}

function clipBoardCopyFallback() {
  document.querySelector('#copy-button').style.display = 'none';
  let text = document.createTextNode('  <= COPY THIS CODE');
  document.querySelector('#copy').appendChild(text);
}

function copyLinkToClipboard() {
  const id = document.querySelector('#drawing-id').textContent;
  try {
    navigator.clipboard.writeText(`${constants.PROTOCOL}//${constants.HOSTNAME}/view/${id}`)
      .then(() => {
        alert('The link was copied to your clipboard.')
      })
      .catch((_) => {
        alert('Whoops! We could not copy to your clipboard');
        clipBoardCopyFallback();
      });
  } catch {
    clipBoardCopyFallback();
  }
}

function normalizeTouchEvent(evnt) {
  let e = {};
  e.target = evnt.target;
  e.pageX = evnt.pageX || evnt.touches[0].pageX;
  e.pageY = evnt.pageY || evnt.touches[0].pageY;
  return e;
}

function startDrawing(evnt) {
  drawing = true;
  lastPosition = getCanvasPositionFromEvent(evnt);
}

function startTouchDrawing(evnt) {
  evnt.preventDefault();
  let e = normalizeTouchEvent(evnt);
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
  let e = normalizeTouchEvent(evnt);
  draw(e);
}

function touchCircle(evnt) {
  let e = {};
  e.target = evnt.target;
  e.pageX = evnt.pageX || evnt.changedTouches[0].pageX;
  e.pageY = evnt.pageY || evnt.changedTouches[0].pageY;
  addCircle(e);
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

function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    socket.send(JSON.stringify({ type: constants.EVENT_TYPE_HEARBEAT }));
  }, constants.HEARTBEAT_INTERVAL);
}

main();
