let dateNowMs = Date.now()
let dateNowSecond = dateNowMs / 1000
let perfNowMs = 0
let perfNowSecond = 0
let dt_s

const MAX_DT = 0.1
let last = 0

const beforeRenderListeners = new Set()
const afterRenderListeners = new Set()

function init(renderer, controls) {
    const draw = renderer.draw
    const controlsUpdate = controls.update
    function update(now) {
        dateNowMs = Date.now()
        dateNowSecond = dateNowMs / 1000
        perfNowMs = now
        perfNowSecond = now / 1000

        dt_s = Math.min(perfNowSecond - last, MAX_DT)
        last = perfNowSecond

        for (const cb of beforeRenderListeners) cb(dt_s)

        controlsUpdate()
        draw(dt_s)

        for (const cb of afterRenderListeners) cb(dt_s)

        requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
}
export const loopRaf = {
    init(renderer, controls) {
        delete loopRaf.init; init(renderer, controls)
    },
    get dateNowMs() { return dateNowMs },
    get dateNowSecond() { return dateNowSecond },
    get perfNowMs() { return perfNowMs },
    get perfNowSecond() { return perfNowSecond },
    get dt_s() { return dt_s },
    beforeRenderListeners,
    afterRenderListeners
}
