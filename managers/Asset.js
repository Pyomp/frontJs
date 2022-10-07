const FREE_TIMEOUT = 10_000

/**
 * @typedef {{[assetOrGroupName: string]: Asset | AssetsDictionary}} AssetsDictionary
 * 
 * @param {AssetsDictionary} assetsDictionary 
 */
function freeAll(assetsDictionary) {
    for (const key in assetsDictionary) {
        const value = assetsDictionary[key]
        if (value.free) {
            value.free()
        } else {
            freeAll(value)
        }
    }
}

const EventInstanceDispose = new Event('instanceDispose')

export class Asset extends EventTarget {
    static freeAll = freeAll
    static EventInstanceDispose = EventInstanceDispose.type

    #load
    #create
    #loadedAsset
    #isPreloaded = false
    #count = 0
    #freeTimeout
    #autoDispose

    /**
     * Set autoDispose to false when this asset is used as child
     * (and call this.instanceDispose when a parent dispose)
     */
    constructor({
        load,
        create,
        data,
        autoDispose = true
    }) {
        super()
        this.#load = load
        this.#create = create
        this.data = data
        this.#autoDispose = autoDispose
    }

    async #loadPrivate(...data) {
        if (this.#loadedAsset !== undefined) return this.#loadedAsset
        const promise = new Promise(async (resolve) => {
            resolve(await this.#load(...data))
        })
        this.#loadedAsset = promise
        return promise
    }

    async preload() {
        this.#isPreloaded = true
        return this.#loadPrivate()
    }

    free() {
        clearTimeout(this.#freeTimeout)
        this.#loadedAsset = undefined
        this.#isPreloaded = false
    }

    async create(...data) {
        this.#count++
        clearTimeout(this.#freeTimeout)
        const loadedAsset = await this.#loadPrivate(...data)
        const object = this.#create(loadedAsset)
        if (this.#autoDispose) object.addEventListener('dispose', this.instanceDispose.bind(this))
        return object
    }

    instanceDispose() {
        this.#count--
        if (this.#isPreloaded === false && this.#count === 0) {
            this.#freeTimeout = setTimeout(this.free.bind(this), FREE_TIMEOUT)
        }
        this.dispatchEvent(event)
    }
}





