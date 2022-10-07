import v8 from 'v8'
import Database from 'better-sqlite3'

const tableName = 'client'

export class BetterSqlite3 {
    #database
    #lastId = 0

    /** @type {{ [providerName: string]: (providerId) => {[param: string]: any} }} */
    selectFromProviderId = {}
    /** @type {{ [providerName: string]: (appId, providerId) => void }} */
    updateProviderId = {}

    constructor(databaseUrl, providerNames) {
        this.#database = new Database(databaseUrl)
        this.#initCloseEvent()
        this.#database.pragma('journal_mode = WAL')
        this.#initTable(providerNames)
        this.#initLastId()
        this.#initInsert()
        this.#initDelete()
        this.#initSelect(providerNames)
        this.#initUpdate(providerNames)
        this.#initPrepareAppendAnalytics()
        this.#initPrepareUpdateAppData()
    }
    
    #initCloseEvent() {
        process.on('exit', () => this.close())
        process.on('SIGHUP', () => process.exit(128 + 1))
        process.on('SIGINT', () => process.exit(128 + 2))
        process.on('SIGTERM', () => process.exit(128 + 15))
    }

    close() {
        this.#database.close()
    }

    insert() {
        this.#lastId++
        this.#prepareInsert.run(this.#lastId)
        return this.#lastId
    }

    #prepareDelete
    #initDelete() {
        this.#prepareDelete = this.#database.prepare(
            `DELETE FROM ${tableName} WHERE appId = ?`
        )
    }
    delete(id) { this.#prepareDelete.run(id) }

    #initTable(providerNames) {
        const createTable = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            appId INTEGER PRIMARY KEY,
            ${providerNames.map(name => `${name} TEXT,`).join('\n')}
            appData BLOB,
            analytics TEXT DEFAULT ''
        );`
        this.#database.exec(createTable)
    }

    #initLastId() {
        this.#lastId = this.#database.prepare(`SELECT MAX(appId) from ${tableName}`).get()['MAX(appId)'] || 0
    }

    #prepareInsert
    #initInsert() {
        this.#prepareInsert = this.#database.prepare(
            `INSERT INTO ${tableName} (appId) VALUES (?)`
        )
    }



    #initSelect(providersName) {
        const providerSelect = providersName.join(',')
        for (const provider of providersName) {
            const prepare = this.#database.prepare(
                `SELECT appId, ${providerSelect}, appData from ${tableName} WHERE ${provider} = ?`
            )
            this.selectFromProviderId[provider] = (providerId) => {
                return this.#select(prepare, providerId)
            }
        }
    }

    #select(prepare, prodviderId) {
        const result = prepare.get(prodviderId)
        if (result) {
            try {
                result.appData = v8.deserialize(result.appData)
            } catch {
                result.appData = {}
            }
            return result
        } else {
            return null
        }
    }

    #initUpdate(providersName) {
        for (const provider of providersName) {
            const prepare = this.#database.prepare(
                `UPDATE ${tableName} SET ${provider} = ? WHERE appId = ?`
            )
            this.updateProviderId[provider] = (appId, providerId) => {
                return this.#updateProvider(prepare, appId, providerId)
            }
        }
    }

    #updateProvider(prepare, appId, providerId) {
        prepare.run(providerId, appId)
    }

    #prepareUpdateAppData
    #initPrepareUpdateAppData() {
        this.#prepareUpdateAppData = this.#database.prepare(
            `UPDATE ${tableName} SET appData = ? WHERE appId = ?`
        )
    }

    updateAppData(appId, appData) {
        this.#prepareUpdateAppData.run(v8.serialize(appData), appId)
    }

    #prepareAppendAnalytics
    #initPrepareAppendAnalytics() {
        this.#prepareAppendAnalytics = this.#database.prepare(
            `UPDATE ${tableName} SET analytics = analytics || ? WHERE appId = ?`
        )
    }

    appendAnalytics(appId, analytics) {
        this.#prepareAppendAnalytics.run(analytics, appId)
    }
}
