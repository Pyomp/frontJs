let dateNowMs = Date.now()
let dateNowSecond = dateNowMs / 1000
let perfNowMs = 0
let perfNowSecond = 0

const MAX_DT = 0.1
let last = 0

const updates = new Set()

function update(now) {
    dateNowMs = Date.now()
    dateNowSecond = dateNowMs / 1000
    perfNowMs = now
    perfNowSecond = now / 1000

    const dt = Math.min(perfNowSecond - last, MAX_DT)
    last = perfNowSecond

    for (const f of updates) f(dt)

    requestAnimationFrame(update)
}
requestAnimationFrame(update)

export const loop = {
    get dateNowMs() { return dateNowMs },
    get dateNowSecond() { return dateNowSecond },
    get perfNowMs() { return perfNowMs },
    get perfNowSecond() { return perfNowSecond },
    addUpdate(callback) { updates.add(callback) },
    deleteUpdate(callback) { updates.delete(callback) }
}
