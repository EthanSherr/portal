import express from 'express'
import https from 'https'
import http from 'http'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
const readFile = promisify(fs.readFile)

import { createSocketIOServer } from './io/createSocketIOServer'
import { httpsKeyFromStoreOrCert } from './httpsKeyFromStoreOrCert'

const PORT = 4000

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

    console.log('key: ', key)
    console.log('cert: ', cert)

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

  app.get('/', (_, res) => {
    res.sendFile(path.resolve('./public/index.html'));
  });

  server.listen(PORT, () => {
    console.log(`started on *:${PORT}`)
  })
}



main()