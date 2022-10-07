import express from 'express'
import fs from 'fs'
import { fileURLToPath, parse } from 'url'
import { WebSocketServer } from 'ws'

import physicsExemple from '../physics/server/main.js'

const app = express()
const PORT = 80

// listen the whole project
app.use(express.static(fileURLToPath(new URL('../..', import.meta.url))))

app.get('/', (req, res) => {
    res.redirect('examples/physics/client/index.html')
})

const twitchHTML = fs.readFileSync(new URL('../../modules/communication/providerAuthentication/redirectViews/twitch.html', import.meta.url))
app.get('/twitch//', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(twitchHTML, 'utf-8')
})
const discordHTML = fs.readFileSync(new URL('../../modules/communication/providerAuthentication/redirectViews/discord.html', import.meta.url))
app.get('/discord//', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(discordHTML, 'utf-8')
})

const googleHTML = fs.readFileSync(new URL('../../modules/communication/providerAuthentication/redirectViews/google.html', import.meta.url))
app.get('/google//', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(googleHTML, 'utf-8')
})

const webSocketServer = new WebSocketServer({ noServer: true })

// the dispatcher to use different websocket managers
const wsRoutes = {

    '/physics': (request, socket, head) => {
        webSocketServer.handleUpgrade(request, socket, head, (websocket) => {
            physicsExemple.onConnection(websocket)
        })
    }
    
}

// app.on('upgrade', (request, socket, head) => {
//     const { pathname } = parse(request.url)

//     const callback = wsRoutes[pathname]
//     if (callback) callback()
//     else socket.destroy()
// })

const server = app.listen(PORT, () => {
    console.log('\x1b[36m%s\x1b[0m', `http://localhost:${PORT}/`)
})

server.on('upgrade', function (request, socket, head) {
    const { pathname } = parse(request.url)

    const callback = wsRoutes[pathname]
    if (callback) callback(request, socket, head)
    else socket.destroy()
})