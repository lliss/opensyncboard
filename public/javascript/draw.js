let canvas = null;
let ctx = null;
let drawing = false;
let lastPosition = {x: null, y: null};
let lineWidth = 4;
let lineColor = '#000000';
let events = [];
let lastImage = null;

function main() {
  canvas = document.querySelector('#syncboard');
  ctx = canvas.getContext('2d');
  ctx.lineWidth = lineWidth;
  resetCanvasSize();

  window.addEventListener('resize', (evnt) => {
    resetCanvasSize();
    // redraw();
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
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
      events.push({from: lastPosition, to: position, width: lineWidth, color: lineColor});
      lastPosition = position;
    }
  });

}

function getCanvasPositionByEvent(evnt) {
  return {
    x: evnt.clientX - evnt.target.offsetLeft,
    y: evnt.clientY - evnt.target.offsetTop
  };
}

function resetCanvasSize() {
  let width = Math.floor(window.innerWidth * .9);
  if (events.length > 0 || lastImage === null) {
    lastImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    events = [];
  }
  canvas.width = width;
  canvas.height = Math.floor(width * 9 / 16);
  let imagePromise = createImageBitmap(lastImage);
  imagePromise.then((image) => {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  });
}

// function redraw() {

//   events.forEach((evnt) => {
//     ctx.beginPath();
//     ctx.moveTo(evnt.from.x, evnt.from.y);
//     ctx.lineTo(evnt.to.x, evnt.to.y);
//     ctx.stroke();
//   });
// }

main();
