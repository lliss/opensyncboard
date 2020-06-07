import constants from './constants.mjs';

function calculateActualLineWidth(width, canvas) {
  return Math.max(Math.floor(width / 200 * canvas.width), 1)
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

function resetCanvasSize(canvas) {
  let width = Math.floor(window.innerWidth * (1 - constants.PADDING_PERCENT * 2 / 100));
  canvas.width = width;
  canvas.height = Math.floor(width * constants.RATIO_HEIGHT / constants.RATIO_WIDTH);

  if (window.innerHeight < document.body.scrollHeight) {
    let height = Math.floor(window.innerHeight * (1 - constants.PADDING_PERCENT * 2 / 100));
    canvas.height = height;
    canvas.width = Math.floor(height *  constants.RATIO_WIDTH / constants.RATIO_HEIGHT);
  }
}

export {
  calculateActualLineWidth,
  makeAbsolutePosition,
  makeRelativePosition,
  resetCanvasSize,
};
