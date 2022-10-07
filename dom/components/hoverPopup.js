import { createHTMLElement, setStyle } from '../htmlElement.js'

const container = createHTMLElement('div', {
    style: {
        position: 'fixed',
        backdropFilter: 'blur(2px)',
        background: 'hsla(0, 0%, 0%, 0.3)',
        borderRadius: '5px',
        padding: '5px',
        zIndex: '15',
        width: 'fit-content',
        maxWidth: '200px',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.3s',
    }
})
const style = container.style

container.addEventListener('transitionend', () => {
    if (style.opacity == 0) {
        container.remove()
    }
})

let interval
const onClose = () => {
    clearInterval(interval)
    style.opacity = 0
}

/**
 * @param {HTMLElement} htmlElement 
 * @param {string | Function} text 
 */
export const hoverPopup = {
    /** @param {CSSStyleDeclaration} containerStyle */
    setStyle: (style) => {
        setStyle(container, style)
    },
    register: (htmlElement, hint) => {
        const isString = typeof hint === 'string'

        const onEnter = (e) => {
            container.innerHTML = ''
            if (isString) container.textContent = hint
            else container.appendChild(hint)

            document.body.appendChild(container)
            queueMicrotask(() => { style.opacity = 1 })

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


export const test = () => {
    const div = createHTMLElement('div', {
        style: {
            height: '100px',
            width: '100px',
            background: 'red',
        },
        parent: document.body
    })

    const div2 = createHTMLElement('div', {
        style: {
            height: '100px',
            width: '100px',
            background: 'green',
        },
        parent: document.body
    })

    hoverPopup.register(div, 'coucou c\'est rouge')
    hoverPopup.register(div2, 'coucou c\'est vert')
}