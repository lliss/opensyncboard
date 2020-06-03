const crypto = require('crypto');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nunjucks = require('nunjucks');

const indexRouter = require('./routes/index');

const app = express();

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

app.locals.drawings = {};

module.exports = app;
