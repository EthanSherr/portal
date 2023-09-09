import express from 'express'
import https from 'https'
import http from 'http'
import path from 'path'
import { readFile } from 'fs/promises'

import { createSocketIOServer } from './io/createSocketIOServer'
import { httpsKeyFromStoreOrCert } from './httpsKeyFromStoreOrCert'
import { fileURLToPath } from 'url'; // Import fileURLToPath to work with import.meta.url

const __filename = fileURLToPath(import.meta.url); // Get the current file's path
const __dirname = path.dirname(__filename); // Get the directory of the current file

const PORT = 443

const main = async () => {
  const app = express()
  const isHttpsServer = true

  let server: http.Server | https.Server
  if (isHttpsServer) {
    // const { clientKey: key, certificate: cert, csr, serviceKey } = await httpsKeyFromStoreOrCert()
    // console.log('start in https', { clientKey, certificate, csr, serviceKey })

    const [key, cert] = await Promise.all([
      readFile('./sec2/cert.key', { encoding: 'utf-8' }),
      readFile('./sec2/cert.crt', { encoding: 'utf-8' })
    ])

    server = https.createServer({
      key,
      cert,
      requestCert: false,
      rejectUnauthorized: false
    }, app)

  } else {
    server = http.createServer(app)
  }

  createSocketIOServer(server)

  app.use(express.static(path.join(__dirname, '../../web/build')))

  app.get('/', (req, res) => {
    res.sendFile(path.join(path.join(__dirname, '../../web/build/index.html')))
  })

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/build/index.html'));
  });

  server.listen(PORT, () => {
    console.log(`started on *:${PORT}`)
  })
}



main()