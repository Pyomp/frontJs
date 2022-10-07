import { initEntityRoute } from './initRoutes/entityRoute.js'

/** @param {WebSocketClientManager} ws*/
export function initApi(ws) {
    initEntityRoute(ws)
}
