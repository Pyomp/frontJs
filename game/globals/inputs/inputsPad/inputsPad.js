import { addPointerMoveEvent } from '../../../../modules/dom/eventUtils.js'
import { PI05 } from '../../../../modules/math/MathUtils.js'
import { context3D } from '../../../globals/context3D.js'

export function initInputsPad() {

    let theta = 0
    let length = 0
    let x = 0
    let y = 0


    const baseX = 120
    const baseY = 120

    const bgEdgeFollow = 60

    let posX = baseX
    let posY = baseY

    const padBg = new Image(160, 160)
    padBg.src = new URL('./padBase.svg', import.meta.url).href

    const padBgStyle = padBg.style
    padBgStyle.width = `160px`
    padBgStyle.height = `160px`
    padBgStyle.position = 'absolute'
    padBgStyle.transform = 'translate(-50%, -50%)'
    padBgStyle.top = `${window.innerHeight - posY}px`
    padBgStyle.left = `${posX}px`
    padBgStyle.userSelect = 'none'
    padBg.oncontextmenu = (event) => { event.stopPropagation(); event.preventDefault() }
    document.body.appendChild(padBg)

    const pad = new Image(80, 80)
    pad.src = new URL('./pad.svg', import.meta.url).href

    const padStyle = pad.style
    padStyle.width = `80px`
    padStyle.position = 'absolute'
    padStyle.transform = 'translate(-50%, -50%)'
    padStyle.top = `${window.innerHeight - posY}px`
    padStyle.left = `${posX}px`
    padStyle.pointerEvents = 'none'
    padStyle.userSelect = 'none'
    pad.oncontextmenu = (event) => { event.stopPropagation(); event.preventDefault() }
    document.body.appendChild(pad)

    const onMove = (e) => {
        x = e.x - posX
        y = -e.y + posY
        let distPx = x ** 2 + y ** 2
        if (distPx) {
            distPx = distPx ** 0.5
            x /= distPx
            y /= distPx
        }

        if (distPx > bgEdgeFollow) {
            const r = distPx - bgEdgeFollow
            posX += x * r
            posY -= y * r
            padBgStyle.top = `${posY}px`
            padBgStyle.left = `${posX}px`
            length = 1
        } else {
            length = distPx / bgEdgeFollow
        }
        padStyle.top = `${e.y}px`
        padStyle.left = `${e.x}px`
    }

    addPointerMoveEvent(padBg,
        onMove,
        (e) => {
            posX = e.x
            posY = e.y
            padBgStyle.top = `${posY}px`
            padBgStyle.left = `${posX}px`
            padStyle.top = `${posY}px`
            padStyle.left = `${posX}px`
        },
        () => {
            length = 0
            x = 0
            y = 0
            posX = baseX
            posY = baseY
            padBgStyle.top = `${window.innerHeight - posY}px`
            padBgStyle.left = `${posX}px`
            padStyle.top = `${window.innerHeight - posY}px`
            padStyle.left = `${posX}px`
        }
    )

    addEventListener("resize", () => {
        padBgStyle.top = `${window.innerHeight - posY}px`
        padBgStyle.left = `${posX}px`
        padStyle.top = `${window.innerHeight - posY}px`
        padStyle.left = `${posX}px`
    })

    let c = 0, s = 0
    function update() {
        const angleToAdd = context3D.controls.spherical.theta + PI05
        theta = length > 0 ? Math.atan2(y, x) : PI05
        theta += angleToAdd
        c = Math.cos(angleToAdd)
        s = Math.sin(angleToAdd)
    }

    return {
        update,
        get x() { return x * s + y * c },
        get y() { return x * c - y * s },
        get theta() { return theta }
    }
}
