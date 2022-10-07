import { EventSet } from '../../common/EventDispatcher.js'

const OPEN_TIMEOUT = 10_000
const REQUEST_TIMEOUT = 10_000
const RECONNECT_TIMEOUT = 2_000

const StateAuthentication = 0
const StateConnecting = 1
const StateClose = 2
const StateOpen = 3

export class WebSocketClientManager {

    // state
    static StateAuthentication = StateAuthentication
    static StateConnecting = StateConnecting
    static StateClose = StateClose
    static StateOpen = StateOpen
    state = StateClose

    // event
    onAuth = new EventSet()
    onConnecting = new EventSet()
    onAuthenticationFail = new EventSet()
    onClose = new EventSet()
    onOpen = new EventSet()

    // config
    autoReconnect = true

    //
    #routes = {
        ping: () => { this.sendRaw('pong') }
    }

    /** 
     * @param {function(DataView | {[key: string]: any}): void} callback
     */
    addRoute(command, callback) {
        if (this.#routes[command])
            throw new Error(`Command "${command}" already exist.`)

        this.#routes[command] = callback
    }



    // private
    /** @type {WebSocket} */
    #websocket
    #messageId = 0

    #serverUrl
    #currentProvider
    #currentToken

    #closeTimeout
    #reconnectTimeout

    constructor(serverUrl = 'ws://localhost/ws') {
        this.#serverUrl = serverUrl
    }

    #onWebsocketCloseBound = this.#onWebsocketClose.bind(this)
    #onWebsocketClose() {
        clearTimeout(this.#closeTimeout)
        if (this.state === StateAuthentication) {
            this.onAuthenticationFail.emit()
        }
        
        this.#websocket.onmessage = null
        this.#reconnectTimeout = setTimeout(() => {
            if (this.autoReconnect) {
                this.connect()
            }
        }, RECONNECT_TIMEOUT)

        this.state = StateClose
        this.onClose.emit()

    }

    connect(provider, token) {
        if (provider) this.#currentProvider = provider
        if (token) this.#currentToken = token

        if (this.state !== StateClose || !this.#currentToken) return

        // clear timeouts (safe)
        clearTimeout(this.#closeTimeout)
        clearTimeout(this.#reconnectTimeout)

        this.#websocket = new WebSocket(this.#serverUrl)

        this.#websocket.onerror = (event) => { console.warn(event) }

        // "websocket.onclose" have a weird behavior, so we use addEventListener
        this.#websocket.addEventListener('close', this.#onWebsocketCloseBound)

        // clear open timeout and emit open event
        this.#websocket.onopen = () => {
            this.#websocket.send(JSON.stringify({
                provider: this.#currentProvider,
                token: this.#currentToken
            }))
            this.state = StateAuthentication
            this.onAuth.emit()
        }

        // timeout if open websocket takes too long
        this.#closeTimeout = setTimeout(() => {
            this.#websocket.close()
        }, OPEN_TIMEOUT)

        this.#websocket.onmessage = (e) => {
            clearTimeout(this.#closeTimeout)
            this.#websocket.onmessage = this.#onWebsocketMessage.bind(this)
            if (e.data) this.#onWebsocketMessage(e)
            this.state = StateOpen
            this.onOpen.emit()
        }

        // emit connecting event
        this.state = StateConnecting
        this.onConnecting.emit()
    }

    #requestResolves = {}
    #requestTimeout = {}
    /**
     * The request will be JSON.stringify
     * @param {String | Number} command dispatch command
     * @param {any} payload 
     */
    request(command, payload) {
        if (this.#websocket.readyState !== WebSocket.OPEN) return

        return new Promise((resolve) => {
            const id = this.#messageId++
            this.#websocket.send(JSON.stringify({ id: id, cmd: command, payload: payload }))
            this.#requestResolves[id] = resolve
            this.#requestTimeout[id] = setTimeout(() => {
                delete this.#requestResolves[id]
                delete this.#requestTimeout[id]
                resolve(new Error('timeout'))
            }, REQUEST_TIMEOUT)
        })
    }

    sendRaw(payload) {
        if (this.#websocket.readyState === WebSocket.OPEN)
            this.#websocket.send(payload)
    }

    /**
    * The request will be `JSON.stringify`
    * @param {String | Number} command route command
    * @param {any} data 
    * @returns 
    */
    send(command, data) {
        if (this.#websocket.readyState === WebSocket.OPEN)
            this.#websocket.send(JSON.stringify({ cmd: command, data: data }))
    }

    dispose() {
        this.autoReconnect = false
        this.#websocket.close()
    }

    #onStringMessage(data) {
        try {
            const parsed = JSON.parse(data)
            const messageId = parsed.id
            if (messageId !== undefined) { // if it is a "response"
                const resolve = this.#requestResolves[messageId]
                if (resolve !== undefined) {
                    resolve(parsed.data)
                    delete this.#requestResolves[messageId]
                }
            } else { // else it is a "event" ( go through routes )
                const callback = this.#routes[data.cmd]
                if (callback === undefined) {
                    console.warn(new Error(`callback undefined cmd: ${data.cmd}`))
                } else {
                    callback(data.payload)
                }
            }
        } catch (e) { console.warn(e) }
    }

    #onBlobMessage(data) {
        data.arrayBuffer()
            .then((buffer) => {
                const view = new DataView(buffer)
                const cmd = view.getUint16(0)
                const cb = this.#routes[cmd]
                if (cb) {
                    cb(view)
                } else {
                    console.warn(new Error(`callback undefined cmd: ${cmd}`))
                }
            })
            .catch(e => console.warn(e))
    }

    #onWebsocketMessage(e) {
        const data = e.data
        if (data.constructor === String) {
            this.#onStringMessage(data)
        } else {
            // blob "event" ( go through routes )
            this.#onBlobMessage(data)
        }
    }
}










