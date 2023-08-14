import express from 'express'
import https from 'https'
import http from 'http'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)

import { createSocketIOServer } from './createSocketIOServer'
import pem, { CertificateCreationResult } from 'pem'

const PORT = 4000

const main = async () => {
  const app = express()
  const isHttpsServer = true

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

const readFile = promisify(fs.readFile)

const httpsKeyFromStoreOrCert = async () => {
  const file = './out/pem.json'
  const jsonStr = (await readFile(file)).toString()
  if (jsonStr) {
    return JSON.parse(jsonStr)
  }

  const pemObj = await httpsKeyCert()

  await writeFile('./out/pem.json', JSON.stringify(pemObj, null, 4), { encoding: 'utf-8' })

  return pemObj
}

const httpsKeyCert = async () => {
  const { clientKey, certificate, csr, serviceKey } = await new Promise<CertificateCreationResult>((res, rej) => pem.createCertificate({ days: 60, selfSigned: true, organization: 'ethan-is-cool', commonName: 'ethans-portal' }, (err, keys) => {
    if (err) {
      rej(err)
      return
    }
    res(keys)
  }))

  return {
    clientKey,
    certificate,
    csr,
    serviceKey
  }
}

main()