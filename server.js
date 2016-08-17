'use strict';

require('babel-register');

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const swig  = require('swig');
const React = require('react');
const ReactDOM = require('react-dom/server');
const Router = require('react-router');
const routes = require('./app/routes');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res) {
  Router.match({ routes: routes.default, location: req.url }, function(err, redirectLocation, renderProps) {
    if (err) {
      res.status(500).send(err.message)
    } else if (redirectLocation) {
      res.status(302).redirect(redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      const html = ReactDOM.renderToString(React.createElement(Router.RoutingContext, renderProps));
      const page = swig.renderFile('views/index.html', { html: html });
      res.status(200).send(page);
    } else {
      res.status(404).send('Page Not Found')
    }
  });
});

var onlineUsers = 0;

io.on('connection', function(socket) {
  onlineUsers++;
  console.log("111111---",onlineUsers);

  socket.emit('onlineUsers', { onlineUsers: onlineUsers });

  socket.on('disconnect', function() {
    onlineUsers--;
    socket.emit('onlineUsers', { onlineUsers: onlineUsers });
  });
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
