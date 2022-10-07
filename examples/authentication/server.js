import { WebSocketServer } from 'ws'
import { WebSocketServerManager } from '../../modules/communication/server/WebSocketServerManager.js'
import { createServer } from 'http'
import fs from 'fs'
import { extname } from 'path'
import { fileURLToPath } from 'url'

process.chdir(fileURLToPath(new URL('../..', import.meta.url)))

const webSocketServer = new WebSocketServer({ noServer: true })

const googleHTML = fs.readFileSync(new URL('../../modules/communication/providerAuthentication/redirectViews/google.html', import.meta.url))
const indexHTML = fs.readFileSync(new URL('./index.html', import.meta.url))
const server = createServer((req, res) => {
    if (req.url === '/ws') {
        webSocketServer.handleUpgrade(req, req.socket, req.headers, (ws, request) => {
            webSocketServer.emit('connection', ws, request)
        })
    } else if (req.url === '/google/') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(googleHTML, 'utf-8')
    } else if (req.url === '/') {
        res.writeHead(302, { 'Location': './examples/websocket/index.html' })
        res.end()
    } else {
        const filePath = '../../' + req.url
        const extension = String(extname(filePath)).toLowerCase()
        const contentType = mimeTypes[extension] || 'application/octet-stream'
        fs.readFile(new URL(filePath, import.meta.url), (error, content) => {
            if (error !== null) {
                res.writeHead(404).end('404')
            } else {
                res.writeHead(200, { 'Content-Type': contentType })
                res.end(content, 'utf-8')
            }
        })
    }
})

const websocketManager = new WebSocketServerManager()

webSocketServer.on('connection', websocketManager.onConnection)

server.listen(80)

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
}