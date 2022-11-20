import { EventSet } from "../../../models/Events.js"
import { logger } from "../../../services/logger/logger.js"
import { providersToken } from "../../authentication/services/providersToken.js"

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

export const ws = {
    CLOSE: 0,
    READY: 1,
    CONNECTING: 2,
    AUTHENTICATING: 3,

    data: new DataView(new ArrayBuffer(0)),
    dispatcher: { [1]: (data) => { logger.info.push(`Clicks: ${data?.clickNumber}`) } },

    onStatus: new EventSet(),
    get status() { return status },

    send(cmd, data, id) {
        if (status !== this.READY) return

        if (data.constructor === ArrayBuffer) {
            websocket.send(data)
        } else {
            websocket.send(JSON.stringify({
                cmd,
                payload: data,
                id
            }))

            if (id) return addRequest(id)
        }
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
            if (data.constructor === ArrayBuffer) {
                this.data = new DataView(data)
            } else {
                try {
                    const json = JSON.parse(data)
                    if (json.id) {
                        requests[id](json.data)
                    } else {
                        this.dispatcher[json.cmd](json.data)
                    }
                } catch (e) {
                    logger.warn.push(e)
                }
            }
        })

        websocket.addEventListener('close', (event) => {
            isAuthenticated = false
            setStatus(this.CLOSE)
            if (event.reason === 'new connection') {
                logger.system.push('New Connection, game will be reload in 3s...')
                setTimeout(() => { location.reload() }, 3000)
            } else if (event.reason === 'authentication fail') {
                providersToken.clearLocalStorage()
                logger.system.push('Authentication fail, game will be reload in 3s...')
                setTimeout(() => { location.reload() }, 3000)
            } else {
                logger.system.push('Connection fail.')
                setTimeout(() => { this.connect() }, 1000)
            }
        })

        websocket.addEventListener('open', () => {
            logger.system.push('Connected to the server, authentication...')

            const closeTimeout = setTimeout(() => { websocket.close(); location.reload() }, 20_000)
            setStatus(this.AUTHENTICATING)

            websocket.send(JSON.stringify({ provider: providerSaved, token: providerTokenSaved }))

            websocket.addEventListener('message', () => {
                clearTimeout(closeTimeout)
                isAuthenticated = true
                setStatus(this.READY)
                logger.system.push('Authentication success!')
            }, { once: true })
        })
    }
}

let status = ws.CLOSE
function setStatus(newStatus) {
    status = newStatus
    ws.onStatus.emit()
}