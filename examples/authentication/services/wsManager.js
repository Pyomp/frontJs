import { EventSet } from "../../../models/Events.js"

const serverUrl = `ws://localhost/ws`
const OpenTimeout = 10_000
const RequestTimeout = 10_000

export const WsAuthentication = 0
export const WsConnecting = 1
export const WsClose = 2
export const WsOpen = 3
export const WsAuthenticationFail = 4

let state = WsClose
const onState = new EventSet()
function setState(newState) {
    state = newState
    onState.emit()
}

const routes = {
    ping: () => { ws.sendRaw('pong') }
}

/** @type {WebSocket} */
let websocket = null
let messageId = 0

let currentProvider
let currentToken

let closeTimeout

const requestResolves = {}
const requestTimeout = {}

function onWebsocketClose() {
    clearTimeout(closeTimeout)
    websocket.onmessage = null
    websocket = null    
    setState(state === WsAuthentication ? WsAuthenticationFail : WsClose)
}

function connect(provider, token) {
    if (provider) currentProvider = provider
    if (token) currentToken = token
    if (state !== WsClose) throw new Error('websocket busy')
    if (!currentToken) throw new Error('no token provided')

    websocket = new WebSocket(serverUrl)
    websocket.binaryType = "arraybuffer"

    closeTimeout = setTimeout(() => { websocket.close(4408, 'websocket open timeout') }, OpenTimeout)

    websocket.onerror = (event) => { console.warn(event) }
    websocket.addEventListener('close', onWebsocketClose)
    websocket.onopen = () => {
        websocket.send(JSON.stringify({
            provider: currentProvider,
            token: currentToken
        }))
        setState(WsAuthentication)
    }
    websocket.onmessage = (e) => {
        clearTimeout(closeTimeout)
        websocket.onmessage = onWebsocketMessage
        if (e.data) onWebsocketMessage(e)
        setState(WsOpen)
        resolve(true)
    }
    setState(WsConnecting)

}
function close() {
    ws.autoReconnect = false
    websocket.close()
}

function request(command, payload) {
    if (websocket.readyState !== WebSocket.OPEN) return

    return new Promise((resolve, reject) => {
        const id = messageId++
        websocket.send(JSON.stringify({ id, cmd: command, payload: payload }))
        requestResolves[id] = resolve
        requestTimeout[id] = setTimeout(() => {
            delete requestResolves[id]
            delete requestTimeout[id]
            reject(new Error('timeout'))
        }, RequestTimeout)
    })
}
function send(command, data) {
    if (websocket.readyState === WebSocket.OPEN)
        websocket.send(JSON.stringify({ cmd: command, data: data }))
}
function sendRaw(payload) {
    if (websocket.readyState === WebSocket.OPEN)
        websocket.send(payload)
}
function addRoute(command, callback) {
    if (routes[command])
        throw new Error(`Command "${command}" already exist.`)

    routes[command] = callback
}


function onWebsocketMessage(e) {
    const data = e.data
    if (data.constructor === String) {
        onStringMessage(data)
    } else {
        onBufferMessage(data)
    }
}

function onStringMessage(data) {
    try {
        const parsed = JSON.parse(data)
        const messageId = parsed.id
        if (messageId !== undefined) {
            const resolve = requestResolves[messageId]
            if (resolve !== undefined) {
                resolve(parsed.data)
                delete requestResolves[messageId]
            }
        } else {
            const callback = routes[data.cmd]
            if (callback === undefined) {
                console.warn(new Error(`callback undefined cmd: ${data.cmd}`))
            } else {
                callback(data.payload)
            }
        }
    } catch (e) { console.warn(e) }
}

function onBufferMessage(buffer) {
    const view = new DataView(buffer)
    const cmd = view.getUint16(0)
    const cb = routes[cmd]
    if (cb) {
        cb(view)
    } else {
        console.warn(new Error(`callback undefined cmd: ${cmd}`))
    }
}

export const ws = {
    get state() { return state },

    onState,

    connect,
    close,
    request,
    send,
    sendRaw,

    addRoute,
}