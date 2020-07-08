import constants from './constants.mjs';
import DrawingSurface from './DrawingSurface.mjs';
import * as drawHelpers from './drawHelpers.mjs';

let surface = null;
let events = [];
const socket = new WebSocket(`${constants.SOCKET_VIEW_BASE_URL}/${drawingId}`);

function main() {
  surface = new DrawingSurface('#syncboard', '2d');
  surface.resetCanvasSize();
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
      drawHelpers.redraw(events, surface);
      break;

    case constants.DRAW_EVENT_TYPE_CLEAR:
      surface.clear();
      events = [];
      break;

    default:
      drawHelpers.routeDrawEvent(drawEvent, surface);
      events.push(drawEvent);
  }
}

function attachEventListeners() {
  window.addEventListener('resize', (evnt) => {
    surface.resetCanvasSize();
    drawHelpers.redraw(events, surface);
  });
}

main();
