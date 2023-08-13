import { Server as SocketIOServer } from 'socket.io'
import express from 'express'
import fs from 'fs'
import https from 'https'
import http from 'http'
import { ExpressPeerServer } from 'peer'
import path from 'path'


const PORT = 4000

const main = async () => {
  // const server = https.createServer({
  //   key: fs.readFileSync('10.0.0.184-key.pem'),
  //   cert: fs.readFileSync('10.0.0.184.pem')
  // }, app)

  const app = express()
  const server = http.createServer(app)
  const io = new SocketIOServer(server)

  io.on('connection', (socket) => {
    // emit to all except this socket, i think
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  app.get('/', (req, res) => {
    res.sendFile(path.resolve('./public/index.html'));
  });

  server.listen(PORT, () => {
    console.log(`started on *:${PORT}`)
  })
}

main()