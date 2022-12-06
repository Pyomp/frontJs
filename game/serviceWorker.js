self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('main').then((cache) => {
            return cache.addAll([
                './main.js',
            ])
        })
    )
})

self.addEventListener('fetch', (e) => {
    const req = e.request
    const origin = location.origin
    const url = req.url
    if (
        origin !== url.substring(0, origin.length)
        || url.includes(`version.txt`)) {
        e.respondWith(
            fetch(req)
                .catch((err) => { console.warn(url, err) })
        )
    } else {
        e.respondWith(caches.match(req).then((response) => {
            if (response !== undefined) {
                return response
            } else {
                return fetch(req)
                    .then((response) => {
                        let responseClone = response.clone()
                        caches.open('main').then((cache) => {
                            cache.put(req, responseClone)
                        })
                        return response
                    })
                    .catch((err) => { console.warn(url, err) })
            }
        }))
    }
})
