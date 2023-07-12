export class SharedParticleSystem {

    #worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })

    constructor(params) {

        this.#worker.postMessage(params)
    }

    update() { }

    setParticle(array) {
        const message = new Float32Array(array)
        this.#worker.postMessage(message.buffer, [message.buffer])
    }

    dispose() {
        this.#worker.terminate()
    }
}
