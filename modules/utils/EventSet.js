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
