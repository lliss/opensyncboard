let canvas = null;
let ctx = null;
let events = [];
const paddingPercent = 5;
const socket = new WebSocket(`ws://localhost:3000/socket/view/${drawingId}`);

function main() {
  initializeCanvas();
  resetCanvasSize();
  attachEventListeners();

  socket.addEventListener('close', function(evnt) {
    console.log('CLOSE');
  });

  socket.addEventListener('error', function(evnt) {
    console.log('ERROR');
  });

  socket.addEventListener('open', function(evnt) {
    console.log('CONNECTED');
  });

  socket.addEventListener('message', function(evnt) {
    console.log(evnt.data);
  });
}

function attachEventListeners() {
  window.addEventListener('resize', (evnt) => {
    resetCanvasSize();
    redraw();
  });
}

function makeRelativePosition(position) {
  return {
    x: position.x / canvas.width,
    y: position.y / canvas.height,
  };
}

function makeAbsolutePosition(position) {
  return {
    x: Math.floor(position.x * canvas.width),
    y: Math.floor(position.y * canvas.height),
  };
}

function resetCanvasSize() {
  let width = Math.floor(window.innerWidth * (1 - paddingPercent * 2 / 100));
  canvas.width = width;
  canvas.height = Math.floor(width * 9 / 16);

  if (window.innerHeight < document.body.scrollHeight) {
    let height = Math.floor(window.innerHeight * (1 - paddingPercent * 2 / 100));
    canvas.height = height;
    canvas.width = Math.floor(height * 16 / 9);
  }
}

function redraw() {
  events.forEach((evnt) => {
    let fromPosition = makeAbsolutePosition(evnt.from);
    let toPosition = makeAbsolutePosition(evnt.to);
    ctx.strokeStyle = evnt.color;
    ctx.lineWidth = calculateActualLineWidth(evnt.width);
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
  document.body.style.padding = `${paddingPercent}vh ${paddingPercent}vw`;
  ctx = canvas.getContext('2d');
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function calculateActualLineWidth(width) {
  return Math.max(Math.floor(width / 200 * canvas.width), 1)
}

main();
