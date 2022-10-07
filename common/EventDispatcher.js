export class EventDispatcher {
    #callbacks = {}
    #callbacksType = {}

    emit(property) {
        const type = this.#callbacksType[property]
        if (type === undefined) return
        else if (type === 1) this.#callbacks[property]()
        else if (type === 2) for (const f of this.#callbacks[property]) f()
    }

    addEventListener(property, listener) {
        const type = this.#callbacksType[property]
        if (type === 1) {
            const set = new Set()
            set.add(this.#callbacks[property])
            set.add(listener)
            this.#callbacksType[property] = 2
            this.#callbacks[property] = set
        } else if (type === 2) {
            this.#callbacks[property].add(listener)
        } else {
            this.#callbacksType[property] = 1
            this.#callbacks[property] = listener
        }
    }

    removeEventListener(property, listener) {
        const type = this.#callbacksType[property]
        if (type === 1) {
            if (this.#callbacks[property] === listener) {
                delete this.#callbacks[property]
                delete this.#callbacksType[property]
            }
        } else if (type === 2) {
            this.#callbacks[property].delete(listener)
            if (this.#callbacks[property].size === 1) {
                this.#callbacks[property] = this.#callbacks[property].values().next().value
                this.#callbacksType[property] = 1
            }
        }
    }
}

/** 2022/07/17 */
class EventDispatcherOld {

    #onChange = {}

    addEventListener(event, callback) {
        if (this.#onChange[event] === undefined) this.#onChange[event] = new Set()
        this.#onChange[event].add(callback)
    }

    removeEventListener(event, callback) {
        const set = this.#onChange[event]
        if (set === undefined) return
        set.delete(callback)
        if (set.sise === 0) delete this.#onChange[event]
    }

    emit(event, ...info) {
        if (this.#onChange[event] === undefined) return
        for (const cb of this.#onChange[event]) cb(...info)
    }
}


export class EventSet extends Set {
    emit(...data) {
        for (const cb of this) cb(...data)
    }
}
