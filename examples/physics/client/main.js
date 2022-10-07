import { View } from '../../../modules/dom/View.js'
import { Terrain3D } from '../../terrain/TerrainNode.js'
import { AuthenticationView } from './views/components/AuthenticationView.js'
import { initApi } from './api/initApi.js'
import { initPlayer } from './initPlayer.js'
import { ws, renderer, providersTokenManager } from './global.js'
import { zone03D } from '../../assets3D/zones/zone0/zone03D.js'

const assetsPromise = Promise.all([
    Terrain3D.init()
])

const authenticationContainer = new View('div', { classList: ['fullScreen', 'flexCenter'], parent: document.body }).element
const authenticationView = new AuthenticationView(authenticationContainer)

ws.onAuthenticationFail.add(()=>{
    providersTokenManager.clearLocalstorage()
    location.reload()
})

const onOpen = async () => {
    ws.onOpen.delete(onOpen)
    authenticationView.dispose()
    authenticationContainer.remove()

    initApi(ws)

    await assetsPromise

    const directionalLight = renderer.lights.getDirectionalLight()
    directionalLight.direction.set(1, 1, 1).normalize()
    directionalLight.intensity = 1.2
    renderer.lights.needsUpdate = true

    zone03D.create()

    initPlayer()
}

ws.onOpen.add(onOpen)