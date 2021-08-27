const express = require('express');
const Game = require('./game');
const http = require('http');
var app = express();
var server = http.createServer(app);
const cfg = require('./cfg.json');
var io = new (require('socket.io').Server)(server);
const codeLength = 4;
const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

app.use(express.static('public'));

server.listen(cfg.port, () => {
    console.log(`Server started on port ${cfg.port}!`);
});

io.on('connection', socket => {
    socket.on('create', () => {
        if (!socket.game) {
            let code;
            do {
                code = '';
                for (let i = 0; i < codeLength; i++)
                    code += codeChars[Math.floor(Math.random() * codeChars.length)];
            } while (games.hasOwnProperty(code))
            
            let game = new Game(code);
            games[code] = game;
    
            game.join(socket);

            //delete the game in like 4 hours lol
            setTimeout(() => {
                delete games[code];
                for (let i of game.connected)
                    i.disconnect();
            }, 1000 * 60 * 60 * 4);
        }
    });

    socket.on('join', code => {
        if (!socket.game && games.hasOwnProperty(code)) {
            let game = games[code];
            if (game.connected.length >= 2)
                socket.emit('err', 'This game is full!');
            else
                game.join(socket);
        } else
            socket.emit('err', 'Could not find a game with that code.');
    });

    socket.on('flip', pos => {
        pos = Number(pos);
        if (socket.game && socket.game.flipped[socket.place].hasOwnProperty(pos)) {
            socket.game.flipped[socket.place][pos] = !socket.game.flipped[socket.place][pos];
            socket.game.emit('flip', socket.place, pos, socket.game.flipped[socket.place][pos]);
        }
    });

    socket.on('disconnect', () => {
        if (socket.game)
            socket.game.leave(socket);
    });
});

var games = {};