import constants from './constants.mjs';
import DrawingSurface from './DrawingSurface.mjs';
import * as drawHelpers from './drawHelpers.mjs';

let surface = null;
let events = [];
let statusChangeTimer = null;
let heartbeatInterval;
const socket = new WebSocket(`${constants.SOCKET_VIEW_BASE_URL}/${drawingId}`);

function main() {
  surface = new DrawingSurface('#syncboard', '2d');
  surface.resetCanvasSize();
  attachEventListeners();

  socket.addEventListener('close', function (evnt) {
    console.log('CLOSE');
    setInactiveConnectionMessage();
    clearInterval(heartbeatInterval);
  });

  socket.addEventListener('error', function (evnt) {
    console.log('ERROR');
    setInactiveConnectionMessage();
  });

  socket.addEventListener('open', function (evnt) {
    console.log('CONNECTED');
    setActiveConnectionMessage();
    startHeartbeat();
  });

  socket.addEventListener('message', function (evnt) {
    let eventData = null;
    try {
      eventData = JSON.parse(evnt.data);
    } catch (e) {
      console.error(`Error: ${e.message}`);
      console.error(`Data: ${evnt.data}`);
    }
    if (eventData) {
      handleIncomingEvent(eventData);
    }
  });
}

function setActiveConnectionMessage() {
  const el = document.querySelector('#session-status p');
  el.textContent = 'active connection';
  el.classList.add('active');
  el.classList.remove('inactive');
}

function setInactiveConnectionMessage() {
  let el = document.querySelector('#session-status p');
  el.textContent = 'inactive connection';
  el.classList.add('inactive');
  el.classList.remove('active');
}

function handleIncomingEvent(eventData) {
  switch (eventData.type) {
    case constants.DRAW_EVENT_TYPE_SYNC:
      events = eventData.events;
      drawHelpers.redraw(events, surface);
      break;

    case constants.DRAW_EVENT_TYPE_CLEAR:
      surface.clear();
      events = [];
      break;

    case constants.PRODUCER_EVENT_STATUS_CHANGE:
      updateSessionConnectionMessage(eventData);
      break;

    default:
      drawHelpers.routeDrawEvent(eventData, surface);
      events.push(eventData);
  }
}

function updateSessionConnectionMessage(sessionStatusMessage) {
  if (sessionStatusMessage.status === 'closed') {
    statusChangeTimer = setTimeout(() => {
      setInactiveConnectionMessage();
    }, 3000)
  } else {
    clearTimeout(statusChangeTimer);
    setActiveConnectionMessage();
  }
}

function attachEventListeners() {
  window.addEventListener('resize', (evnt) => {
    surface.resetCanvasSize();
    drawHelpers.redraw(events, surface);
  });
}

function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    socket.send(JSON.stringify({ type: constants.EVENT_TYPE_HEARBEAT }));
  }, constants.HEARTBEAT_INTERVAL);
}

main();
