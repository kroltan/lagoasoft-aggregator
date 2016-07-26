"use strict";
const express = require('express');
let router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
    res.render('index', { title: 'Lagoasoft Aggregator' });
});

module.exports = router;
