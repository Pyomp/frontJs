export const EventDispose = new Event('dispose')
export const EventClose = new Event('close')
export const EventOpen = new Event('open')
export const EventChange = new Event('change')
export class EventAdd extends Event { constructor(data) { super('add'); this.data = data } }
export class EventDelete extends Event { constructor(data) { super('delete'); this.data = data } }

const microtaskCallbacks = new Set()
function doIt() {
    for (const callback of microtaskCallbacks) callback()
    microtaskCallbacks.clear()
}

/**
 * Call the callback one time at the next microtask.  
 * Usecase: if a function change several properties of an object and this object `dispatchEvent` multiple `event`.  
 * 
 * @example
 * ```js
 * object.addEventListener('change', () => { doItOnceNextMicrotask(onObjectChange) })
 * ```
 * `object` extends `EventTarget` and `onObjectChange` is the callback
 * that we want to call only one time after the poll is done (see Event Loop in Javascript).
*/
export function doItOnceNextMicrotask(callback) {
    if (microtaskCallbacks.size === 0) queueMicrotask(doIt)
    microtaskCallbacks.add(callback)
}
