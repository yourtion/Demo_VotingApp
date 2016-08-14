'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const swig  = require('swig');
const React = require('react');
import { renderToString } from 'react-dom/server'
const Router = require('react-router');
const routes = require('./app/routes');
import { render } from 'react-dom'

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res) {
  var html = renderToString(<routes />);
  console.log(html);
  var page = swig.renderFile('views/index.html', { html: html });
  res.send(page);
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
