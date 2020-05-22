let canvas = null;
let ctx = null;
let drawing = false;
let lastPosition = {x: null, y: null};
let lineWidth = 4;
let lineColor = '#000000';
let events = [];
let lastImage = null;
const paddingPercent = 5;

function main() {
  canvas = document.querySelector('#syncboard');
  document.body.style.padding = `${paddingPercent}vh ${paddingPercent}vw`;
  ctx = canvas.getContext('2d');
  ctx.lineWidth = lineWidth;
  resetCanvasSize();

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
      console.log(evnt);
      let position = getCanvasPositionByEvent(evnt);

      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
      let lastPositionRelative = makeRelativePosition(lastPosition);
      let currentPositionRelative = makeRelativePosition(position);

      events.push({
        from: lastPositionRelative,
        to: currentPositionRelative,
        width: lineWidth / canvas.width,
        color: lineColor
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
    console.log('trigger');
    let height = Math.floor(window.innerHeight * (1 - paddingPercent * 2 / 100));
    canvas.height = height;
    canvas.width = Math.floor(height * 16 / 9);
  }
}

function redraw() {
  events.forEach((evnt) => {
    let fromPosition = makeAbsolutePosition(evnt.from);
    let toPosition = makeAbsolutePosition(evnt.to);
    ctx.beginPath();
    ctx.moveTo(fromPosition.x, fromPosition.y);
    ctx.lineTo(toPosition.x, toPosition.y);
    ctx.stroke();
  });
}

main();
