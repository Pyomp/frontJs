import http from 'http'

const createResJson = (resolve, reject) => (res) => {
    res.setEncoding('utf8')
    let rawData = ''
    res.on('data', (chunk) => { rawData += chunk })
    res.on('end', () => {
        try {
            resolve(JSON.parse(rawData))
        } catch (error) {
            reject(error)
        }
    })
}

export const chromeHttp = {
    getDebugList(port = 9222) {
        return new Promise((resolve, reject) => {
            http.get(
                `http://localhost:${port}/json/list`,
                createResJson(resolve, reject))
        })
    },
    putNewTab(port, url) {
        return new Promise((resolve, reject) => {
            http
                .request(
                    {
                        host: `localhost`,
                        port,
                        path: `/json/new?${url}`,
                        method: 'PUT'
                    },
                    createResJson(resolve, reject)
                )
                .on('error', reject)
                .end()
        })
    }
}
