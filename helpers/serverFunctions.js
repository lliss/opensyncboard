const url = require('url');

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error, port) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function prepareUpgrade(wsServers, drawingsMap, cookieParser) {
  return (req, socket, head) => {
    const pathname = url.parse(req.url).pathname;
    const pathComponents = pathname.split('/').filter((item) => item != '');
    if (pathComponents.length != 3) {
      socket.destroy();
      return;
    }

    let pathPrefix = '/' + pathComponents.slice(0, 2).join('/');
    let drawingId = pathComponents[2];
    let requestHeadersCopy = Object.assign({}, req.headers)
    let requestCopy = {headers: requestHeadersCopy};
    cookieParser(requestCopy, null, function noop() {});
    let key = requestCopy.signedCookies.key || null;

    if (pathPrefix in wsServers) {
      const wss = wsServers[pathPrefix];
      const connectionData = { key, id: drawingId, req, socket, head };
      upgradeConnectionIfAllowed(wss, drawingsMap, connectionData);
    } else {
      socket.destroy();
    }
  }
}

function upgradeConnectionIfAllowed(wss, map, connectionData) {
  if (wss.type === 'producer' && keyAndIdAreValid(map, connectionData.id, connectionData.key)) {
    wss.handleUpgrade(connectionData.req, connectionData.socket, connectionData.head, function done(ws) {
      ws.drawingId = connectionData.id;
      map.get(connectionData.id).setProducer(ws);
      wss.emit('connection', ws, connectionData.req);
    });
  } else if (wss.type === 'consumer') {
    wss.handleUpgrade(connectionData.req, connectionData.socket, connectionData.head, function done(ws) {
      map.get(connectionData.id).addConsumer(ws);
      wss.emit('connection', ws, connectionData.req);
    });
  } else {
    connectionData.socket.destroy();
  }
}

function keyAndIdAreValid(map, id, key) {
  return key !== null && map.has(id) && map.get(id).key === key;
}

module.exports = {
  onError,
  normalizePort,
  prepareUpgrade
};
