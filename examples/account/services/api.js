import { env } from "../../../env.js"

export const api = {
    async connect(provider, token) {
        const result = await fetch(`${env.mainServerUrl}/auth`, { body: JSON.stringify({ provider, token }) })
        return result.json()
    }
}