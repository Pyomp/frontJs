import { getDiscordId } from './discord.js'
import { getGoogleId } from './google.js'
import { getTwitchId } from './twitch.js'
import { twitchView } from './redirectViews/twitch.js'
import { discordView } from './redirectViews/discord.js'
import { googleView } from './redirectViews/google.js'

const getProviderId = {
    'twitch': getTwitchId,
    'discord': getDiscordId,
    'google': getGoogleId
}

export const authProviders = {
    getIdFromOauth(provider, oauthToken) {
        const callback = getProviderId[provider]
        if (callback) return callback(oauthToken)
        else throw new Error('provider unknown')
    },

    htmls: {
        'twitch': twitchView,
        'discord': discordView,
        'google': googleView,
    },
}