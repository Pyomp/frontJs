export const textDecoder = new TextDecoder()
export const textEncoder = new TextEncoder()

export function voidFunction() { }

export function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export const nonce = (length) => {
    let text = ""; const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
    return text
}

export function parseHash(hash) {
    if (hash?.constructor !== String) return {}
    const params = {}
    for (const hk of hash.substring(1).split('&')) {
        const temp = hk.split('=')
        if (temp.length < 2) return {}
        params[temp[0]] = temp[1]
    }
    return params
}

export class TimeoutAbortController extends AbortController {
    constructor(ms) {
        super()
        setTimeout(() => this.abort(), ms)
    }
}

export function eventPreventDefaultStopPropagation(event) { event.preventDefault(), event.stopPropagation() }

/**
 * @template T
 * @param {T} o1 
 * @param {any} o2 
 */
export function mergeObjects(o1, o2 = {}) {
    const o = structuredClone(o1)

    for (const key in o) {
        if (typeof o[key] === 'object' && typeof o2[key] === 'object') {
            o[key] = mergeObjects(o[key], o2[key])
        } else {
            if (o2[key] !== undefined) o[key] = o2[key]
        }
    }
    return o
}

//

const microtaskCallbacks = new Set()
function doItMicrotask() {
    for (const callback of microtaskCallbacks) callback()
    microtaskCallbacks.clear()
}

export function doItOnceNextMicrotask(callback) {
    if (microtaskCallbacks.size === 0) queueMicrotask(doItMicrotask)
    microtaskCallbacks.add(callback)
}

//

const rafCallbacks = new Set()
function doItRaf() {
    for (const callback of rafCallbacks) callback()
    rafCallbacks.clear()
}

export function doItOnceNextRaf(callback) {
    if (rafCallbacks.size === 0) requestAnimationFrame(doItRaf)
    rafCallbacks.add(callback)
}

//
