import http from 'node:http'
import { readFile, writeFile, rename, mkdir, stat } from 'node:fs/promises'
import { join, normalize, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))
const dataDir = join(rootDir, 'data')
const statePath = join(dataDir, 'state.json')
const port = Number(process.env.PORT) || 5317

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.py': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
}

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

const readBody = req => new Promise((resolve, reject) => {
  const chunks = []
  let size = 0
  req.on('data', chunk => {
    size += chunk.length
    if (size > 20 * 1024 * 1024) {
      reject(new Error('Body too large'))
      req.destroy()
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  req.on('error', reject)
})

let writeChain = Promise.resolve()

const writeStateAtomic = text => {
  writeChain = writeChain.then(async () => {
    await mkdir(dataDir, { recursive: true })
    const tempPath = `${statePath}.${process.pid}.${Date.now()}.tmp`
    await writeFile(tempPath, text, 'utf8')
    await rename(tempPath, statePath)
  }).catch(error => console.error('state write failed', error))
  return writeChain
}

const handleState = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const text = await readFile(statePath, 'utf8')
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end(text)
    } catch {
      sendJson(res, 200, null)
    }
    return
  }
  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const text = await readBody(req)
      const parsed = JSON.parse(text)
      await writeStateAtomic(JSON.stringify(parsed))
      sendJson(res, 200, { ok: true, updatedAt: parsed?.updatedAt ?? null })
    } catch (error) {
      sendJson(res, 400, { ok: false, error: String(error.message || error) })
    }
    return
  }
  sendJson(res, 405, { ok: false })
}

const serveStatic = async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = join(rootDir, safePath)
  if (!filePath.startsWith(rootDir) || safePath.includes('/data/') || safePath.startsWith('/data')) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  try {
    const info = await stat(filePath)
    if (info.isDirectory()) filePath = join(filePath, 'index.html')
    const body = await readFile(filePath)
    res.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    })
    res.end(body)
  } catch {
    if (!extname(urlPath)) {
      const body = await readFile(join(rootDir, 'index.html'))
      res.writeHead(200, { 'Content-Type': mimeTypes['.html'] })
      res.end(body)
      return
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/state')) return await handleState(req, res)
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405)
      res.end()
      return
    }
    await serveStatic(req, res)
  } catch (error) {
    console.error(error)
    if (!res.headersSent) res.writeHead(500)
    res.end('Server error')
  }
})

server.listen(port, () => {
  console.log(`\n  Google Cram  →  http://localhost:${port}\n`)
})
