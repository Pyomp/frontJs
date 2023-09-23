import { websocketGame } from "./websocketGame.js"

export const store = {
    init() {
        return new Promise((resolve) => {
            websocketGame.jsonDispatcher[1] = (data) => {
                store.id = data.id
                resolve()
            }
        })
    },
    id: 0n,
}
