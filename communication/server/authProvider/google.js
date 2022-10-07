import { fetch } from '../../../common/utils.node.js'

export async function getGoogleId(oauthToken) {
    const options = {
        hostname: 'oauth2.googleapis.com',
        port: 443,
        path: `/tokeninfo?access_token=${oauthToken}`,
        method: 'GET',
        timeout: 20_000,
    }

    const data = await fetch(options)
    if (!data) return null
    try {
        const googleId = JSON.parse(data)['sub']
        return googleId
    } catch { return null }
}