export const onFirstInteraction = new Set()
addEventListener('pointerdown', () => {
    for (const callback of onFirstInteraction) callback()
    onFirstInteraction.clear()
}, { capture: true, once: true })

/**
 * @param {HTMLElement} element 
 * @param {(event: PointerEvent, deltaX: number, deltaY: number) => void} onMove
 * @param {function(PointerEvent): void} onDown
 * @param {function(PointerEvent): void} onUp
 * 
 * @returns {() => void} delete event listeners
 */
export const addPointerMoveEvent = (element, onMove, onDown, onUp) => {
    let lastX, lastY
    element.style.userSelect = 'none'
    element.style.touchAction = 'none'
    let activated = false

    const onpointerdown = (e) => {
        activated = true
        element.setPointerCapture(e.pointerId)
        lastX = e.clientX
        lastY = e.clientY
        if (onDown) onDown(e)
    }
    const onpointermove = (e) => {
        if (activated) {
            onMove(
                e,
                e.clientX - lastX,
                e.clientY - lastY
            )
            lastX = e.clientX
            lastY = e.clientY
        }
    }
    const onlostpointercapture = (e) => {
        activated = false
        element.releasePointerCapture(e.pointerId)
        if (onUp) onUp(e)
    }
    element.addEventListener('pointerdown', onpointerdown)
    element.addEventListener('pointermove', onpointermove)
    element.addEventListener('lostpointercapture', onlostpointercapture)

    return () => {
        element.removeEventListener('pointerdown', onpointerdown)
        element.removeEventListener('pointermove', onpointermove)
        element.removeEventListener('lostpointercapture', onlostpointercapture)
    }
}

export const repeatClick = (element, callback, timeBeforeSecondTickMs = 500, repeatTimeMs = 100) => {
    element.style.userSelect = 'none'
    element.style.touchAction = 'none'

    let timeout, interval
    let isDown = false

    const onPointerDown = (e) => {
        if (isDown) return
        element.setPointerCapture(e.pointerId)
        isDown = true
        callback()
        clearTimeout(timeout)
        clearInterval(interval)
        timeout = setTimeout(() => {
            callback()
            interval = setInterval(callback, repeatTimeMs)
        }, timeBeforeSecondTickMs)
    }

    const onlostpointercapture = (e) => {
        element.releasePointerCapture(e.pointerId)
        isDown = false
        clearTimeout(timeout)
        clearInterval(interval)
    }
    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('lostpointercapture', onlostpointercapture)

    return () => {
        element.removeEventListener('pointerdown', onPointerDown)
        element.removeEventListener('lostpointercapture', onlostpointercapture)
    }
}


