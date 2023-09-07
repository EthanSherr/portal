import fs from 'fs'
import pem, { CertificateCreationResult } from 'pem'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export const httpsKeyFromStoreOrCert = async () => {
  const file = './out/pem.json'
  const jsonStr = (await readFile(file).catch(e => {
    console.error(e)
    return null
  }))?.toString()
  if (jsonStr) {
    return JSON.parse(jsonStr)
  }

  const pemObj = await httpsKeyCert()

  await writeFile('./out/pem.json', JSON.stringify(pemObj, null, 4), { encoding: 'utf-8' })
  await writeFile('./out/localhost.crt', pemObj.certificate, { encoding: 'utf-8' })

  return pemObj
}

const httpsKeyCert = async () => {
  const { clientKey, certificate, csr, serviceKey } = await new Promise<CertificateCreationResult>((res, rej) =>
    pem.createCertificate({
      days: 60,
      selfSigned: true,
    }, (err, keys) =>
      err ? rej(err) : res(keys)
    ))

  return {
    clientKey,
    certificate,
    csr,
    serviceKey
  }
}