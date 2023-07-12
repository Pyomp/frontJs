const FREE_TIMEOUT = 10_000

/**
 * @typedef {{[assetOrGroupName: string]: Asset | AssetsDictionary}} AssetsDictionary
 * 
 * @param {AssetsDictionary} assetsDictionary 
 */
function freeAll(assetsDictionary) {
    for (const key in assetsDictionary) {
        const value = assetsDictionary[key]
        if (value.freeForce) {
            value.freeForce()
        } else {
            freeAll(value)
        }
    }
}

export class Asset  {
    static freeAll = freeAll

    #load
    #asset
    #isPreloaded = false
    #count = 0
    #freeTimeout

    /**
     * Set autoDispose to false when this asset is used as child
     * (and call this.instanceDispose when a parent dispose)
     */
    constructor({
        load,
        autoDispose = true
    }) {
        this.#load = load
    }

    async #loadPrivate(...data) {
        if (this.#asset) return this.#asset
        const promise = new Promise(async (resolve) => {
            resolve(await this.#load(...data))
        })
        this.#asset = promise
        return promise
    }

    async preload() {
        this.#isPreloaded = true
        return this.#loadPrivate()
    }

    freeForce() {
        clearTimeout(this.#freeTimeout)
        this.#asset = undefined
        this.#isPreloaded = false
    }

    async get() {
        this.#count++
        clearTimeout(this.#freeTimeout)
        return await this.#loadPrivate()
    }

    free() {
        this.#count--
        if (this.#isPreloaded === false && this.#count === 0) {
            this.#freeTimeout = setTimeout(this.freeForce.bind(this), FREE_TIMEOUT)
        }
    }
}





