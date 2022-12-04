"use strict"

import "../styles/styleSwitch.js"
import { initAuthentication } from "../../game/components/authentication.js"
import { serviceWebsocket } from "../../game/services/serviceWebsocket.js"
import { initGame } from "./game.js"
import { initServerSelection } from "../../game/components/serverSelection.js"

const { provider, token, serversState } = await initAuthentication()

const host = await initServerSelection(serversState)

initGame()
serviceWebsocket.connect(provider, token, host + '/game')
