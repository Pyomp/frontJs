"use strict"

import "../modules/dom/styles/styles.js"
// import { menu } from "./components/menu/menu.js" 
import { authentication } from "./views/authentication.js"
import { serverSelection } from "./views/serverSelection.js"
import { websocketFramesGame } from "./globals/websocketFramesGame.js"
import { websocketGame } from "./globals/websocketGame.js"
import { inputsControls } from "./globals/inputs/inputsControls.js"
import { store } from "./globals/store.js"
import { inputsAction } from "./views/slots.js"
import { initCaches } from "../modules/dom/serviceWorkerInstall.js"
import { helperModels } from "../modules/webGlEngine/extras/helpers/helpersInit.js"
import { i18n } from "../modules/dom/i18n.js"
import { context3D } from "./globals/context3D.js"
import { loopRaf } from "../modules/globals/loopRaf.js"
import { FPSView } from "../modules/webGlEngine/debug/components/FPSView.js"
import './globals/console.js'
import { entityManager } from "./entities/entityManager.js"

await initCaches()

new FPSView()

i18n.registerDictionary('en', new URL('./globals/i18n/en.json', import.meta.url).href)
i18n.setLanguage('en')

const { provider, token, serversState } = await authentication.init()

const host = await serverSelection.init()

// await helperModels.init

websocketGame.connect(provider, token, host + '/game')

await store.init()

inputsAction.init()
inputsControls.init()

websocketFramesGame.init()

// await menu.init()
context3D.init()
loopRaf.init(context3D.renderer, context3D.controls)
loopRaf.beforeRenderListeners.add(()=>{
    entityManager.update()
})
