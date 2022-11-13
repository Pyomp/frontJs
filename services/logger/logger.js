import { notification } from "../../dom/components/notification.js"

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

export const logger = {
    system: new Logger({ color: 'hsl(0, 60%, 100%)' }),
    info: new Logger({ color: 'hsl(300, 60%, 100%)' }),
    debug: new Logger({ color: 'hsl(120, 60%, 100%)' }),
    warn: new Logger({ color: 'hsl(60, 60%, 100%)' }),
}