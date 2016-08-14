const Router = require('react-router');
const routes = require('./routes');
const render = require('react-dom');
const React = require('react');

React.render(<routes />, document.getElementById('app'))
// render(routes, document.getElementById('app'));
