import { InputManagerComputer } from '../../../gameEngine/input/InputManagerComputer.js'
import { ReconciliationMotion } from '../../../gameEngine/physics/ReconciliationMotion.js'
import { LoopRaf } from '../../../models/LoopRaf.js'
import { ClientProvidersTokenManager } from '../../../modules/communication/client/providerAuthentication/ClientProviderTokenManager.js'
import { WebSocketClientManager } from '../../../modules/communication/client/WebSocketClientManager.js'
import { isMobile } from '../../../modules/dom/browserInfo.js'
import { Renderer } from '../../../webGlEngine/renderer/Renderer.js'
import { AppData } from '../../AppData/AppData.js' 

export const appData = new AppData()
export const renderer = new Renderer()
export const loop = new LoopRaf(renderer.draw)
export const inputManagerComputer = isMobile ? undefined : new InputManagerComputer(document.body, appData.keycode)

export const reconciliationMotion = new ReconciliationMotion(loop)

export const providersTokenManager = new ClientProvidersTokenManager({
    googleClientID: '648458932726-ik2ggqrl5qdjl5ikl5rjvtgnjrj26pbq.apps.googleusercontent.com',
    discordClientID: '944275913741312080',
    twitchClientID: 'tywvxcigayfhk02zlbz8ijyy01ypve',
})
export const ws = new WebSocketClientManager(
    `ws${location.host === 'localhost' ? '' : 's'}://${location.host}/physics`
)