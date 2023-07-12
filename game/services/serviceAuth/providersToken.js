import {
    LocalStorageDiscordToken,
    LocalStorageGoogleToken,
    LocalStorageTwitchToken,
    LocalStorageGuestToken
} from '../../constants/constantsLocalStorage.js'

import { nonce, parseHash } from '../../../modules/utils/utils.js'
import { EventSet } from '../../../modules/utils/EventSet.js'
import { serviceApi } from '../api.js'

const redirect = new URL('authRedirect.html', import.meta.url).href

const twitchClientId = `tywvxcigayfhk02zlbz8ijyy01ypve`
const discordClientId = `http${location.host === 'localhost' ? '' : 's'}://${location.host}/discord/`
const googleClientId = '648458932726-ik2ggqrl5qdjl5ikl5rjvtgnjrj26pbq.apps.googleusercontent.com'

export const ProvidersTokenReady = 0
export const ProvidersTokenBusy = 1

let state = ProvidersTokenReady
const onState = new EventSet()
function setState(a) {
    state = a
    onState.emit()
}

function checkBusy() {
    if (state === ProvidersTokenBusy)
        throw new Error('getProvider is busy, check isBusy before call another getProvider')
}

let isPopupWindowOpened = false
function openAuthWindow(url) {
    if (isPopupWindowOpened) return
    isPopupWindowOpened = true

    return new Promise((resolve) => {
        const window_popup = window.open(url,
            "_blank",
            "titlebar=0"
            + ",menubar=0"
            + ",dependent=1"
            + ",modal=1"
            + ",alwaysRaised=1"
            + ",dialog=1"
            + ",scrollbars=1"
            + ",resizable=1"
            + ",width=400"
            + ",height=600")

        function onPopupClose(result = null) {
            isPopupWindowOpened = false
            clearInterval(interval)
            resolve(result)
        }
        const interval = setInterval(() => {
            if (window_popup.closed) {
                onPopupClose()
            }
        }, 500)
        window.resolveAuth = onPopupClose
    })
}

let stateOnce = ''
function getStateOnceToken() {
    stateOnce = nonce(15)
    return stateOnce
}

async function getProviderToken(url) {
    setState(ProvidersTokenBusy)
    const hash = await openAuthWindow(url)
    setState(ProvidersTokenReady)
    return hash
}

async function getTwitchToken() {
    checkBusy()

    const localStorageToken = localStorage.getItem(LocalStorageTwitchToken)
    if (localStorageToken) return localStorageToken

    const url = `https://api.twitch.tv/kraken/oauth2/authorize` +
        `?response_type=token` +
        `&client_id=${twitchClientId}` +
        `&redirect_uri=${redirect}` +
        `&state=${getStateOnceToken()}`

    const hash = parseHash(await getProviderToken(url))

    if (stateOnce === hash.state && hash.access_token) {
        localStorage.setItem(LocalStorageTwitchToken, hash.access_token)
        return hash.access_token
    }

    return
}

async function getDiscordToken() {
    checkBusy()

    const localStorageToken = localStorage.getItem(LocalStorageDiscordToken)
    if (localStorageToken) return localStorageToken

    const url = `https://discord.com/api/oauth2/authorize` +
        `?response_type=token` +
        `&client_id=${discordClientId}` +
        `&redirect_uri=${redirect}` +
        `&state=${getStateOnceToken()}` +
        `&scope=identify`

    const hash = parseHash(await getProviderToken(url))

    if (stateOnce === hash.state && hash.access_token) {
        localStorage.setItem(LocalStorageDiscordToken, hash.access_token)
        return hash.access_token
    }

    return
}

async function getGoogleToken() {
    checkBusy()

    const localStorageToken = localStorage.getItem(LocalStorageGoogleToken)
    if (localStorageToken) return localStorageToken

    const url = `https://accounts.google.com/o/oauth2/v2/auth` +
        `?scope=openid` +
        `&response_type=token` +
        `&redirect_uri=${redirect}` +
        `&client_id=${googleClientId}` +
        `&state=${getStateOnceToken()}`

    const hash = parseHash(await getProviderToken(url))

    if (stateOnce === hash.state && hash.access_token) {
        localStorage.setItem(LocalStorageGoogleToken, hash.access_token)
        return hash.access_token
    }

    return null
}

async function getGuestToken() {
    checkBusy()

    const localStorageToken = localStorage.getItem(LocalStorageGuestToken)
    if (localStorageToken) return localStorageToken

    const token = await serviceApi.getGuestToken()
    if (!token) throw new Error("Cannot get Guest token")

    localStorage.setItem(LocalStorageGuestToken, token)

    return token
}

function clearLocalStorage() {
    localStorage.removeItem(LocalStorageTwitchToken)
    localStorage.removeItem(LocalStorageDiscordToken)
    localStorage.removeItem(LocalStorageGoogleToken)
    localStorage.removeItem(LocalStorageGuestToken)
}

function getFirstLocalStorageToken() {
    const guestToken = localStorage.getItem(LocalStorageGuestToken)
    if (guestToken) return { provider: 'guest', token: guestToken }

    const twitchToken = localStorage.getItem(LocalStorageTwitchToken)
    if (twitchToken) return { provider: 'twitch', token: twitchToken }

    const discordToken = localStorage.getItem(LocalStorageDiscordToken)
    if (discordToken) return { provider: 'discord', token: discordToken }

    const googleToken = localStorage.getItem(LocalStorageGoogleToken)
    if (googleToken) return { provider: 'google', token: googleToken }

    return null
}



export const providersToken = {
    get state() { return state },
    onState,

    getGuestToken,
    getTwitchToken,
    getDiscordToken,
    getGoogleToken,

    clearLocalStorage,
    getFirstLocalStorageToken,
}

