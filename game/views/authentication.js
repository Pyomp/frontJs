import { notification } from "../../modules/dom/components/notification.js"
import { serviceApi } from "../services/api.js"
import { providersToken } from "../services/serviceAuth/providersToken.js"

export const authentication = {
    async init() {
        const res = await automaticConnection()
        if (res) return res
        return createComponent()
    }
}

async function automaticConnection() {
    const providerToken = providersToken.getFirstLocalStorageToken()

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
    const res = await serviceApi.connect(provider, token)
    if (res) {
        return res
    } else {
        providersToken.clearLocalStorage()
    }
}

function createView() {
    const twitchButton = document.createElement('button')
    twitchButton.style.backgroundColor = 'rgb(191, 148, 255)'
    twitchButton.style.width = '100%'
    twitchButton.textContent = 'Twitch'

    const discordButton = document.createElement('button')
    discordButton.style.backgroundColor = 'rgb(94, 160, 255)'
    discordButton.style.width = '100%'
    discordButton.textContent = 'Discord'

    const googleButton = document.createElement('button')
    googleButton.style.backgroundColor = 'hsl(0, 100%, 60%)'
    googleButton.style.width = '100%'
    googleButton.textContent = 'Google'

    const guestButton = document.createElement('button')
    guestButton.style.backgroundColor = 'hsl(0, 0%, 50%)'
    guestButton.style.width = '100%'
    guestButton.textContent = 'Guest'

    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.flexDirection = 'column'
    div.style.alignItems = 'center'
    div.style.justifyContent = 'center'
    div.style.maxWidth = '200px'
    div.style.margin = 'auto'
    div.style.height = '100%'
    
    const title =document.createElement('span')
    title.style.fontSize =  'x-large'
    title.textContent = "Log in"

    div.appendChild(title)
    // container.appendChild(twitchButton)
    // container.appendChild(discordButton)
    // container.appendChild(googleButton)
    div.appendChild(guestButton)

    return {
        container: div,
        twitchButton: twitchButton,
        discordButton: discordButton,
        googleButton: googleButton,
        guestButton: guestButton
    }
}

function createComponent() {
    const view = createView()
    const {
        container,
        twitchButton,
        discordButton,
        googleButton,
        guestButton
    } = view

    function disableAll() {
        twitchButton.disabled = true
        discordButton.disabled = true
        googleButton.disabled = true
        guestButton.disabled = true
    }

    function enableAll() {
        twitchButton.disabled = false
        discordButton.disabled = false
        googleButton.disabled = false
        guestButton.disabled = false
    }

    return new Promise((resolve) => {
        async function onClickProviderButton(providerName, getTokenFunction) {
            disableAll()
            const token = await getTokenFunction()
            if (token) {
                const serversState = await fetchAuthentication(providerName, token)
                if (serversState) {
                    container.remove()
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
        guestButton.addEventListener('click', () => {
            onClickProviderButton('guest', providersToken.getGuestToken)
        })

        document.body.appendChild(view.container)
    })
}
