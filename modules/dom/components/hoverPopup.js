const container = document.createElement('div')
const style = container.style
style.position = 'fixed'
style.backdropFilter = 'blur(2px)'
style.background = 'hsla(0, 0%, 0%, 0.3)'
style.borderRadius = '5px'
style.padding = '5px'
style.zIndex = '15'
style.width = 'fit-content'
style.maxWidth = '200px'
style.pointerEvents = 'none'
style.opacity = '0'
style.transition = 'opacity 0.3s'

container.addEventListener('transitionend', () => {
    if (style.opacity === '0') {
        container.remove()
    }
})

let interval
const onClose = () => {
    clearInterval(interval)
    style.opacity = '0'
}

/**
 * @param {HTMLElement} htmlElement 
 * @param {string | Function} text 
 */
export const hoverPopup = {
    register: (htmlElement, hint) => {
        const isString = typeof hint === 'string'

        const onEnter = (e) => {
            container.innerHTML = ''
            if (isString) container.textContent = hint
            else container.appendChild(hint)

            document.body.appendChild(container)
            queueMicrotask(() => { style.opacity = '1' })

            const { top, right, bottom, left } = htmlElement.getBoundingClientRect()
            const { height, width } = container.getBoundingClientRect()

            if (top > height) style.top = `${top - height}px`
            else style.top = `${bottom}px`

            const middleX = (right + left - width) / 2
            if (middleX < 0) {
                style.left = '0'
            } else {
                if ((middleX + width) > innerWidth) style.left = `${innerWidth - width}px`
                else style.left = `${middleX}px`
            }

            // check if parent is removed
            clearInterval(interval)
            interval = setInterval(() => { if (!htmlElement.offsetParent) onClose() }, 500)
        }

        htmlElement.addEventListener('pointerenter', onEnter)
        htmlElement.addEventListener('pointerleave', onClose)
        htmlElement.addEventListener('pointercancel', onClose)

        return () => {
            htmlElement.removeEventListener('pointerenter', onEnter)
            htmlElement.removeEventListener('pointerleave', onClose)
            htmlElement.removeEventListener('pointercancel', onClose)
            onClose()
        }
    }
}
