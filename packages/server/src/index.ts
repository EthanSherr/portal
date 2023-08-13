import express from 'express'
import https from 'https'
import http from 'http'
import path from 'path'
import { createSocketIOServer } from './createSocketIOServer'

const PORT = 4000

const main = async () => {
  // const server = https.createServer({
  //   key: fs.readFileSync('10.0.0.184-key.pem'),
  //   cert: fs.readFileSync('10.0.0.184.pem')
  // }, app)

  const app = express()
  // const httpsServer = https.createServer(app)
  const server = http.createServer(app)
  createSocketIOServer(server)

  app.get('/', (req, res) => {
    res.sendFile(path.resolve('./public/index.html'));
  });

  server.listen(PORT, () => {
    console.log(`started on *:${PORT}`)
  })
}

main()