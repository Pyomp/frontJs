
///////////////// MICROTASK ONCE ///////////////////

let requestMicrotask = false
const callbackSetMicrotask = new Set()

const updateMicrotask = () => {
    for (const callback of callbackSetMicrotask) callback()
    callbackSetMicrotask.clear()
    requestMicrotask = false
}

/**
 * `queueMicrotask` the callback only once for one event loop  
 * Example: proxy multiple properties change  
*/
export const queueMicrotaskOnce = {
    add: (callback) => {
        callbackSetMicrotask.add(callback)
        if (requestMicrotask === false) {
            requestMicrotask = true
            queueMicrotask(updateMicrotask)
        }
    },
    delete: (callback) => {
        callbackSetMicrotask.delete(callback)
    }
}

////////////////// RAF ONCE /////////////////////

let requestRaf = false
const callbackSetRaf = new Set()

const updateRaf = () => {
    for (const callback of callbackSetRaf) callback()
    callbackSetRaf.clear()
    requestRaf = false
}

/**
 * `requestAnimationFrame` the callback only once for one event loop  
 * Example: change HTMLElement `textContent`  
*/
export const queueRafOnce = {
    add: (callback) => {
        callbackSetRaf.add(callback)
        if (requestRaf === false) {
            requestRaf = true
            requestAnimationFrame(updateRaf)
        }
    },
    delete: (callback) => {
        callbackSetRaf.delete(callback)
    }
}