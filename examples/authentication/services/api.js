import { notification } from "../../../dom/components/notification.js"
import { env } from "../../../env.js"

export const api = {
    async connect(provider, token) {
        try {
            const result = await fetch(`${env.mainServerUrl}/authentication/${provider}/${token}`)
            return await result.json()
        } catch (error) {
            console.warn(error)
        }
    }
}