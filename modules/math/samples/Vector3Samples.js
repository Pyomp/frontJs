export class Vector3Samples {
    #times
    #deltaTimes = []
    #vector3s
    #last

    /**
     * 
     * @param {number[]} times 
     * @param {Vector3[]} vector3s 
     */
    constructor(times, vector3s) {
        this.#times = times
        this.#vector3s = vector3s
        this.#last = this.#times.length - 1
        this.#initDeltaTime()
    }

    #initDeltaTime() {
        for (let i = 1; i < this.#times.length; i++) {
            this.#deltaTimes[i - 1] = this.#times[i - 1] - this.#times[i]
        }
    }

    /**
     * @param {number} t 
     * @param {Vector3} target 
     */
    getValue(t, target) {
        let i = 0
        while (this.#times[i] < t && i !== this.#last) {
            if (i === 0) target.copy(this.#vector3s[0])
            else if (i === this.#last) target.copy(this.#vector3s[this.#last])
            else {
                const previousIndex = i - 1
                const alpha = (t - this.#times[previousIndex]) / this.#deltaTimes[previousIndex]
                target.lerpVectors(this.#vector3s[previousIndex], this.#vector3s[i], alpha)
            }
            i++
        }
    }
}