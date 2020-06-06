const WebSocket = require('ws');

const constants = require('./constants');

module.exports = (map) => {
  const drawWss = new WebSocket.Server({ noServer: true });
  const watchWss = new WebSocket.Server({ noServer: true });
  drawWss.type = 'producer';
  watchWss.type = 'consumer';

  drawWss.on('connection', function connection(ws) {
    ws.on('message', function(msg) {
      console.log('draw', msg, ws.drawingId);
      map.get(ws.drawingId).consumers.forEach((consumerWs) => {
        if (consumerWs.readyState === WebSocket.OPEN) {
          consumerWs.send(msg);
        }
      });
    });
  });

  watchWss.on('connection', function connection(ws) {
    ws.on('message', function(msg) {
      console.log(msg);
    });
  });

  let socketServers = {};
  socketServers[constants.DRAW_SOCKET_PATH_PREFIX] = drawWss;
  socketServers[constants.WATCH_SOCKET_PATH_PREFIX] = watchWss;

  return socketServers;
}
