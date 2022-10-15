import { inputCheckbox } from "../../dom/components/inputCheckbox.js"
import { button, div } from "../../dom/View.js"
import { LocalStorageStayConnected } from "../constants/localstorage.js"
import { providersToken, ProvidersTokenBusy, ProvidersTokenReady } from "./providersToken.js"
import { ws, WsAuthenticationFail, WsClose, WsOpen } from "./wsManager.js"

const ReconnectTimeout = 1000

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

    const stayConnectedInput = inputCheckbox('stay connected')

    const container = div({
        style: {
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '200px',
        }
    }, [
        twitchButton,
        discordButton,
        googleButton,
        stayConnectedInput.view,
    ])

    return {
        container,
        twitchButton: twitchButton.element,
        discordButton: discordButton.element,
        googleButton: googleButton.element,
        stayConnectedInput,
    }
}

let component
function getComponent() {
    if (component) return component
    const view = createView()
    const {
        twitchButton,
        discordButton,
        googleButton,
        stayConnectedInput,
    } = view

    stayConnectedInput.input.checked = localStorage.getItem(LocalStorageStayConnected) === '1'
    stayConnectedInput.input.addEventListener('change', () => {
        localStorage.setItem(LocalStorageStayConnected, stayConnectedInput.input.checked ? '1' : '0')
    })

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

let currentProvider = null
let currentToken = null

export async function initAuthentication() {
    return new Promise((resolve) => {
        function updateModalAuth() {
            if (ws.state !== WsClose || providersToken.state === ProvidersTokenBusy)
                document.body.style.filter = 'grayscale(0.8)'
            else document.body.style.filter = 'grayscale(0)'
        }
        ws.onState.add(updateModalAuth)
        providersToken.onState.add(updateModalAuth)

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
                ws.onState.remove(updateModalAuth)
                providersToken.onState.remove(updateModalAuth)
                component.dispose()

                function reconnect() {
                    if (ws.state === WsClose) {
                        setTimeout(() => {
                            ws.connect(currentProvider, currentToken)
                        }, ReconnectTimeout)
                    }
                }
                ws.onState.add(reconnect)

                resolve()
            }
        }
        ws.onState.add(onSuccess)

        const stayConnected = localStorage.getItem(LocalStorageStayConnected)
        if (stayConnected === '1') {
            const providerToken = providersToken.getFirstLocalStorageToken()
            if (providerToken) {
                currentProvider = providerToken.provider
                currentToken = providerToken.token
                ws.connect(currentProvider, currentToken)
                return
            }
        }

        getComponent().display()
    })
}
