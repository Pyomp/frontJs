"use strict"

import "../styles/styleSwitch.js"
import { initAuthentication } from "../../components/authentication.js"
import { serviceWebsocket } from "../../services/serviceWebsocket.js"
import { initGame } from "./game.js"
import { initServerSelection } from "../../components/serverSelection.js"

const { provider, token, serversState } = await initAuthentication()

const host = await initServerSelection(serversState)

initGame()
serviceWebsocket.connect(provider, token, host + '/game')
