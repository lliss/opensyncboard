let canvas = null;
let ctx = null;
let drawing = false;
let lastPosition = { x: null, y: null };
let lineWidth = 1;
let lineColor = '#025bd1';
let events = [];
const paddingPercent = 5;
const socket = new WebSocket(`ws://localhost:3000/socket/draw/${drawingId}`);

function main() {
  initializeCanvas();
  resetCanvasSize();
  setupControls();
  attachEventListeners();

  // socket.on('drawEvent', function(drawData) {
  //   console.log(drawData);
  // });
}

function attachEventListeners() {
  window.addEventListener('resize', (evnt) => {
    resetCanvasSize();
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
    ctx.lineWidth = calculateActualLineWidth();
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
    let lastPositionRelative = makeRelativePosition(lastPosition);
    let currentPositionRelative = makeRelativePosition(position);

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

function getCanvasPositionByEvent(evnt) {
  return {
    x: evnt.pageX - evnt.target.offsetLeft,
    y: evnt.pageY - evnt.target.offsetTop
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
  ctx.lineWidth = calculateActualLineWidth();
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

function calculateActualLineWidth(width = lineWidth) {
  return Math.max(Math.floor(width / 200 * canvas.width), 1)
}

main();