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
        origin === 'http://localhost:5500'
        || origin !== url.substring(0, origin.length)
        || url.includes(`version.txt`)) {
        e.respondWith(

            fetch(req)
                .then((response) => {

                    const newHeaders = new Headers(response.headers)
                    newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp")
                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin")

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    })
                })
                .catch((err) => { console.warn(url, err) })
        )
    } else {
        e.respondWith(caches.match(req).then((response) => {
            if (response !== undefined) {
                return response
            } else {
                return fetch(req)
                    .then((initialResponse) => {

                        const newHeaders = new Headers(initialResponse.headers)
                        newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp")
                        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin")

                        const response = new Response(initialResponse.body, {
                            status: initialResponse.status,
                            statusText: initialResponse.statusText,
                            headers: newHeaders,
                        })

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
