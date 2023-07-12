import { mutationManager } from './mutationManager.js'

let tryBack = 0
const historyElements = []

function previous() {
    document.activeElement instanceof HTMLElement && document.activeElement.blur()

    const poppedElement = historyElements.pop()
    if (poppedElement) poppedElement.remove()
}

/** 
 * Diverted use of history API.  
 * Trigger previous on `Escape` key.  
 */
function init() {
    history.go(1)
    history.pushState(1, "")
    history.pushState(2, "")

    // History
    window.onpopstate = (e) => {
        e.preventDefault()
        if (e.state === 1) {
            if (historyElements.length === 0 && tryBack === 1) {
                history.go(-2)
            } else if (historyElements.length === 0) {
                tryBack = 1
                setTimeout(() => { tryBack = 0 }, 2000)
            } else {
                tryBack = 0
            }
            previous()
        } else { // safety
            history.go(1)
        }
    }

    mutationManager.onRemovedNodes.add((removedNodes) => {
        for (const node of removedNodes) {
            deleteElement(node)
        }
    })

    window.addEventListener('keydown', (event) => {
        if (event.code === 'Escape') { previous() }
    }, { capture: true })
}

/**
 * Add an element to remove if the previous button is triggered.
*/
function add(element) {
    tryBack = 0
    deleteElement(element)
    historyElements.push(element)
}

function deleteElement(element) {
    const index = historyElements.indexOf(element)
    if (index !== -1) historyElements.splice(index, 1)
}

/**
 * Use the history previous button (previous on mobile) has a "closer".  
 * When this button is triggered, remove the last added `HTMLElement`.  
 * If the `HTMLElement` is removed from another thing, the element will 
 * be automatically removed from this history.  
 * To trigger a close event on the element remove (for example to reset a state at the close)
 * you can use `mutationManager` (see "./mutationManager.js").
 */
export const historyClose = {
    previous,
    add,
    delete: deleteElement,
}

document.addEventListener('DOMContentLoaded', () => { init() })
