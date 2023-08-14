import express from 'express'
import https from 'https'
import http from 'http'
import path from 'path'

import { createSocketIOServer } from './io/createSocketIOServer'
import { httpsKeyFromStoreOrCert } from './httpsKeyFromStoreOrCert'

const PORT = 4000

const main = async () => {
  const app = express()
  const isHttpsServer = false

  let server: http.Server | https.Server
  if (isHttpsServer) {
    const { clientKey, certificate, csr, serviceKey } = await httpsKeyFromStoreOrCert()

    server = https.createServer({ key: clientKey, cert: certificate }, app)
  } else {
    server = http.createServer(app)
  }

  createSocketIOServer(server)

  app.get('/', (_, res) => {
    res.sendFile(path.resolve('./public/index.html'));
  });

  server.listen(PORT, () => {
    console.log(`started on *:${PORT}`)
  })
}



main()