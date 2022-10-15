
export class Timer {
    updatesSecond = new Set()
    updatesMinute = new Set()
    updatesHour = new Set()
    updatesDay = new Set()

    #last_s = 0
    #last_m = 0
    #last_h = 0
    #last_d = 0

    #interval
    constructor() {
        this.#interval = setInterval(this.#update, 1000)
    }

    #update = () => {

        const now = Date.now() / 1000
        if (now - this.#last_s > 1) {
            this.#last_s = now | 0
            for (const cb of this.updatesSecond) {
                if (cb(this.#last_s % 60) === true)
                    this.updatesSecond.delete(cb)
            }

            const now_m = now / 60
            if (now_m - this.#last_m > 1) {
                this.#last_m = now_m | 0
                for (const cb of this.updatesMinute) {
                    if (cb(this.#last_m % 60) === true) this.updatesMinute.delete(cb)
                }

                const now_h = now_m / 60
                if (now_h - this.#last_h > 1) {
                    this.#last_h = now_h | 0
                    for (const cb of this.updatesHour) {
                        if (cb(this.#last_h % 24) === true) this.updatesHour.delete(cb)
                    }

                    const now_d = now_h / 24
                    if (now_d - this.#last_d > 1) {
                        this.#last_d = now_d | 0
                        for (const cb of this.updatesDay) {
                            if (cb((this.#last_d + 3) % 7) === true) this.updatesDay.delete(cb)
                        }
                    }
                }
            }
        }
    }

    dispose = () => { clearInterval(this.#interval) }

}


const test = () => {
    const timer_manager = new Timer()
    timer_manager.updatesHour.add((h) => { console.log('new hour', h) })
    timer_manager.updatesMinute.add((m) => { console.log('new minute', m) })
    timer_manager.updatesSecond.add((s) => { console.log('new second', s) })
    timer_manager.updatesDay.add((d) => { console.log('new day', d) })
}

