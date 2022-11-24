"use strict"

import "../examples/styles/styleSwitch.js"
import { initAuthentication } from "../components/authentication.js"
import { initGame } from "./game.js"
import { initServerSelection } from "../components/serverSelection.js"
import { initSystemFramesControls } from "./systems/systemFramesControls.js"
import { initSystemFramesEntities } from "./systems/systemFramesEntities/systemFramesEntities.js"
import { serviceWebsocket } from "../services/serviceWebsocket.js"
import { service3D } from "../services/service3D.js"
import { serviceControls } from "../services/inputs/serviceControls.js"
import { inputsMove } from "../services/inputs/inputsMove.js"

const { provider, token, serversState } = await initAuthentication()

const host = await initServerSelection(serversState)

await initGame()

serviceWebsocket.connect(provider, token, host + '/game')

inputsMove.init()
serviceControls.init()
service3D.init()

initSystemFramesControls()
initSystemFramesEntities()
