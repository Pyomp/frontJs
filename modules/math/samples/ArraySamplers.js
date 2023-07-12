class ArraySamplers {
    #deltaTimes = []
    #sampleLength
    #samples
    #last

    /**
     * @param {number[][]} samples 
     */
    constructor(samples) {
        this.#sampleLength = samples[0].length
        this.#samples = samples.flat()
        this.#last = this.#samples.length - this.#sampleLength
        this.#initDeltaTime()
    }

    #initDeltaTime() {
        for (let i = 1; i < this.#samples.length; i += this.#sampleLength) {
            this.#deltaTimes[i - 1] = this.#samples[i - this.#sampleLength] - this.#samples[i]
        }
    }

    /**
     * @param {number} t 
     * @param {TypedArray} target 
     */
    getValue(t, target) {
        let i = 0
        while (this.#samples[i] < t && i !== this.#last) {
            if (i === 0) target.set(target, this.#samples[i + 1])
            else if (i === this.#last) target.set(target, this.#samples[this.#last + 1])
            else {
                const previousIndex = i - 1
                const alpha = (t - this.#samples[previousIndex]) / this.#deltaTimes[previousIndex]

                for (let j = 1; j < this.#sampleLength; j++) {
                    const v1 = this.#samples[previousIndex+j]
                    const v2 = this.#samples[i+j]
                    target[j-1] = v1 + (v2 - v1) * alpha
                }
            }

            i += this.#sampleLength
        }
    }
}
