import { notification } from "../../../dom/components/notification.js"
import { button, div, span } from "../../../dom/View.js"
import { api } from "../services/api.js"
import { providersToken } from "../services/providersToken.js"

export async function initAuthentication() {
    const res = await automaticConnection()
    if (res) return res
    return createComponent()
}

async function automaticConnection() {
    const providerToken = providersToken.getFirstLocalStorageToken()
    console.log(providerToken)
    if (providerToken) {
        const serversState = await fetchAuthentication(providerToken.provider, providerToken.token)
        if (serversState) {
            return {
                provider: providerToken.provider,
                token: providerToken.token,
                serversState
            }
        }
    }
}

async function fetchAuthentication(provider, token) {
    const res = await api.connect(provider, token)
    if (res) {
        return res
    } else {
        providersToken.clearLocalStorage()
    }
}

function createView() {
    const twitchButton = button({
        textContent: 'Twitch',
        style: { backgroundColor: 'rgb(191, 148, 255)', width: '100%' }
    })

    const discordButton = button({
        ref: 'discord', textContent: 'Discord',
        style: { backgroundColor: 'rgb(94, 160, 255)', width: '100%' }
    })

    const googleButton = button({
        ref: 'google', textContent: 'Google',
        style: { backgroundColor: 'hsl(0, 100%, 60%)', width: '100%' }
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
        span({i18n: 'Log in', style:{fontSize: 'x-large'}}),
        // twitchButton,
        // discordButton,
        googleButton
    ])

    return {
        container,
        twitchButton: twitchButton.element,
        discordButton: discordButton.element,
        googleButton: googleButton.element
    }
}

function createComponent() {
    const view = createView()
    const {
        container,
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

    return new Promise((resolve) => {
        async function onClickProviderButton(providerName, getTokenFunction) {
            disableAll()
            const token = await getTokenFunction()
            if (token) {
                const serversState = await fetchAuthentication(providerName, token)
                if (serversState) {
                    container.dispose()
                    resolve({
                        provider: providerName,
                        token: token,
                        serversState
                    })
                    return
                }
            }
            notification.push('Authentication fail')
            enableAll()
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

        document.body.appendChild(view.container.element)
    })
}