import { notification } from "../dom/components/notification.js"

class Logger {
    #color

    notificationEnabled = true

    constructor({
        color = 'hsl(30, 60%, 100%)'
    } = {}) {
        this.#color = color
    }

    push(str) {
        if (this.notificationEnabled) notification.push(str, this.#color)
    }
}

export const serviceLogger = {
    system: new Logger({ color: 'hsl(200, 100%, 70%)' }),
    info: new Logger({ color: 'hsl(300, 70%, 100%)' }),
    debug: new Logger({ color: 'hsl(120, 100%, 70%)' }),
    warn: new Logger({ color: 'hsl(60, 100%, 70%)' }),
}