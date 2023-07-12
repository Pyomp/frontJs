import { env } from "./env.js"

const IgnoredFilesName = [
    'version.txt'
]

function isIgnoredFiles(url) {
    for (const fileName of IgnoredFilesName) {
        const ignore = fileName === url.slice(-fileName.length)
        if (ignore) return true
    }
    return false
}

function isFromOrigin(url) {
    return location.origin === url.substring(0, location.origin.length)
}

async function putInCache(request, response) {
    const responseClone = response.clone()
    const mainCache = await caches.open('main')
    console.log('coched')
    await mainCache.put(request, responseClone)
}

async function getResponse(request) {
    const cacheResponse = await caches.match(request)

    if (cacheResponse !== undefined) {
        return cacheResponse
    } else {
        const response = await fetch(request)

        if (
            isFromOrigin(request.url)
            && !env.isDev
            && !isIgnoredFiles(request.url)
        ) {
            putInCache(request, response)
        }

        return response
    }
}

self.addEventListener('fetch', (/** @type {any} */ event) => {
    event.respondWith(getResponse(event.request))
})
