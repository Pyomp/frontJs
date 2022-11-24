import { addPointerMoveEvent } from '../../../dom/eventUtils.js'

export function initInputsPad() {

    let theta = 0
    let length = 0
    let x = 0
    let y = 0


    const baseX = 80
    const baseY = 80

    const bgEdgeFollow = 60

    const xmlns = "http://www.w3.org/2000/svg"

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
    parent.appendChild(padBg)

    const pad = new Image(80, 80)
    pad.src = new URL('./pad.svg', import.meta.url).href

    const padStyle = pad.style
    padStyle.width = `80px`
    padStyle.position = 'absolute'
    padStyle.transform = 'translate(-50%, -50%)'
    padStyle.top = `${window.innerHeight - posY}px`
    padStyle.left = `${posX}px`
    padStyle.pointerEvents = 'none'
    parent.appendChild(pad)

    const onMove = (e) => {
        x = e.x - posX
        y = -e.y + posY
        if (x !== 0 || y !== 0) {            
            const distPx = (x ** 2 + y ** 2) ** 0.5
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

    function update() {
        theta = Math.atan2(y, x)
    }

    return {
        update,
        get theta() { return theta },
        get length() { return length },
        get x() { return x },
        get y() { return y }
    }
}