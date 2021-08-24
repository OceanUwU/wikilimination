const express = require('express');
const fetch = require('fetch');
const Game = require('./game');
const http = require('http');
var app = express();
var server = http.createServer(app);
const cfg = require('./cfg.json');
var io = new (require('socket.io').Server)(server);

app.use(express.static('public'));

server.listen(cfg.port, () => {
    console.log(`Server started on port ${cfg.port}!`);
});

io.on('connection', socket => {

});

var games = {};