import { fetch } from '../../../common/utils.node.js'

export async function getDiscordId(oauthToken) {
    const options = {
        hostname: 'discordapp.com',
        port: 443,
        path: '/api/users/@me',
        method: 'GET',
        timeout: 20_000,
        headers: {
            'Authorization': `Bearer ${oauthToken}`,
        }
    }
    const data = await fetch(options)
    if (!data) throw  null
    try {
        const discordId = JSON.parse(data)['id']
        return discordId
    } catch { return null }
}