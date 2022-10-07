import { WebSocketClientManager } from '../../../../../modules/communication/client/WebSocketClientManager.js'
import { View } from '../../../../../modules/dom/View.js'
import { providersTokenManager, ws } from '../../global.js'

export class AuthenticationView {
    #view = new View('div', {
        style: { maxWidth: '200px', },
        children: [
            new View('button', {
                ref: 'twitch',
                textContent: 'Twitch',
                style: {
                    backgroundColor: 'rgb(191, 148, 255)',
                    width: 'calc(100% - var(--padding-button) * 2)',
                }
            }),
            new View('button', {
                ref: 'discord',
                textContent: 'Discord',
                style: {
                    backgroundColor: 'rgb(94, 160, 255)',
                    width: 'calc(100% - var(--padding-button) * 2)',
                }
            }),
            new View('button', {
                ref: 'google',
                textContent: 'Google',
                style: {
                    backgroundColor: 'hsl(0, 100%, 60%)',
                    width: 'calc(100% - var(--padding-button) * 2)',
                }
            }),
            new View('div', {
                children: [
                    new View('input', {
                        ref: 'stayConnectedCheckbox',
                        attributes: {
                            type: 'checkbox',
                        }
                    }),
                    new View('span', { i18n: 'stay connected' })
                ]
            })
        ]
    })

    #container = this.#view.element
    #twitchButton = this.#view.ref['twitch']
    #discordButton = this.#view.ref['discord']
    #googleButton = this.#view.ref['google']

    #stayConnectedCheckbox = this.#view.ref['stayConnectedCheckbox']

    #disableAll() {
        this.#twitchButton.disabled = true
        this.#discordButton.disabled = true
        this.#googleButton.disabled = true
    }
    #enableAll() {
        this.#twitchButton.disabled = false
        this.#discordButton.disabled = false
        this.#googleButton.disabled = false
    }

    constructor(parent, localStorageKey = 'stayConnected') {

        this.stayConnected = localStorage.getItem(localStorageKey) === '1'

        if (this.stayConnected) {
            const twitchToken = providersTokenManager.getLocalStorageTwitchToken()
            if (twitchToken) { ws.connect('twitch', twitchToken); return }

            const discordToken = providersTokenManager.getLocalStorageDiscordToken()
            if (discordToken) { ws.connect('discord', discordToken); return }

            const googleToken = providersTokenManager.getLocalStorageGoogleToken()
            if (googleToken) { ws.connect('google', googleToken); return }
        }

        this.#stayConnectedCheckbox.addEventListener('change', () => {
            this.stayConnected = this.#stayConnectedCheckbox.checked
            localStorage.setItem(localStorageKey, this.stayConnected ? '1' : '0')
        })

        parent.appendChild(this.#container)

        this.#twitchButton.addEventListener('click', async () => {
            if (ws.state !== WebSocketClientManager.CLOSE) return
            this.#disableAll()
            const token = await providersTokenManager.getTwitchToken()
            ws.connect('twitch', token)
            this.#enableAll()
        })
        this.#discordButton.addEventListener('click', async () => {
            if (ws.state !== WebSocketClientManager.CLOSE) return
            this.#disableAll()
            const token = await providersTokenManager.getDiscordToken()
            ws.connect('discord', token)
            this.#enableAll()
        })
        this.#googleButton.addEventListener('click', async () => {
            if (ws.state !== WebSocketClientManager.CLOSE) return
            this.#disableAll()
            const token = await providersTokenManager.getGoogleToken()
            ws.connect('google', token)
            this.#enableAll()
        })
    }

    dispose() {
        this.#container.remove()
    }
}