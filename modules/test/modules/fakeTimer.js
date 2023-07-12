import { ArrayUtils } from '../../utils/ArrayUtils.js'

const isNodeJs = typeof window === 'undefined'

// Request Animation Frame

const rafCallbacks = []
let idRaf = 0
const clearRaf = new Map()

function notAvailable() { console.log(`node js doesn't have raf`) }

const nativeRaf = isNodeJs ? notAvailable : window.requestAnimationFrame
function testRaf(callback) {
    rafCallbacks.push(callback)
    clearRaf.set(idRaf, () => { ArrayUtils.delete(rafCallbacks, callback) })
    return idRaf++
}

const nativeCancelRaf = isNodeJs ? notAvailable : window.cancelAnimationFrame
function testCancelRaf(id) {
    clearRaf.get(id)?.()
}

function nextTickRaf() {
    const a = [...rafCallbacks]
    rafCallbacks.length = 0
    clearRaf.clear()
    idRaf = 0
    for (const callback of a) callback(performanceNow)
}

// Set Timeout

/** @type {Set<Timeout>} */
const timeoutSet = new Set()

class Timeout {
    #args
    constructor(callback, ms, ...args) {
        this.#args = args
        this.ms = ms
        this.callback = callback
        timeoutSet.add(this)
    }

    decreaseTime(ms) {
        this.ms -= ms
        if (this.ms < 0) {
            this.callback(...this.#args)
            timeoutSet.delete(this)
        }
    }
}

const nativeSetTimeout = setTimeout
const testSetTimeout = (callback, ms, ...args) => {
    return new Timeout(callback, ms, ...args)
}

const nativeClearTimeout = clearTimeout
const testClearTimeout = (timeout) => {
    timeoutSet.delete(timeout)
}

function nextTickTimeout(ms) {
    for (const timeout of timeoutSet) {
        timeout.decreaseTime(ms)
    }
}

// Set Interval

/** @type {Set<Interval>} */
const intervalSet = new Set()

class Interval {
    #args
    constructor(callback, ms, ...args) {
        this.#args = args
        this.baseMs = ms
        this.ms = ms
        this.callback = callback
        intervalSet.add(this)
    }

    decreaseTime(ms) {
        this.ms -= ms
        if (this.ms < 0) {
            this.callback(...this.#args)
            this.ms = this.baseMs
        }
    }
}

const nativeSetInterval = setInterval
const testSetInterval = (callback, ms, ...args) => {
    return new Interval(callback, ms, ...args)
}

const nativeClearInterval = clearInterval
const testClearInterval = (interval) => {
    intervalSet.delete(interval)
}

function nextTickInterval(ms) {
    for (const interval of intervalSet) {
        interval.decreaseTime(ms)
    }
}

// Now

let dateNow = Date.now()
let performanceNow = 0

const nativeDateNow = Date.now
const testDateNow = () => dateNow

const nativePerformanceNow = performance.now
const testPerformanceNow = () => performanceNow

export function setDateNow(timestamp) {
    dateNow = timestamp
}

export function setPerformanceNow(ms) {
    performanceNow = ms
}

// Core

export function nextTick(ms, tickCount = 1) {
    for (let i = 0; i < tickCount; i++) {
        performanceNow += ms
        dateNow += ms
        nextTickRaf()
        nextTickTimeout(ms)
        nextTickInterval(ms)
    }
}

function disable() {
    Date.now = nativeDateNow
    performance.now = nativePerformanceNow

    requestAnimationFrame = nativeRaf
    cancelAnimationFrame = nativeCancelRaf
    for (const callback of rafCallbacks) {
        requestAnimationFrame(callback)
    }
    setTimeout = nativeSetTimeout
    clearTimeout = nativeClearTimeout
    setInterval = nativeSetInterval
    clearInterval = nativeClearInterval


    for (const timeout of timeoutSet) {
        setTimeout(timeout.callback, timeout.ms)
    }
    for (const interval of intervalSet) {
        setInterval(interval.callback, interval.baseMs)
    }
}

function enable() {
    dateNow = Date.now()
    performanceNow = 0
    Date.now = testDateNow
    performance.now = testPerformanceNow

    requestAnimationFrame = testRaf
    cancelAnimationFrame = testCancelRaf
    setTimeout = testSetTimeout
    clearTimeout = testClearTimeout
    setInterval = testSetInterval
    clearInterval = testClearInterval
}

export const fakeTimer = {
    setDateNow,
    setPerformanceNow,
    nextTick,
    disableTestLoop: disable,
    enableTestLoop: enable
}
export default fakeTimer

// Test
export function timeTestTest() {
    function coucou() { console.log('coucou') }
    function couscous() { console.log('couscous') }
    let iYep = 0
    function yep(ms) { console.log('yep' + ms) }

    function update(dt) {
        yep(dt)
    }

    let timeout, interval

    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'f':
                enable()
                break
            case 'g':
                disable()
                break
            case 'o':
                // setTimeout(coucou, 1000)
                clearTimeout(timeout)
                clearInterval(interval)
                break
            case 'p':
                interval = setInterval(couscous, 150)
                timeout = setTimeout(couscous, 1000 * Math.random())
                break
            case ' ':
                nextTick(100)
                console.log(dateNow, performanceNow)
                break
            case 'a':
                console.log(timeoutSet)
                console.log(intervalSet)
                console.log(rafCallbacks)
                break
        }
    })
}
