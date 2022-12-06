import { storeSettings } from "../../store/storeSettings.js"
import { serviceWebsocket } from "../serviceWebsocket.js"

function onAuthentication(data) {
    storeSettings.id = data.id
}

export const serviceStore = {
    initWebsocket() {
        serviceWebsocket.jsonDispatcher[1] = onAuthentication
    }
}