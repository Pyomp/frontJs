/**
 * needs a `version.txt` on the top of the server  
 * use "`appVersion`" key in `localStorage`  
 * typical use is in the js entry:
 * ```js
 * await initCaches()
 * initServiceWorker()
 * ```
 */
export const initCaches = async () => {
    if (!self.caches) return
    const version = await (await fetch(`./version.txt`)).text()
    const lastVersion = localStorage.getItem('appVersion')

    if (lastVersion !== version) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => {
            caches.delete(key)
        }))
        const cache = await caches.open('main')
        await cache.addAll([
            './',
        ])
        localStorage.setItem('appVersion', version)
        console.log('Cache cleared.')
        location.reload()
    }
}

/** see `initCaches` function documentation */
export const initServiceWorker = (url = './serviceWorker.js', scope = '/') => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(url, { type: 'module' }).then((reg) => {
            if (reg.installing) {
                location.reload()
            } else if (reg.waiting) {
                location.reload()
            } else if (reg.active) { 
                // console.log('Service worker active')
            }
        }).catch((error) => {
            console.warn('Registration failed with ' + error)
        })
    }
}