// @ts-nocheck

import { env } from "../../../../game/env.js"

self.addEventListener('install', (event) => { })

const IgnoredFilesName = ['version.txt']
function isIgnoredFiles(url) {
    for (const fileName of IgnoredFilesName) {
        const ignore = fileName === url.slice(-fileName.length)
        if (ignore) {
            return true
        }
    }
    return false
}

self.addEventListener('fetch', (e) => {
    const req = e.request
    const origin = location.origin
    const url = req.url
    const isFromOrigin = origin === url.substring(0, origin.length)

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

                    if (isFromOrigin && !env.isDev && !isIgnoredFiles(url)) {
                        const responseClone = response.clone()
                        caches.open('main').then((cache) => {
                            cache.put(req, responseClone)
                        })
                    }
                    return response
                })
                .catch((err) => { console.warn(url, err) })
        }
    }))
})
