import { notification } from "../../modules/dom/components/notification.js"

class Logger {
    #color

    constructor({
        color = 'hsl(30, 60%, 100%)',
        notificationEnabled = false
    } = {}) {
        this.#color = color,
            this.notificationEnabled = notificationEnabled
    }

    push(...data) {
        if (this.notificationEnabled)
            notification.push(data.map(a => a?.toString?.() || 'undefine').join(' '), this.#color)
    }
}

export const logger = {
    init() {
        delete this.init
        const log = new Logger({ color: 'hsl(300, 70%, 100%)' })
        const info = new Logger({ color: 'hsl(300, 70%, 100%)' })
        const error = new Logger({ color: 'hsl(0, 100%, 70%)' })
        const warn = new Logger({ color: 'hsl(60, 100%, 70%)' })
    }
}
