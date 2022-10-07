import { ClientProvidersTokenManager } from '../../modules/communication/client/providerAuthentication/ClientProviderTokenManager.js'
import { WebSocketClientManager } from '../../modules/communication/client/WebSocketClientManager.js'

const provider = new ClientProvidersTokenManager({
    googleClientID: '648458932726-ik2ggqrl5qdjl5ikl5rjvtgnjrj26pbq.apps.googleusercontent.com',
})

const ws = new WebSocketClientManager(
    `ws${location.host === 'localhost' ? '' : 's'}://${location.host}/ws`
)

ws.onState.add(() => {
    if (ws.state === WebSocketClientManager.CLOSE) {
        google.disabled = false
        google.style.background = 'hsl(20, 100%, 70%)'
    } else {
        google.disabled = true
        google.style.background = 'hsl(0, 0%, 60%)'
    }
})

// view 
const google = document.createElement('button')
google.textContent = 'google auth'

const ping = document.createElement('button')
ping.textContent = 'ping !'

document.body.append(google, ping)

ping.addEventListener('click', async () => {
    const t0 = performance.now()
    await ws.request('ping', '', '')
    console.log(`latency: ${performance.now() - t0}`)
})
google.addEventListener('click', async () => {
    google.disabled = true

    const googleToken = await provider.getGoogleToken()

    ws.connect('google', googleToken)

    google.disabled = false
})

// ws.addRoute('message', chatControler.onMessage)




