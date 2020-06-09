import constants from './constants.mjs';

function calculateActualLineWidth(width, canvas) {
  return Math.max(Math.floor(width / 200 * canvas.width), 1);
}

function drawCircle(drawEvent, ctx, canvas) {
  let center = makeAbsolutePosition(drawEvent.center, canvas);
  let radius = Math.floor(calculateActualLineWidth(drawEvent.diameter, canvas) / 2);
  ctx.fillStyle = drawEvent.color;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawSegment(drawEvent, ctx, canvas) {
  let fromPosition = makeAbsolutePosition(drawEvent.from, canvas);
  let toPosition = makeAbsolutePosition(drawEvent.to, canvas);
  ctx.strokeStyle = drawEvent.color;
  ctx.lineWidth = calculateActualLineWidth(drawEvent.width, canvas);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(fromPosition.x, fromPosition.y);
  ctx.lineTo(toPosition.x, toPosition.y);
  ctx.stroke();
}

function initializeCanvas() {
  let canvas = document.querySelector('#syncboard');
  let ctx = canvas.getContext('2d');
  document.body.style.padding = `${constants.PADDING_PERCENT}vh ${constants.PADDING_PERCENT}vw`;
  ctx.lineWidth = calculateActualLineWidth(constants.DEFAULT_LINE_WIDTH, canvas);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  return { ctx, canvas };
}

function makeAbsolutePosition(position, canvas) {
  return {
    x: Math.floor(position.x * canvas.width),
    y: Math.floor(position.y * canvas.height),
  };
}

function makeRelativePosition(position, canvas) {
  return {
    x: position.x / canvas.width,
    y: position.y / canvas.height,
  };
}

function redraw(events, ctx, canvas) {
  events.forEach((evnt) => {
    routeDrawEvent(evnt, ctx, canvas);
  });
}

function resetCanvasSize(canvas) {
  let width = Math.floor(window.innerWidth * (1 - constants.PADDING_PERCENT * 2 / 100));
  canvas.width = width;
  canvas.height = Math.floor(width * constants.RATIO_HEIGHT / constants.RATIO_WIDTH);

  if (window.innerHeight < document.body.scrollHeight) {
    let height = Math.floor(window.innerHeight * (1 - constants.PADDING_PERCENT * 2 / 100));
    canvas.height = height;
    canvas.width = Math.floor(height * constants.RATIO_WIDTH / constants.RATIO_HEIGHT);
  }
}

function routeDrawEvent(drawEvent, ctx, canvas) {
  switch (drawEvent.type) {
    case 'segment':
      drawSegment(drawEvent.event, ctx, canvas);
      break;

    case 'circle':
      drawCircle(drawEvent.event, ctx, canvas);
      break;

    default:
    // Noop
  }
}

export {
  calculateActualLineWidth,
  drawCircle,
  drawSegment,
  initializeCanvas,
  makeAbsolutePosition,
  makeRelativePosition,
  redraw,
  resetCanvasSize,
  routeDrawEvent,
};
