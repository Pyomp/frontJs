export class InitManager {

    #init
    #destroy
    #timeout
    #needsGarbageCollector = false
    #initCount = 0
    #initPromise
    #timeBeforeActualyDestroyMs

    /**
     * Prevent second `init` and only `destroy` when all instances used `destroy`.  
     * `destroy` is delayed (for performance: if init is re-used for a scene switch for example)  
     * @param {()=>Promise } init 
     * @param {()=>{}} destroy
     * @param {number} timeBeforeActualyDestroyMs 
     */
    constructor(init, destroy, timeBeforeActualyDestroyMs = 5000) {
        this.#timeBeforeActualyDestroyMs = timeBeforeActualyDestroyMs
        this.#init = init
        this.#destroy = destroy
    }

    init = (...param) => {
        this.#initCount++
        if (this.#initCount === 1) {
            // if destroy and init are call in short time (like scene => second scene)
            if (this.#needsGarbageCollector === true) {
                clearTimeout(this.#timeout)
                this.#needsGarbageCollector = false
            } else {
                this.#initPromise = this.#init(...param)
            }
        }
        return this.#initPromise
    }

    destroy = (...param) => {
        this.#initCount--
        if (this.#initCount === 0) {
            this.#needsGarbageCollector = true
            this.#timeout = setTimeout(() => {
                this.#needsGarbageCollector = false
                this.#destroy(...param)
            }, this.#timeBeforeActualyDestroyMs)
        }
    }
}





