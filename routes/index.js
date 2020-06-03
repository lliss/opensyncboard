const crypto = require('crypto');

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const circularReplacer = require('../helpers/circular');

router.get('/new', function(req, res, next) {
  let key = req.signedCookies.key || null;
  if (!key) {
    key = uuidv4();
    res.cookie('key', key, { signed: true });
  }
  let seed = JSON.stringify(req, circularReplacer) + Date.now().toString();
  let id = crypto.createHash('sha512').update(seed, 'utf8').digest().toString('hex').split('').slice(0, 10).join('');
  console.log(id);
  req.app.locals.drawings[id] = key;
  res.redirect(`/draw/${id}`, 303);
  next();
});

router.get('/draw/:id', function(req, res, next) {
  let id = req.params.id;
  let key = req.signedCookies.key || null;
  if (!key || req.app.locals.drawings[id] !== key) {
    res.redirect(303, '/new');
    next();
    return;
  }

  console.log(req.app.locals.drawings);
  res.render('draw.html', { key });
  next();
});

module.exports = router;
