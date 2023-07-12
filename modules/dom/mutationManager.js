const displayListeners = new Map()
const removeListeners = new Map()

/**
 * Use a MutationObserver (see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
 * 
 * This util trigger events when a `HTMLElement` is added or removed.
*/
export const mutationManager = {
    /** @type {Set<(addedNodes: NodeList) => void>} */
    onAddedNodes: new Set(),

    /** @type {Set<(removedNodes: NodeList) => void>} */
    onRemovedNodes: new Set(),

    /**
     * @param {Element} element 
     * @param {()=>{}} callback no params will be passed
     */
    addDisplayListener(element, callback) {
        displayListeners.set(element, callback)
    },

    /**
   * @param {Element} element 
   */
    removeDisplayListener(element) {
        displayListeners.delete(element)
    },

    /**
   * @param {Element} element 
   * @param {()=>{}} callback no params will be passed
   */
    addCloseListener(element, callback) {
        removeListeners.set(element, callback)
    },

    /**
   * @param {Element} element 
   */
    removeCloseListener(element) {
        removeListeners.delete(element)
    },
}

const mutationObserver = new MutationObserver((mutationRecords) => {
    for (const mutationRecord of mutationRecords) {
        if (mutationRecord.addedNodes.length > 0) {
            for (const callback of mutationManager.onAddedNodes) callback(mutationRecord.addedNodes)

            for (const child of mutationRecord.addedNodes) {
                if (displayListeners.has(child)) {
                    displayListeners.get(child)()
                }
            }
        }

        if (mutationRecord.removedNodes.length > 0) {
            for (const callback of mutationManager.onRemovedNodes) callback(mutationRecord.removedNodes)

            for (const child of mutationRecord.removedNodes) {
                if (removeListeners.has(child)) {
                    removeListeners.get(child)()
                }
            }
        }
    }
})

mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
})
