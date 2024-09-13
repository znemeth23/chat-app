const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const pdp = path.join(__dirname, '../public');

app.use(express.static(pdp));

io.on('connection', (socket) => {
    console.log('New websuckit connection!');

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username: username,
            room: room
        });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('message', generateMessage('ADMIN', 'Welcome [' + user.username + ']!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('ADMIN', `A new user called [${user.username}] has joined the party!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (msg, cb) => {
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, msg));
            cb('Surprise!');
        }
    });

    socket.on('sendLocation', (data, cb) => {
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('locationBroadcast', generateLocationMessage(user.username, data));
            cb();
        }
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('ADMIN', `[${user.username}] has left the party! :(`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port,() => {
    console.log('Server is UP on port ' + port);
});