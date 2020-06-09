const WebSocket = require('ws');

const constants = require('./constants');

module.exports = (map) => {
  const drawWss = new WebSocket.Server({ noServer: true });
  const watchWss = new WebSocket.Server({ noServer: true });
  drawWss.type = 'producer';
  watchWss.type = 'consumer';

  drawWss.on('connection', function connection(ws) {
    const drawingChannel = map.get(ws.drawingId);

    ws.on('close', () => {
      map.get(ws.drawingId).clearEvents();
      drawingChannel.sendMessageObjectToConsumers({ type: 'clear' });
    });

    ws.on('message', (msg) => {
      const msgObject = JSON.parse(msg);
      drawingChannel.addEvent(msgObject);
      drawingChannel.sendMessageObjectToConsumers(msgObject);
    });
  });

  watchWss.on('connection', (ws) => {
    // TODO show connection to drawer.
    // TODO show message to watcher.
    ws.send(JSON.stringify({
      type: 'sync',
      events: map.get(ws.drawingId).getEvents()
    }));
  });

  let socketServers = {};
  socketServers[constants.DRAW_SOCKET_PATH_PREFIX] = drawWss;
  socketServers[constants.WATCH_SOCKET_PATH_PREFIX] = watchWss;

  return socketServers;
}
