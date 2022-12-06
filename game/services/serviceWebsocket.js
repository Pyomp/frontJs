import { EventSet } from "../../models/Events.js"
import { serviceLogger } from "./serviceLogger.js"
import { providersToken } from "./providersAuthentication/providersToken.js"

let providerSaved
let providerTokenSaved
let urlSaved

let isAuthenticated = false

/** @type {WebSocket} */
let websocket

const requests = {}
function addRequest(id) {
    return new Promise((resolve) => {
        const timeout = setTimeout(requests[id], 20_000)
        requests[id] = (data) => {
            clearTimeout(timeout)
            resolve(data)
            delete requests[id]
        }
    })
}

export const serviceWebsocket = {
    CLOSE: 0,
    READY: 1,
    CONNECTING: 2,
    AUTHENTICATING: 3,

    view: new DataView(new ArrayBuffer()),
    lastDataViewUpdate: 0,

    jsonDispatcher: { [1]: (data) => { console.log(data) } },
    binaryDispatcher: {},

    onStatus: new EventSet(),
    get status() { return status },

    sendBuffer(buffer) {
        if (status !== this.READY) return
        websocket.send(buffer)
    },

    send(cmd, data, id) {
        if (status !== this.READY) return

        websocket.send(JSON.stringify({
            cmd,
            payload: data,
            id
        }))

        if (id) return addRequest(id)
    },

    close(reason) {
        websocket.close(4000, reason)
    },

    connect(provider, providerToken, url) {
        if (provider) providerSaved = provider
        if (providerToken) providerTokenSaved = providerToken
        if (url) urlSaved = url

        websocket = new WebSocket(urlSaved)
        setStatus(this.CONNECTING)
        websocket.binaryType = "arraybuffer"

        websocket.addEventListener('message', (event) => {
            const data = event.data
            try {
                if (data.constructor === ArrayBuffer) {
                    const view = new DataView(data)
                    const isBufferFrame = view.getUint8(0, true) === 0
                    if (isBufferFrame) {
                        this.lastDataViewUpdate = performance.now()
                        this.view = view
                    } else {
                        const totalLength = view.byteOffset + view.byteLength
                        let cursor = view.byteOffset + 1
                        while (cursor < totalLength) {
                            const command = view.getUint16(cursor, true)
                            cursor += 2
                            cursor = this.binaryDispatcher[command]?.(view, cursor)
                        }
                    }
                } else {
                    const json = JSON.parse(data)
                    if (json.id) {
                        requests[id](json.data)
                    } else {
                        this.jsonDispatcher[json.cmd](json.data)
                    }
                }
            } catch (e) {
                serviceLogger.warn.push(e)
            }
        })

        websocket.addEventListener('close', (event) => {
            isAuthenticated = false
            setStatus(this.CLOSE)
            if (event.reason === 'new connection') {
                serviceLogger.system.push('New Connection, game will be reload in 3s...')
                setTimeout(() => { location.reload() }, 3000)
            } else if (event.reason === 'authentication fail') {
                providersToken.clearLocalStorage()
                serviceLogger.system.push('Authentication fail, game will be reload in 3s...')
                setTimeout(() => { location.reload() }, 3000)
            } else {
                serviceLogger.system.push('Connection fail.')
                setTimeout(() => { this.connect() }, 1000)
            }
        })

        websocket.addEventListener('open', () => {
            serviceLogger.system.push('Connected to the server, authentication...')

            const closeTimeout = setTimeout(() => { websocket.close(); location.reload() }, 20_000)
            setStatus(this.AUTHENTICATING)

            websocket.send(JSON.stringify({ provider: providerSaved, token: providerTokenSaved }))

            websocket.addEventListener('message', () => {
                clearTimeout(closeTimeout)
                isAuthenticated = true
                setStatus(this.READY)
                serviceLogger.system.push('Authentication success!')
            }, { once: true })
        })
    }
}

let status = serviceWebsocket.CLOSE
function setStatus(newStatus) {
    status = newStatus
    serviceWebsocket.onStatus.emit()
}