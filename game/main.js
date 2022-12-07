"use strict"

import "../examples/styles/serviceStyle.js"
import { componentMenu } from "./menu/componentMenu.js"
import { initAuthentication } from "./components/authentication.js"
import { initGame } from "./game.js"
import { initServerSelection } from "./components/serverSelection.js"
import { initSystemFrames } from "./systems/systemFrames.js"
import { serviceWebsocket } from "./services/serviceWebsocket.js"
import { service3D } from "./services/service3D.js"
import { inputControls } from "./inputs/inputsControls.js"
import { serviceStore } from "./services/store/serviceStore.js"
import { inputsAction } from "./inputs/inputsActions.js"
import { initCaches, initServiceWorker } from "../dom/serviceWorkerInstall.js"

await initCaches()
await initServiceWorker()

const { provider, token, serversState } = await initAuthentication()

const host = await initServerSelection(serversState)

await initGame()

inputsAction.init()
inputControls.init()
service3D.init()

initSystemFrames()
serviceStore.initWebsocket()

serviceWebsocket.connect(provider, token, host + '/game')

await componentMenu.init()