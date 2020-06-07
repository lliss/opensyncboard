import constants from './constants.mjs';
import * as drawHelpers from './drawHelpers.mjs';

let canvas = null;
let ctx = null;
let events = [];
const socket = new WebSocket(`${constants.SOCKET_VIEW_BASE_URL}/${drawingId}`);

function main() {
  initializeCanvas();
  drawHelpers.resetCanvasSize(canvas);
  attachEventListeners();

  socket.addEventListener('close', function (evnt) {
    console.log('CLOSE');
  });

  socket.addEventListener('error', function (evnt) {
    console.log('ERROR');
  });

  socket.addEventListener('open', function (evnt) {
    console.log('CONNECTED');
  });

  socket.addEventListener('message', function (evnt) {
    try {
      let drawEvent = JSON.parse(evnt.data);
      events.push(drawEvent);
      let fromPosition = drawHelpers.makeAbsolutePosition(drawEvent.from, canvas);
      let toPosition = drawHelpers.makeAbsolutePosition(drawEvent.to, canvas);
      ctx.strokeStyle = drawEvent.color;
      ctx.lineWidth = drawHelpers.calculateActualLineWidth(drawEvent.width, canvas);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(fromPosition.x, fromPosition.y);
      ctx.lineTo(toPosition.x, toPosition.y);
      ctx.stroke();
    } catch (e) {
      console.error(`Bad JSON data: ${evnt.data}`);
    }
  });
}

function attachEventListeners() {
  window.addEventListener('resize', (evnt) => {
    drawHelpers.resetCanvasSize(canvas);
    redraw();
  });
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
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

main();
