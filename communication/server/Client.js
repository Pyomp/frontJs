import { EventSet } from '../../common/EventDispatcher.js'

const DisposeTimeout = 5 * 60 * 1000

export class Client {
    /** for profiler */
    static logError(error) { console.warn(error) }
    static logInfo(info) { console.info(`${new Date().toISOString()} | ${info}`) }

    #ws
    #disposeTimeout

    appData

    /** @type {Set<ClientGroup>} */
    groups = new Set()

    constructor(id, accountLinked) {
        this.id = id
        this.accountLinked = accountLinked
        this.#disposeTimeout = setTimeout(this.#disposeBound, DisposeTimeout)
    }

    #disposeBound = this.#dispose.bind(this)
    onDispose = new EventSet()
    #dispose() {
        this.#ws?.close()
        for (const group of this.groups) group.deleteClient(this)
        this.onDispose.emit()
    }

    addWebsocket(websocketClient) {
        clearTimeout(this.#disposeTimeout)

        if (this.#ws) {
            this.#ws.onclose = null
            this.#ws.close(1008, 'to_many_connection')
        }

        Client.logInfo(`id: ${this.id} | connected`)
        this.#ws = websocketClient
        this.send('')
        this.#ws.onclose = () => {
            this.#ws = undefined
            this.#disposeTimeout = setTimeout(this.#disposeBound, DisposeTimeout)
            Client.logInfo(`id: ${this.id} | disconnected`)
        }
    }

    send(payload) {
        this.#ws?.send(payload)
    }

    isConnected() { return this.#ws !== undefined }
}
