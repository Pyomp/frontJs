import { env } from "../env.js"

export const serviceApi = {
    async getGuestToken() {
        try {
            const result = await fetch(`${env.mainServerUrl}/authentication/guest/`)
            return await result.text()
        } catch (error) {
            console.warn(error)
        }
    },
    async connect(provider, token) {
        try {
            const result = await fetch(`${env.mainServerUrl}/authentication/${provider}/${token}`)
            return await result.json()
        } catch (error) {
            console.warn(error)
        }
    }
}