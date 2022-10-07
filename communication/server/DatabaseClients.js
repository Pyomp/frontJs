import { createHash } from 'crypto'

// const hash = crypto.createHash('sha256')

export class DatabaseClients {
    #db

    constructor(database) {
        this.#db = database
    }

    close() {
        this.#db.close()
    }

    getAppData(provider, providerId) {
        const prodviderIdHashed = createHash('sha256').update(providerId).digest('base64')

        const data = this.#db.selectFromProviderId[provider](prodviderIdHashed)
        if (data) return data

        const appId = this.#db.insert()

        this.#db.updateProviderId[provider](appId, prodviderIdHashed)

        return {
            appId: appId,
            [provider]: true
        }
    }

    updateAppData(appId, appData) {
        return this.#db.updateAppData(appId, appData)
    }

    updateProviderId(appId, provider, providerId) {
        const prodviderIdHashed = createHash('sha256').update(providerId).digest('base64')
        return this.#db.updateProviderId[provider](appId, prodviderIdHashed)
    }
}
