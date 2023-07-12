import { storeSettings } from "./stores/storeSettings.js"
import { websocketGame } from "./websocketGame.js"

function onAuthentication(data) { storeSettings.id = data.id }

export const store = {
    init() {
        delete this.init
        websocketGame.jsonDispatcher[1] = onAuthentication
    },
    settings: storeSettings
}
