let canvas = null;
let ctx = null;
let drawing = false;
let lastPosition = {x: null, y: null};
let lineWidth = 2;
let lineColor = '#000000';
let events = [];
let lastImage = null;
const paddingPercent = 5;

function main() {
  initializeCanvas();
  resetCanvasSize();
  setupControls();

  window.addEventListener('resize', (evnt) => {
    resetCanvasSize();
    redraw();
  });

  canvas.addEventListener('mousedown', (evnt) => {
    drawing = true;
    lastPosition = getCanvasPositionByEvent(evnt);
  });

  canvas.addEventListener('mouseup', (evnt) => {
    drawing = false;
  });

  canvas.addEventListener('mousemove', (evnt) => {
    if (drawing) {
      let position = getCanvasPositionByEvent(evnt);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = calculateActualLineWidth();
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
      let lastPositionRelative = makeRelativePosition(lastPosition);
      let currentPositionRelative = makeRelativePosition(position);

      events.push({
        from: lastPositionRelative,
        to: currentPositionRelative,
        width: lineWidth,
        color: lineColor,
      });
      lastPosition = position;
    }
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
}

function setupControls() {
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

  document.querySelectorAll('.size-control').forEach((el) => {
    el.addEventListener('click', (evnt) => {
      deactivateToggles('.size-control');
      el.classList.toggle('active');
      lineWidth = el.dataset.size;
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
