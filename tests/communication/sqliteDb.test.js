import { Test } from '../../modules/test/Test.js'
import { fileURLToPath } from 'url'
import { rmSync } from 'fs'
import { DatabaseClients } from '../../modules/communication/server/DatabaseClients.js'
import { BetterSqlite3 } from '../../modules/communication/server/databaseFacades/BetterSqlite3.js'

class AppData {
    name = 'toto'
    toArray() {
        return [
            this.name
        ]
    }
    fromArray(array) {
        if (array?.constructor !== Array) return
        this.name = array[0]
    }
}

communicationTest()
export function communicationTest() {

    let unique = 0

    const test = new Test(
        `Sqlite Facade Test`,
        ``
    )
    const databasePath = fileURLToPath(new URL('./main.db', import.meta.url))

    try { rmSync(databasePath) } catch { }

    test.test(
        'Database new Player',
        `
        1) Create new player
        2) Link new provider
        3) Get Data From this provider`,
        async () => {
            const db = new DatabaseClients(new BetterSqlite3(databasePath, ['twitch', 'discord', 'google']))

            const twitchUniqueId = `twitchUniqueId${unique++}`
            const resultDb = await db.getAppData('twitch', twitchUniqueId)

            if (!resultDb) throw new Error('new client fail')

            const googleUniqueId = `googleUniqueId${unique++}`
            await db.updateProviderId(resultDb.appId, 'google', googleUniqueId)

            const resultDb2 = await db.getAppData('google', googleUniqueId)
            if (!resultDb2) throw new Error('new client fail')

            if (resultDb.appId !== resultDb2.appId) {
                throw new Error('appId not the same')
            }

            // const result = await promisify(database.get.bind(database))(`SELECT * FROM client;`)
            db.close()
        }
    )

    test.test(
        `Update and Get AppData`, `
        1) Create new player
        2) Write app data
        3) Read app data`,
        () => {
            const db = new DatabaseClients(new BetterSqlite3(databasePath, ['twitch', 'discord', 'google']))

            const uniqueId = `uniqueId${unique++}`
            const resultDb = db.getAppData('discord', uniqueId)

            if (!resultDb || !resultDb.appId) throw new Error('getAppData fail')

            const appData = new AppData()
            appData.name = 'toto'

            db.updateAppData(resultDb.appId, appData)

            const resultDb2 = db.getAppData('discord', uniqueId)
            if (!resultDb2 || !resultDb2.appId) throw new Error('getAppData fail')

            const appData2 = new AppData()
            appData2.fromArray(resultDb2.appData)
            if (appData2.name !== 'toto') {
                throw new Error('appData update fail')
            }

            db.close()
        }
    )

    test.test(
        `Concurrent test`, `
        1) Create 1000 new client
        2) Write 1000 app data
        3) Read app data`,
        () => {
            const db = new DatabaseClients(new BetterSqlite3(databasePath, ['twitch', 'discord', 'google']))

            const clients = []
            for (let i = 0; i < 1000; i++) {
                clients.push({ twitchId: `${clients.length}`, appData: Math.random() })
            }

            const dbClients = clients.map(client => db.getAppData('twitch', client.twitchId))

            dbClients.forEach((dbClient, index) => db.updateAppData(dbClient.appId, clients[index].appData))

            const dbClients2 = clients.map(client => db.getAppData('twitch', client.twitchId))

            for (let i = 0; i < clients.length; i++) {
                if (!Number.isFinite(dbClients2[i].appData)
                    || Math.abs(clients[i].appData - dbClients2[i].appData) > 0.0001
                ) throw 'app data not the same'
            }

            db.close()
        }
    )

    test.performTests()
}