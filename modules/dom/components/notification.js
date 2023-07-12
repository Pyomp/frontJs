import { visibility } from "../visibility.js"

const FADE = 0.5
const MAX_INFO = 5
const TIME_ALIVE = 2_000

const elements = []

const model = document.createElement('div')

const STROKE_COLOR = '#000'
const STROKE_SIZE = 1

const s = model.style
s.fontWeight = '600'
s.fontSize = 'large'
s.wordBreak = 'break-all'
s.maxWidth = '350px'
s.pointerEvents = 'none'
s.textShadow = `-1px -1px ${STROKE_SIZE}px ${STROKE_COLOR},
                 0   -1px ${STROKE_SIZE}px ${STROKE_COLOR},
                 1px -1px ${STROKE_SIZE}px ${STROKE_COLOR},
                 1px  0   ${STROKE_SIZE}px ${STROKE_COLOR},
                 1px  1px ${STROKE_SIZE}px ${STROKE_COLOR},
                 0    1px ${STROKE_SIZE}px ${STROKE_COLOR},
                -1px  1px ${STROKE_SIZE}px ${STROKE_COLOR},
                -1px  0   ${STROKE_SIZE}px ${STROKE_COLOR}`
s.position = 'fixed'
s.zIndex = '888'
s.transition = `opacity ${FADE}s, bottom ${FADE}s`
s.pointerEvents = 'none'
s.userSelect = 'none'

let baseBottom = 0
function computeBaseBottom() {
    baseBottom = Math.floor(window.innerHeight - window.innerHeight / 5)
}
computeBaseBottom()
window.addEventListener('resize', computeBaseBottom)

export const notification = {
    get maxInfo() { return maxInfo },
    set maxInfo(a) { maxInfo = a; computeDivs() },

    get fadeTime() { return fadeTime },
    set fadeTime(a) { fadeTime = a; computeDivs() },

    get timeBeforeFade() { return timeBeforeFade },
    set timeBeforeFade(a) { timeBeforeFade = a; computeDivs() },

    i18n: (element, text) => {
        element.textContent = text
    },

    push(str, color = 'hsl(10, 100%, 60%)') {
        if (!visibility.isVisible) return
        const clone = model.cloneNode()
        document.body.appendChild(clone)
        elements.unshift(clone)

        function onEnd() {
            if (clone.style.opacity === '0') {
                clone.remove()
            }
        }
        clone.ontransitionend = onEnd
        clone.ontransitioncancel = onEnd

        setTimeout(() => {
            if (clone.style.opacity !== '0') {
                clone.style.bottom = `${+clone.style.bottom.slice(0, -2) + clone.scrollHeight}px`
                clone.style.opacity = '0'
            }
        }, TIME_ALIVE)

        clone.style.color = color
        this.i18n(clone, str)

        clone.style.opacity = 0
        clone.style.bottom = `${baseBottom - 30}px`

        requestAnimationFrame(() => {
            clone.style.transform = `translateX(${window.innerWidth / 2 - clone.scrollWidth / 2}px)`
            clone.style.opacity = '0.8'
            let height = 0
            for (let i = 0; i < MAX_INFO; i++) {
                const element = elements[i]
                if (!element) break
                element.style.bottom = `${baseBottom + height}px`
                height += element.scrollHeight
            }

            while (elements.length > MAX_INFO) {
                const element = elements.pop()
                element.style.bottom = `${baseBottom + height}px`
                height += element.scrollHeight
                element.style.opacity = '0'
            }
        })
    }
}
