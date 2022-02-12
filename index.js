const crypto = require('crypto');
const http = require('http');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nunjucks = require('nunjucks');

const constants = require('./constants');
const indexRouter = require('./routes');
const prepareSockets = require('./sockets');
const serverFunctions = require('./helpers/serverFunctions');

const app = express();
const server = http.createServer(app);

const port = serverFunctions.normalizePort(process.env.PORT || constants.DEFAULT_PORT);
const address = process.env.ADDR || '127.0.0.1';
const drawingsMap = new Map();
const socketServers = prepareSockets(drawingsMap);

const cookiePassword = crypto.createHash('sha512').update(crypto.randomBytes(30)).digest().toString('hex');
const cp = cookieParser(cookiePassword)

function setupExpress() {
  app.set('port', port);
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(cp);

  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', indexRouter(drawingsMap));
}

function setupServer() {
  server.listen(port, address);

  server.on('error', (error) => {
    serverFunctions.onError(error, port);
  });

  server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log(`Listening on ${addr.address} ${bind}`);
  });

  server.on('upgrade', serverFunctions.prepareUpgrade(socketServers, drawingsMap, cp));
}

function cleanupOldDrawingChannels() {
  console.log(`MAP has ${drawingsMap.size} items BEFORE cleanup.`);
  for (let entry of drawingsMap.entries()) {
    const channel = entry[1];
    if (Date.now() - channel.getLastMessageTime() > constants.ONE_DAY_IN_MS && !channel.hasLivingSocket()) {
      drawingsMap.delete(entry[0]);
    }
  }
  console.log(`MAP has ${drawingsMap.size} items AFTER cleanup.`);
}

function main() {
  setupExpress();
  setupServer();

  nunjucks.configure('./views', {
    autoescape: true,
    express: app
  });

  setInterval(cleanupOldDrawingChannels, constants.ONE_DAY_IN_MS);
}

main();
