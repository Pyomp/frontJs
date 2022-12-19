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
        await Promise.all(keys.map((key) => caches.delete(key)))

        localStorage.setItem('appVersion', version)

        if (navigator.serviceWorker) {
            await Promise.all(
                (await navigator.serviceWorker.getRegistrations())
                    .map((swRegistration) => swRegistration.unregister())
            )
        }

        console.log('Cache cleared.')
        location.reload()
    }
}

/** see `initCaches` function documentation */
export const initServiceWorker = (url = './serviceWorker.js', scope = '/') => {
    return new Promise((resolve) => {
        if (navigator.serviceWorker) {
            navigator.serviceWorker.register(url, { type: 'module' }).then((reg) => {
                if (reg.installing) {
                    location.reload()
                } else if (reg.waiting) {
                    location.reload()
                } else {
                    resolve()
                    // console.log('Service worker active')
                }
            }).catch((error) => {
                resolve()
                console.warn('Registration failed with ' + error)
            })
        }
    })
}