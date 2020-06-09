import constants from './constants.mjs';
import * as drawHelpers from './drawHelpers.mjs';

let canvas = null;
let ctx = null;
let events = [];
const socket = new WebSocket(`${constants.SOCKET_VIEW_BASE_URL}/${drawingId}`);

function main() {
  ({ctx, canvas} = drawHelpers.initializeCanvas());
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
    let drawEvent = null;
    try {
      drawEvent = JSON.parse(evnt.data);
    } catch (e) {
      console.error(`Error: ${e.message}`);
      console.error(`Data: ${evnt.data}`);
    }
    if (drawEvent) {
      handleIncomingDrawEvent(drawEvent);
    }
  });
}

function handleIncomingDrawEvent(drawEvent) {
  switch (drawEvent.type) {
    case constants.DRAW_EVENT_TYPE_SYNC:
      events = drawEvent.events;
      drawHelpers.redraw(events, ctx, canvas);
      break;

    case constants.DRAW_EVENT_TYPE_SEGMENT:
      drawHelpers.drawSegment(drawEvent.event, ctx, canvas);
      events.push(drawEvent);
      break;

    case constants.DRAW_EVENT_TYPE_CIRCLE:
      drawHelpers.drawCircle(drawEvent.event, ctx, canvas);
      events.push(drawEvent);
      break;

    case constants.DRAW_EVENT_TYPE_CLEAR:
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      events = [];
      drawHelpers.redraw(events, ctx, canvas);
      break;

    default:
      // Noop
  }
}

function attachEventListeners() {
  window.addEventListener('resize', (evnt) => {
    drawHelpers.resetCanvasSize(canvas);
    drawHelpers.redraw(events, ctx, canvas);
  });
}

main();
