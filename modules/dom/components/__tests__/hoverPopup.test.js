import { hoverPopup } from "../hoverPopup.js"

describe('Display', () => {
    it('should display a popup when we enter in the element', async () => {
        const div = document.createElement('div')
        div.style.height = '100px'
        div.style.width = '100px'
        div.style.background = 'red'

        document.body.appendChild(div)

        hoverPopup.register(div, 'coucou c\'est vert')

        div.dispatchEvent(new Event('pointerenter'))

        expect(document.body.lastElementChild.textContent).toBe('coucou c\'est vert')
    })

    it('should set opacity to 0 when we have left the element', async () => {
        const div = document.createElement('div')
        div.style.height = '100px'
        div.style.width = '100px'
        div.style.background = 'red'

        document.body.appendChild(div)

        hoverPopup.register(div, 'coucou c\'est vert')

        div.dispatchEvent(new Event('pointerenter'))
        div.dispatchEvent(new Event('pointerleave'))

        const popup = document.body.lastElementChild

        expect(popup instanceof HTMLElement && popup.style.opacity).toBe('0')
    })

    it('should remove the popup element when transition to 0 opacity is done', () => {
        const div = document.createElement('div')
        div.style.height = '100px'
        div.style.width = '100px'
        div.style.background = 'red'

        document.body.appendChild(div)

        hoverPopup.register(div, 'coucou c\'est vert')

        div.dispatchEvent(new Event('pointerenter'))

        const popup = document.body.lastElementChild

        div.dispatchEvent(new Event('transitionend'))

        expect(popup.parentElement === null).toBe(false)

        div.dispatchEvent(new Event('pointerleave'))

        popup.dispatchEvent(new Event('transitionend'))

        expect(popup.parentElement).toBe(null)
    })
})
