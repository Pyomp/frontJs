import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { getTwitchId } from '../../../modules/communication/server/authProvider/twitch.js'
import { getDiscordId } from '../../../modules/communication/server/authProvider/discord.js'
import { getGoogleId } from '../../../modules/communication/server/authProvider/google.js'
import { AppData } from '../../AppData/AppData.js'
import { WebSocketServerManager } from '../../../modules/communication/server/WebSocketServerManager.js'
import { DatabaseClients } from '../../../modules/communication/server/DatabaseClients.js'
import { BetterSqlite3 } from '../../../modules/communication/server/databaseFacades/BetterSqlite3.js'

// CONSTANT
export const PROVIDER_GET_ID_TIMEOUT = 20_000

export const DISCORD_CLIENT_ID = ''

export const TWITCH_ID = 1
export const DISCORD_ID = 1 << 1
export const GOOGLE_ID = 1 << 2

// SERVER CONFIG
const databasePath = fileURLToPath(new URL('./main.db', import.meta.url))
const db = new DatabaseClients(new BetterSqlite3(databasePath, ['twitch', 'discord', 'google']))
export const wsManager = new WebSocketServerManager(db, AppData)


