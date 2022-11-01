import { button, div, span } from "../../../dom/View.js"
import { ws, WsConnecting } from "../services/wsManager.js.js"

function createView() {
    return div({}, [
        button({ ref: 'pingButton', textContent: 'Ping !' }),
        span({ ref: 'pongSpan' })
    ])
}
export function initPlayWithPing() {
    const view = createView()
    const { pingButton, pongSpan } = view.ref

    pingButton.addEventListener('click', async () => {
        pingButton.disabled = true
        const t0 = performance.now()
        await ws.request('ping')
        pongSpan.textContent = `Pong ! (${performance.now() - t0} ms)`
        pingButton.disabled = false
    })
}