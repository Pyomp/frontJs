import { WebSocketServer } from "ws"

export const wsTestServer = {
    connectionListeners: new Set(),
    dispatcher: {    },
    /** @type {import('ws').WebSocket} */ client: null,
    init(server) {
        const wss = new WebSocketServer({ noServer: true })

        wss.on('connection', (ws, request) => {
            for (const callback of wsTestServer.connectionListeners) callback()
            wsTestServer.client?.close(3456, 'new client')
            wsTestServer.client = ws
            ws.on('message', (event) => {
                try {
                    const message = JSON.parse(event.toString())
                    this.dispatcher[message.command]?.(message.data)
                } catch { }
            })
        })

        server.on('upgrade', function (request, socket, head) {
            wss.handleUpgrade(request, socket, head, function (ws) {
                wss.emit('connection', ws, request)
            })
        })
    }
}
