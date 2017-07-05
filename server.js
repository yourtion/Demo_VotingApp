'use strict';
require('babel-register');

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const swig = require('swig');
const React = require('react');
const ReactDOM = require('react-dom/server');
const Router = require('react-router');
const routes = require('./app/routes');
const app = express();
// eslint-disable-next-line
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mongoose = require('mongoose');
const config = require('./config');

mongoose.Promise = global.Promise;

const RouterContext = require('react-router').RouterContext;

app.set('port', process.env.PORT || 3000);
if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

require('./api/characters')(app);
require('./api/report')(app);
require('./api/stats')(app);

app.use(function (req, res) {
  Router.match({ routes: routes.default, location: req.url }, function (err, redirectLocation, renderProps) {
    if (err) {
      res.status(500).send(err.message);
    } else if (redirectLocation) {
      res.status(302).redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      const html = ReactDOM.renderToString(React.createElement(RouterContext, renderProps));
      const page = swig.renderFile('views/index.html', { html });
      res.status(200).send(page);
    } else {
      res.status(404).send('Page Not Found');
    }
  });
});

let onlineUsers = 0;

io.on('connection', function (socket) {
  onlineUsers += 1;

  socket.emit('onlineUsers', { onlineUsers });
  socket.broadcast.emit('onlineUsers', { onlineUsers });

  socket.on('disconnect', function () {
    onlineUsers -= 1;
    socket.broadcast.emit('onlineUsers', { onlineUsers });
  });
});

mongoose.connect(config.database, function (err) {
  if(err) {
    // eslint-disable-next-line
    console.log(`Connecte error: ${config.database}`);
    // eslint-disable-next-line
    console.error(err);
    process.exit(-1);
  }
  // eslint-disable-next-line
  console.log(`Connected: ${config.database}`);
  server.listen(app.get('port'), function () {
    // eslint-disable-next-line
    console.log('Express server listening on port ' + app.get('port'));
  });
});
