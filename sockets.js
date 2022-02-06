const WebSocket = require('ws');
const constants = require('./constants');

function heartbeat() {
  this.isAlive = true;
}

function terminateIfNotAlive(ws) {
  if (ws.isAlive === false) {
    return ws.terminate();
  }
  ws.isAlive = false;
  ws.ping();
}

module.exports = (map) => {
  let drawInterval;
  let watchInterval;

  const drawWss = new WebSocket.Server({ noServer: true });
  const watchWss = new WebSocket.Server({ noServer: true });

  drawWss.type = 'producer';
  watchWss.type = 'consumer';

  drawWss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    const drawingChannel = map.get(ws.drawingId);
    map.get(ws.drawingId).alertProducerOfActiveConsumers();
    drawingChannel.sendMessageObjectToConsumers({
      type: 'producer_status_change',
      status: 'open'
    });

    ws.on('close', () => {
      map.get(ws.drawingId).clearEvents();
      drawingChannel.sendMessageObjectToConsumers({ type: 'clear' });
      drawingChannel.sendMessageObjectToConsumers({
        type: 'producer_status_change',
        status: 'closed'
      });
    });

    ws.on('message', (msg) => {
      const msgObject = JSON.parse(msg);
      drawingChannel.addEvent(msgObject);
      drawingChannel.sendMessageObjectToConsumers(msgObject);
    });
  });

  watchWss.on('connection', (ws) => {
    let drawer = map.get(ws.drawingId);
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    drawer.alertProducerOfActiveConsumers();

    ws.on('close', () => {
      drawer.alertProducerOfActiveConsumers();
      drawer.cleanupConsumer(ws);
    });

    ws.send(JSON.stringify({
      type: 'sync',
      events: drawer.getEvents()
    }));

  });

  watchInterval = setInterval(() => {
    watchWss.clients.forEach(terminateIfNotAlive);
    let watchers = 0;
    watchWss.clients.forEach((_) => ++watchers);
  }, constants.PING_INTERVAL);

  drawInterval = setInterval(() => {
    drawWss.clients.forEach(terminateIfNotAlive);
    let drawers = 0;
    drawWss.clients.forEach((_) => ++drawers);
  }, constants.PING_INTERVAL);

  watchWss.on('close', function close() {
    clearInterval(watchInterval);
  });

  drawWss.on('close', function close() {
    clearInterval(drawInterval);
  });

  let socketServers = {};
  socketServers[constants.DRAW_SOCKET_PATH_PREFIX] = drawWss;
  socketServers[constants.WATCH_SOCKET_PATH_PREFIX] = watchWss;

  return socketServers;
}
