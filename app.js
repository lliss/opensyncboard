const crypto = require('crypto');
const http = require('http');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nunjucks = require('nunjucks');

const indexRouter = require('./routes/index');
const socketRouter = require('./routes/sockets');
const serverFunctions = require('./helpers/serverFunctions');

const app = express();

const port = serverFunctions.normalizePort(process.env.PORT || '3000');
const address = process.env.ADDR || '127.0.0.1';

app.set('port', port);

const server = http.createServer(app);
require('express-ws')(app, server);

server.listen(port, address);

server.on('error', (error) => {
  serverFunctions.onError(error, port);
});

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log(`Listening on ${addr.address} ${bind}`);
});

nunjucks.configure('./views', {
  autoescape: true,
  express: app
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let cookiePassword = crypto.createHash('sha512').update(crypto.randomBytes(30)).digest().toString('hex');
app.use(cookieParser(cookiePassword));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/socket', socketRouter(express));

app.locals.drawings = {};
