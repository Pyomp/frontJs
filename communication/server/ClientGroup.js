import { EventSet } from '../../common/EventDispatcher.js'

export class ClientGroup {

    /** @type {Set<Client>} */
    clients = new Set()

    onAdd = new EventSet()
    onDelete = new EventSet()

    addClient(client) {
        if (this.clients.has(client)) return
        this.clients.add(client)
        client.groups.add(this)
        this.onAdd.emit(client)
    }

    deleteClient(client) {
        if (this.clients.delete(client)) {
            client.groups.delete(this)
            this.onDelete.emit(client)
        }
    }

    /**
     * @param {string | Buffer} payload 
     * @param {Client} emitterClient this client will not be 
     */
    broadcast(payload, emitterClient) {
        for (const client of this.clients) {
            if (client === emitterClient) continue
            client.send(payload)
        }
    }
}