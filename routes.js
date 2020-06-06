const crypto = require('crypto');

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const circularReplacer = require('./helpers/circular');
const DrawingChannel = require('./classes/DrawingChannel');

module.exports = (drawingMap) => {
  router.get('/new', function(req, res, next) {
    let key = req.signedCookies.key || null;
    if (!key) {
      key = uuidv4();
      res.cookie('key', key, { signed: true });
    }
    let seed = JSON.stringify(req, circularReplacer) + Date.now().toString();
    let id = crypto.createHash('sha512').update(seed, 'utf8').digest().toString('hex').split('').slice(0, 10).join('');
    drawingMap.set(id, new DrawingChannel(key));
    res.redirect(303, `/draw/${id}`);
    next();
  });

  router.get('/draw/:id', function(req, res, next) {
    let id = req.params.id;
    let key = req.signedCookies.key || null;

    if (key && drawingMap.get(id).key === key) {
      res.render('draw.html', { key, drawingId: id });
    } else {
      res.redirect(303, '/new');
    }
    next();
  });

  router.get('/view/:id', function(req, res, next) {
    let id = req.params.id;

    if (drawingMap.has(id)) {
      res.render('view.html', { drawingId: id });
    } else {
      res.redirect(303, '/');
    }
    next();
  });

  return router;
}
