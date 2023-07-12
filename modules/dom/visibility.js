let _isVisible = document.visibilityState === 'visible'

function onVisibilityChange() {
    _isVisible = document.visibilityState === 'visible'
    for (const fn of onVisibility) fn()
}
addEventListener('visibilitychange', onVisibilityChange)

const onVisibility = new Set()

export const visibility = {
    addListener(callback, option = { once: false }) {
        if (option.once) {
            const callbackWrapper = () => {
                callback()
                onVisibility.delete(callbackWrapper)
            }
            onVisibility.add(callbackWrapper)
        } else {
            onVisibility.add(callback)

        }
    },
    removeListener(callback) { onVisibility.delete(callback) },
    get isVisible() { return _isVisible }
}
