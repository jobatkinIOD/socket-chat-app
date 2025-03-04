const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

const clientNames = new Map(); // tracks all the current clients with their nicknames. convert to object before sending to clients

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('new user', () => {
        clientNames.set(socket.id, "someone");
        socket.emit('new user', {nickname: null, text: 'hello and welcome to this chat!', allUsers: Object.fromEntries([...clientNames])}) // send to only the initiating socket
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // sends latest chat message to all connected sockets
        io.emit('not typing', '') // sends to everyone that no-one is typing right now, so it clears out 'xxx is typing'
    });

    socket.on('choose name', (name) => {
        clientNames.set(socket.id, name); // stores the name against their socket id
        socket.broadcast.emit('new user', {nickname: name, text: 'has joined the chat', allUsers: Object.fromEntries([...clientNames])}) // sends new user event to all but the initiating socket
    });    

    socket.on('typing', (name) => {
        socket.broadcast.emit('user typing', name) // sends to all but the initiating socket which user is typing
        socket.emit('not typing', '') // sends to the initiating socket/client, so it doesn't show '(self) is typing'
    })

    socket.on('not typing', (name) => {
        socket.broadcast.emit('not typing', name) // sends to all but the initiating socket which user has stopped typing
    })    

    socket.on('disconnect', () => {
        const name = clientNames.has(socket.id) ? clientNames.get(socket.id) : "someone";
        clientNames.delete(socket.id);
        socket.broadcast.emit('disconnected', {nickname: name, text: 'has left the chat', allUsers: Object.fromEntries([...clientNames])}) // sends disconnected event to all but the initiating socket
    })
});  

server.listen(3000, () => {
  console.log("listening on *:3000");
});
