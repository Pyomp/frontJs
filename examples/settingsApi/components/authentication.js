import { button, div } from "../../../dom/View.js"
import { providersToken, ProvidersTokenBusy, ProvidersTokenReady } from "../services/providersToken.js"
import { ws, WsAuthenticationFail, WsClose, WsOpen } from "../services/wsManager.js.js"

const ReconnectTimeout = 1000
let currentProvider = null
let currentToken = null

export async function initAuthentication() {

    if (automaticConnection()) return

    return new Promise((resolve) => {
        const disposeLoadingState = initLoadingState()

        function onAuthenticationFail() {
            if (ws.state === WsAuthenticationFail) {
                providersToken.clearLocalStorage()
                location.reload()
            }
        }
        ws.onState.add(onAuthenticationFail)

        function onSuccess() {
            if (ws.state === WsOpen) {
                ws.onState.remove(onSuccess)
                component.dispose()
                disposeLoadingState()
                initReconnect()
                resolve()
            }
        }
        ws.onState.add(onSuccess)

        getComponent().display()
    })
}

function automaticConnection() {
    const providerToken = providersToken.getFirstLocalStorageToken()
    if (providerToken) {
        currentProvider = providerToken.provider
        currentToken = providerToken.token
        ws.connect(currentProvider, currentToken)
        return true
    }
    return false
}

function initLoadingState() {
    function updateModalAuth() {
        if (ws.state !== WsClose || providersToken.state === ProvidersTokenBusy)
            document.body.style.filter = 'grayscale(0.8)'
        else document.body.style.filter = 'grayscale(0)'
    }
    ws.onState.add(updateModalAuth)
    providersToken.onState.add(updateModalAuth)

    return () => {
        ws.onState.remove(updateModalAuth)
        providersToken.onState.remove(updateModalAuth)
    }
}

function initReconnect() {
    function reconnect() {
        if (ws.state === WsClose) {
            setTimeout(() => {
                ws.connect(currentProvider, currentToken)
            }, ReconnectTimeout)
        }
    }
    ws.onState.add(reconnect)
}

function createView() {
    const twitchButton = button({
        textContent: 'Twitch',
        style: { backgroundColor: 'rgb(191, 148, 255)' }
    })

    const discordButton = button({
        ref: 'discord', textContent: 'Discord',
        style: { backgroundColor: 'rgb(94, 160, 255)' }
    })

    const googleButton = button({
        ref: 'google', textContent: 'Google',
        style: { backgroundColor: 'hsl(0, 100%, 60%)' }
    })

    const container = div({
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '200px',
            margin: 'auto',
            height: '100%'
        }
    }, [
        twitchButton,
        discordButton,
        googleButton
    ])

    return {
        container,
        twitchButton: twitchButton.element,
        discordButton: discordButton.element,
        googleButton: googleButton.element
    }
}

let component = null
function getComponent() {
    if (component) return component
    const view = createView()
    const {
        twitchButton,
        discordButton,
        googleButton
    } = view

    function disableAll() {
        twitchButton.disabled = true
        discordButton.disabled = true
        googleButton.disabled = true
    }

    function enableAll() {
        twitchButton.disabled = false
        discordButton.disabled = false
        googleButton.disabled = false
    }

    async function onClickProviderButton(providerName, getTokenFunction) {
        const token = await getTokenFunction()
        if (token) {
            currentProvider = providerName
            currentToken = token
            ws.connect(currentProvider, currentToken)
        } else {
            console.warn('provider authentication fail')
        }
    }

    twitchButton.addEventListener('click', () => {
        onClickProviderButton('twitch', providersToken.getTwitchToken)
    })
    discordButton.addEventListener('click', () => {
        onClickProviderButton('discord', providersToken.getDiscordToken)
    })
    googleButton.addEventListener('click', () => {
        onClickProviderButton('google', providersToken.getGoogleToken)
    })

    function updateButtonDisability() {
        if (ws.state === WsClose && providersToken.state === ProvidersTokenReady) enableAll()
        else disableAll()
    }
    ws.onState.add(updateButtonDisability)
    providersToken.onState.add(updateButtonDisability)
    updateButtonDisability()

    function dispose() {
        view.dispose()
        ws.onState.remove(updateButtonDisability)
        providersToken.onState.remove(updateButtonDisability)
        component = null
    }

    component = {
        display() {
            document.body.appendChild(view.container.element)
        },
        dispose,
    }
    return component
}