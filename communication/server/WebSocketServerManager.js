import { wait } from '../../models/utils.js'
import { authProviders } from './authProvider/authProviders.js'
import { Client } from './Client.js'
import { ClientGroup } from './ClientGroup.js'

const AUTH_TIMEOUT = 1000
const AUTH_FAIL_TIMEOUT = 10_000 // if auth fails, actually close after this time

/**
 * @typedef WebSocketStringRequest
 * @prop {string} cmd retrieve the callback: `this.#route[cmd](...)`
 * @prop {number | string | undefined} id if present: send a response with this id (to keep trace of the request)
 * @prop {any} data
*/

/**
 * @typedef WebSocketStringResponse
 * @prop {number | string | undefined} id if present: send a response with this id (to keep trace of the request)
 * @prop {any} data
*/

/**
 * `addRoute` to add a callback that will be called when the client `cmd` will be `command`  
 * 
 * Client Message:
 * - a "request": `{cmd: ..., id: ..., data: ...}`
 * - a "string message": `{cmd: ..., data: ...}`
 * - a "binary": `new Uint8Array([ ...toUint16BigEndian(cmd), ...])` /!\ needs to be uint16 big-endian
 * 
 * Server Response (if "request"):  
 * `{id: ..., data: ...}`
 * 
 * Static that needs change:
 * - `WebSocketServerManager.onError`
 * @template {{
 *      [params: string]: any,
 *      fromArray: function(any[]): void
 *      toArray: function(): any[]
 * }} T
*/
export class WebSocketServerManager {

    /** handleError can (and should) be change to everything you want */
    static onError = (error) => { console.warn(Date.now()); console.warn(error) }

    #info = {
        authenticatedNumber: 0,
        connectedNumber: 0,
    }

    #db
    #providersAccountLinkedId
    #AppData

    /** @type {{[appId: string]: Client}} */
    #clientDictionary = {}

    /**
     * @param { DatabaseClients } databaseClients 
     * @param {new (id: number) => T} AppData 
     * @typedef {{ appData: T }} AppDataFinal
     */
    constructor(databaseClients, AppData) {
        this.#db = databaseClients
        this.#AppData = AppData
    }

    #routes = {}

    group = new ClientGroup()

    /** @param {(client: Client, payload: string | Buffer | ArrayBuffer | Buffer[], appData: T) => any} callback */
    addRoute(command, callback) {
        if (this.#routes[command])
            throw new Error(`Command "${command}" already exist.`)

        this.#routes[command] = callback
    }

    /** 
     * Handle new websocket client connexion.  
     * The new connexion wait for the first frame,
     * it has to be the auth frame.  
     * 
     * There is a timeout for this frame: `AUTH_TIMEOUT`.  
     * 
     * If authentication fail, the websocket will be terminated after `AUTH_FAIL_TIMEOUT`.
     * This prevent some attacks.  
    */
    onConnection(websocketClient) {
        websocketClient.addEventListener('error', WebSocketServerManager.onError)

        const authTimeout = setTimeout(websocketClient.terminate, AUTH_TIMEOUT)

        /** authentication at the first message */
        websocketClient.onmessage = async (e) => {
            websocketClient.onmessage = null

            clearTimeout(authTimeout)

            try {
                const data = JSON.parse(e.data)
                await wait(1_000)
                const client = await this.getClient(data.provider, data.token)
                client.addWebsocket(websocketClient)
                this.group.addClient(client)
                websocketClient.onmessage = this.#constructOnMessage(client, websocketClient)

            } catch (error) { this.#authenticationFail(websocketClient, error) }
        }
    }

    #authenticationFail(websocketClient, error) {
        setTimeout(websocketClient.terminate, AUTH_FAIL_TIMEOUT)
        WebSocketServerManager.onError(error)
    }

    #getProviderLinked(dbResult) {
        let result = []
        for (const key in this.#providersAccountLinkedId) {
            if (dbResult[key]) result.push(key)
        }
        return result
    }

    async getClient(providerName, token) {
        const providerId = await authProviders.getIdFromOauth(providerName, token)

        const data = await this.#db.getAppData(providerName, providerId)

        if (this.#clientDictionary[data.appId])
            return this.#clientDictionary[data.appId]

        const accountLinked = this.#getProviderLinked(data)
        const client = new Client(data.appId, accountLinked)
        client.appData = new this.#AppData(data.appId)
        client.appData.fromArray(data.appData)
        this.#clientDictionary[data.appId] = client

        client.onDispose.add(() => {
            delete this.#clientDictionary[data.appId]
            this.#db.updateAppData(data.appId, client.appData.toArray())
        })

        return client
    }

    /** 
     * Return how the message will be handle for a client and a websocket.
     * Detailled in the Class documentation
     */
    #constructOnMessage(client, websocketClient) {
        const appData = client.appData
        return async (e) => {
            const payload = e.data
            try {
                if (typeof payload === 'string') {

                    /** @type {WebSocketStringRequest} */
                    const { cmd, id, data } = JSON.parse(payload)
                    const callback = this.#routes[cmd]
                    const responseData = await callback(client, data, appData)

                    if (id !== undefined) {
                        if (responseData === undefined)
                            throw new Error(`Message ID present but no response data.\n cmd: ${cmd} \n id: ${id} \n data: ${data} \n`)

                        websocketClient.send(JSON.stringify(
                            /** @type {WebSocketStringResponse} */
                            { id: id, data: responseData }
                        ))
                    }
                } else {
                    const cmd = payload.readUint16BE(0)
                    this.#routes[cmd](client, payload, appData)
                }

            } catch (e) { WebSocketServerManager.onError(e) }
        }
    }
}


