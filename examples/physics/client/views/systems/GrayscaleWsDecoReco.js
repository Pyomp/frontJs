import { WebSocketClientManager } from '../../../../modules/communication/websocketAppdata/WebSocketClientManager.js'
import { View } from '../../../../modules/dom/View.js'
import { ws } from '../../global.js'

function recPointerUpDispatch(element = document.body) {
    element.dispatchEvent(new PointerEvent('pointerup'))
    for (const child of element.children) {
        rec(child)
    }
}

/**
 * Handle deco/reco
*/
export class GrayscaleWsDecoReco {

    #div = new View('div', {
        style: {
            position: 'fixed', top: '-10%', left: '-10%',
            width: '120%', height: '120%',
            zIndex: '99999',
        }
    }).element

    constructor() {
        const onState = async () => {
            if (ws.state === WebSocketClientManager.OPEN) {
                this.#div.remove()
                document.body.style.filter = ''
            } else {
                recPointerUpDispatch()
                document.body.appendChild(this.#div)
                document.body.style.filter = 'grayscale(1)'
            }
        }

        onState()

        ws.onState.add(onState)
    }
}
