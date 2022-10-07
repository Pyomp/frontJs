import { Test } from '../../modules/test/Test.js'
import { fileURLToPath, parse } from 'url'
import { rmSync } from 'fs'
import { DatabaseClients } from '../../modules/communication/server/DatabaseClients.js'
import { WebSocketServerManager } from '../../modules/communication/server/WebSocketServerManager.js'
import { BetterSqlite3 } from '../../modules/communication/server/databaseFacades/BetterSqlite3.js'
import express from 'express'
import { authProviders } from '../../modules/communication/server/authProvider/authProviders.js'
import { WebSocketServer } from 'ws'
import { PORT } from './config.js'

class AppData {
    pingNumber = 0

    toArray() {
        return [
            this.pingNumber
        ]
    }

    fromArray(array) {
        if (array?.constructor !== Array) return
        this.pingNumber = array[0]
    }
}

communicationTest()
export function communicationTest() {
    const databasePath = fileURLToPath(new URL('./main.db', import.meta.url))

    try { rmSync(databasePath) } catch { }

    const db = new DatabaseClients(new BetterSqlite3(databasePath, ['twitch', 'discord', 'google']))

    const wsManager = initWebsocketManager(db)

    const app = initExpress()
    const server = app.listen(PORT, () => { console.log('\x1b[36m%s\x1b[0m', `http://localhost:${PORT}/`) })
    initWebsocketServer(server, wsManager)
}

function initWebsocketManager(db) {
    const wsManager = new WebSocketServerManager(db, AppData)

    wsManager.addRoute('ping', (client, payload, appData) => {
        appData.pingNumber++
        return 'pong'
    })

    wsManager.addRoute(1, (client, payload, appData) => {
        client.send(payload)
    })

    return wsManager
}

function initExpress() {
    const app = express()

    app.use(express.static(fileURLToPath(new URL('../..', import.meta.url))))

    app.get('/', (req, res) => {
        res.redirect('tests/communication/index.html')
    })
    app.get('/twitch//', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(authProviders.htmls.twitch, 'utf-8')
    })
    app.get('/discord//', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(authProviders.htmls.discord, 'utf-8')
    })
    app.get('/google//', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(authProviders.htmls.google, 'utf-8')
    })
    return app
}

function initWebsocketServer(server, wsManager) {
    const webSocketServer = new WebSocketServer({ noServer: true })
    const wsRoutes = {
        '/api': (request, socket, head) => {
            webSocketServer.handleUpgrade(request, socket, head, (websocket) => {
                wsManager.onConnection(websocket)
            })
        }
    }

    server.on('upgrade', function (request, socket, head) {
        const { pathname } = parse(request.url)

        const callback = wsRoutes[pathname]
        if (callback) callback(request, socket, head)
        else socket.destroy()
    })
}