import { twitchClientId } from '../../config.js'

export async function getTwitchId(oauthToken) {
    const options = {
        hostname: 'api.twitch.tv',
        port: 443,
        path: '/helix/users',
        method: 'GET',
        timeout: 20_000,
        headers: {
            'Client-Id': twitchClientId,
            'Authorization': `Bearer ${oauthToken}`,
        }
    }

    const data = await fetch(options)
    const twitchId = JSON.parse(data)['data'][0]['id']
    return twitchId
}