
let last_s = 0
let last_m = 0
let last_h = 0
let last_d = 0

setInterval(update, 1000)

const secondListeners = new Set()
const minuteListeners = new Set()
const hourListeners = new Set()
const dayListeners = new Set()

export const timer = {
    secondListeners,
    minuteListeners,
    hourListeners,
    dayListeners,
}

function update() {
    const now = Date.now() / 1000
    if (now - last_s > 1) {
        last_s = now | 0
        for (const cb of secondListeners) {
            if (cb(last_s % 60) === true)
                secondListeners.delete(cb)
        }

        const now_m = now / 60
        if (now_m - last_m > 1) {
            last_m = now_m | 0
            for (const cb of minuteListeners) {
                if (cb(last_m % 60) === true) minuteListeners.delete(cb)
            }

            const now_h = now_m / 60
            if (now_h - last_h > 1) {
                last_h = now_h | 0
                for (const cb of hourListeners) {
                    if (cb(last_h % 24) === true) hourListeners.delete(cb)
                }

                const now_d = now_h / 24
                if (now_d - last_d > 1) {
                    last_d = now_d | 0
                    for (const cb of dayListeners) {
                        if (cb((last_d + 3) % 7) === true) dayListeners.delete(cb)
                    }
                }
            }
        }
    }
}
