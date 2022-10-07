import { nonce } from '../../../../common/utils.js'
import { localstorageProvidersKey, twitchClientId } from '../../../config.js'

export const getTwitchToken = async (
    redirectURI = `http${location.host === 'localhost' ? '' : 's'}://${location.host}/twitch/`,
    ...scopes
) => {
    const token = localStorage.getItem(localstorageProvidersKey.twitch)
    if (token) {
        return token
    } else {
        const state = nonce(15)
        sessionStorage.setItem(localstorageProvidersKey.state, state)

        await new Promise((resolve) => {
            const scope = scopes.join('%20')
            const url = `https://api.twitch.tv/kraken/oauth2/authorize` +
                `?response_type=token` +
                `&client_id=${twitchClientId}` +
                `&redirect_uri=${redirectURI}` +
                `&state=${state}` +
                (scopes ? `&scope=${scope}` : '')

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

            const interval = setInterval(() => {
                if (window_popup.closed) {
                    clearInterval(interval)
                    resolve()
                }
            }, 500)
        })

        return localStorage.getItem(localstorageProvidersKey.twitch) || undefined

    }
}
