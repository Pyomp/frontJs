import { localstorageProvidersKey } from '../../config.js'
import { getDiscordToken } from './providerRequests/discord.js'
import { getGoogleToken } from './providerRequests/google.js'
import { getTwitchToken } from './providerRequests/twitch.js'

export class ClientProvidersTokenManager {

    #twitchRedirect
    #discordRedirect
    #googleRedirect

    constructor({
        twitchRedirect = `http${location.host === 'localhost' ? '' : 's'}://${location.host}/twitch/`,
        discordRedirect = `http${location.host === 'localhost' ? '' : 's'}://${location.host}/discord/`,
        googleRedirect = `http${location.host === 'localhost' ? '' : 's'}://${location.host}/google/`,
    } = {}) {
        this.#twitchRedirect = twitchRedirect
        this.#discordRedirect = discordRedirect
        this.#googleRedirect = googleRedirect
    }

    getTwitchToken() {
        return getTwitchToken(this.#twitchRedirect)
    }
    getLocalStorageTwitchToken() {
        return localStorage.getItem(localstorageProvidersKey.twitch)
    }

    getDiscordToken() {
        return getDiscordToken(this.#discordRedirect)
    }
    getLocalStorageDiscordToken() {
        return localStorage.getItem(localstorageProvidersKey.discord)
    }

    getGoogleToken() {
        return getGoogleToken(this.#googleRedirect)
    }
    getLocalStorageGoogleToken() {
        return localStorage.getItem(localstorageProvidersKey.google)
    }

    clearLocalstorage() {
        localStorage.removeItem(localstorageProvidersKey.twitch)
        localStorage.removeItem(localstorageProvidersKey.discord)
        localStorage.removeItem(localstorageProvidersKey.google)
    }
}

