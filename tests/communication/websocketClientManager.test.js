import { ClientProvidersTokenManager } from '../../modules/communication/client/providerAuthentication/ClientProviderTokenManager.js'
import { WebSocketClientManager } from '../../modules/communication/client/WebSocketClientManager.js'
import { PORT } from './config.js'

const ws = new WebSocketClientManager(`ws://localhost:${PORT}/api`)

const twitch = document.getElementById('twitch')
const discord = document.getElementById('discord')
const google = document.getElementById('google')
const fail = document.getElementById('fail')

const providers = new ClientProvidersTokenManager()

function buttonsOff() {
    twitch.disabled = true
    discord.disabled = true
    google.disabled = true
    fail.disabled = true
}

function buttonsOn() {
    twitch.disabled = false
    discord.disabled = false
    google.disabled = false
    fail.disabled = false
}

twitch.addEventListener('click', async () => {
    const token = await providers.getTwitchToken()
    ws.connect('twitch', token)
})

ws.onClose.add(buttonsOn)
ws.onAuth.add(buttonsOff)
ws.onConnecting.add(buttonsOff)
ws.onOpen.add(buttonsOff)

ws.addRoute(1, (dataview) => {
    const rand = dataview.getFloat32(2)
    const lastSent = randomNumbers.shift()
    if (Math.abs(rand - lastSent) < 0.000001) console.log('Pass')
    else console.warn(new Error())
})

let timeout
function networkComTest() {
    sendPing()
    randomNumber()
    timeout = setTimeout(networkComTest, 1000)
}

async function sendPing() {
    const t0 = performance.now()
    console.log(await ws.request('ping'))
    console.log(performance.now() - t0 + ' ms')
}

const frame = new ArrayBuffer(6)
const view = new DataView(frame)
view.setUint16(0, 1)
const randomNumbers = []
async function randomNumber() {
    const rand = Math.random()
    randomNumbers.push(rand)
    view.setFloat32(2, rand)
    ws.sendRaw(frame)
}

ws.onOpen.add(networkComTest)
ws.onClose.add(() => { clearTimeout(timeout) })