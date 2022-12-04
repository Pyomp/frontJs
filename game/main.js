"use strict"

import "../examples/styles/styleSwitch.js"
import { initAuthentication } from "./components/authentication.js"
import { initGame } from "./game.js"
import { initServerSelection } from "./components/serverSelection.js"
import { initSystemFrames } from "./systems/systemFrames.js"
import { serviceWebsocket } from "./services/serviceWebsocket.js"
import { service3D } from "./services/service3D.js"
import { serviceControls } from "./services/inputs/serviceControls.js"
import { serviceStore } from "./services/store/serviceStore.js"

const { provider, token, serversState } = await initAuthentication()

const host = await initServerSelection(serversState)

await initGame()

serviceControls.init()
service3D.init()

initSystemFrames()
serviceStore.initWebsocket()

serviceWebsocket.connect(provider, token, host + '/game')