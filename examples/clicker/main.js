"use strict"

import "../styles/styleSwitch.js"
import { initAuthentication } from "../authentication/components/authentication.js"
import { ws } from "./services/ws.js"
import { initGame } from "./game.js"
import { initServerSelection } from "./components/serverSelection.js"

const { provider, token, serversState } = await initAuthentication()

const host = await initServerSelection(serversState)

initGame()
ws.connect(provider, token, host + '/game')
