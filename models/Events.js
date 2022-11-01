export const EventDispose = new Event('dispose')
export const EventClose = new Event('close')
export const EventOpen = new Event('open')
export const EventChange = new Event('change')
export class EventAdd extends Event { constructor(data) { super('add'); this.data = data } }
export class EventDelete extends Event { constructor(data) { super('delete'); this.data = data } }

export class EventSet extends Set {
    emit(...data) {
        for (const cb of this) cb(...data)
    }
    addOnce(callback) {
        const wrap = () => {
            callback()
            this.delete(wrap)
        }
        this.add(wrap)
    }
    addUntilTrue(callback) {
        const wrap = () => {
            if (callback() === true) this.delete(wrap)
        }
        this.add(wrap)
    }
}

const microtaskCallbacks = new Set()
function doIt() {
    for (const callback of microtaskCallbacks) callback()
    microtaskCallbacks.clear()
}

export function doItOnceNextMicrotask(callback) {
    if (microtaskCallbacks.size === 0) queueMicrotask(doIt)
    microtaskCallbacks.add(callback)
}
