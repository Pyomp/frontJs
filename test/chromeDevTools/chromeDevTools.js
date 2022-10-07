import { WebSocket } from 'ws'
import http from 'http'

const ChromeDebugPort = '9222'

const chromeList = await new Promise((resolve) => {
    http.get(
        `http://localhost:${ChromeDebugPort}/json/list`,
        (res) => {
            res.setEncoding('utf8')
            let rawData = ''
            res.on('data', (chunk) => { rawData += chunk })
            res.on('end', () => { resolve(JSON.parse(rawData)) })
        })
})

const testTabs = chromeList.filter(a => a.title === 'test')

const ws = new WebSocket(testTabs[0].webSocketDebuggerUrl)

function send(command) {
    ws.send(JSON.stringify(command))
    return new Promise(resolve => {
        const onMessage = (text) => {
            const response = JSON.parse(text)
            if (response.id === command.id) {
                ws.removeListener('message', onMessage)
                resolve(response)
            }
        }
        ws.on('message', onMessage)
    })
}

await new Promise((resolve) => { ws.onopen = () => { resolve() } })

// ws.onmessage = (event) => { console.log(JSON.parse(event.data)) }
console.log(
    await send({
        // id: 1,
        method: 'Log.entryAdded',
        // params: {
        //     discover: true
        // },
    })
)

process.exit()