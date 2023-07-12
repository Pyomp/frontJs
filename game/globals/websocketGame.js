import { EventSet } from "../../modules/utils/EventSet.js"
import { providersToken } from "../services/serviceAuth/providersToken.js"

const TIMEOUT_REQUEST = 5_000
const TIMEOUT_AUTHENTICATION = 20_000

const CLOSE = 0
const READY = 1
const CONNECTING = 2
const AUTHENTICATING = 3

const binaryDispatcher = {}
const jsonDispatcher = { [1]: (data) => { console.log(data) } }

/** @type {WebSocket} */
let ws

let gameFrameView = new DataView(new ArrayBuffer(0))
let lastGameFrameUpdate = 0

const onStatus = new EventSet()

const requests = {}
function addRequest(id, cmd) {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            requests[id]
            console.warn(`ws request timeout, command: ${cmd}`)
        }, TIMEOUT_REQUEST)

        requests[id] = (data) => {
            clearTimeout(timeout)
            resolve(data)
            delete requests[id]
        }
    })
}

let status = CLOSE
function setStatus(newStatus) {
    status = newStatus
    websocketGame.onStatus.emit()
}

function sendBuffer(buffer) {
    if (status !== READY) return
    ws.send(buffer)
}

function request(cmd, data, id) {
    if (status !== READY) return
    ws.send(JSON.stringify({ cmd, payload: data, id }))
    return addRequest(id, cmd)
}

function send(cmd, data) {
    if (status !== READY) return
    ws.send(JSON.stringify({ cmd, payload: data }))
}

function close(reason) {
    ws.close(4000, reason)
}

let isAuthenticated = false
let providerNameSaved
let providerTokenSaved
let urlSaved

function onMessage(event) {
    const data = event.data
    try {
        if (data.constructor === ArrayBuffer) {
            onBinaryMessage(data)
        } else {
            onStringMessage(data)
        }
    } catch (e) {
        console.warn(e)
    }
}

function onBinaryMessage(data) {
    const view = new DataView(data)
    if (view.getUint8(0) === 0) {
        lastGameFrameUpdate = performance.now()
        gameFrameView = view
    } else {
        const totalLength = view.byteOffset + view.byteLength
        let cursor = view.byteOffset + 1
        while (cursor < totalLength) {
            const command = view.getUint16(cursor, true)
            cursor += 2

            cursor = binaryDispatcher[command]?.(view, cursor)
        }
    }
}

function onStringMessage(data) {
    const json = JSON.parse(data)
    if (json.id) {
        requests[json.id](json.data)
    } else {
        jsonDispatcher[json.cmd](json.data)
    }
}

function onOpen() {
    console.log('Connected to the server, authentication...')

    const closeTimeout = setTimeout(() => {
        ws.close()
        location.reload()
    }, TIMEOUT_AUTHENTICATION)

    setStatus(AUTHENTICATING)

    ws.send(JSON.stringify({ provider: providerNameSaved, token: providerTokenSaved }))

    ws.addEventListener('message', () => {
        clearTimeout(closeTimeout)
        isAuthenticated = true
        setStatus(READY)
        console.log('Authentication success!')
    }, { once: true })
}

function onClose(event) {
    isAuthenticated = false
    setStatus(CLOSE)
    if (event.reason === 'new connection') {
        console.log('New Connection, game will be reload in 3s...')
        setTimeout(() => { location.reload() }, 3000)
    } else if (event.reason === 'authentication fail') {
        providersToken.clearLocalStorage()
        console.warn('Authentication fail, game will be reload in 3s...')
        setTimeout(() => { location.reload() }, 3000)
    } else {
        console.log('Connection fail.')
        setTimeout(() => { connect() }, 1000)
    }
}

function connect(providerName, providerToken, url) {
    if (providerName) providerNameSaved = providerName
    if (providerToken) providerTokenSaved = providerToken
    if (url) urlSaved = url

    setStatus(CONNECTING)

    ws = new WebSocket(urlSaved)
    ws.binaryType = "arraybuffer"

    ws.addEventListener('message', onMessage)
    ws.addEventListener('close', onClose)
    ws.addEventListener('open', onOpen)
}

export const websocketGame = {
    CLOSE,
    READY,
    CONNECTING,
    AUTHENTICATING,

    get gameFrameView() { return gameFrameView },
    get lastGameFrameUpdate() { return lastGameFrameUpdate },

    get jsonDispatcher() { return jsonDispatcher },
    get binaryDispatcher() { return binaryDispatcher },

    get onStatus() { return onStatus },
    get status() { return status },

    sendBuffer,
    request,
    send,
    close,
    connect,
}
