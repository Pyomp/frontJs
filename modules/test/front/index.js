"use strict"

import { appTestUtils } from "./appTestUtils.js"

let ws

function initWebsocket() {
    ws = new WebSocket(`ws://${location.host}`)

    ws.onerror = (event) => { console.warn(event) }

    ws.onopen = (event) => {
        console.log = (...args) => { ws.send(JSON.stringify({ command: 'print', data: { type: 'log', args } })) }
        console.warn = (...args) => { ws.send(JSON.stringify({ command: 'print', data: { type: 'warn', args } })) }
        console.error = (...args) => { ws.send(JSON.stringify({ command: 'print', data: { type: 'error', args } })) }
        console.info = (...args) => { ws.send(JSON.stringify({ command: 'print', data: { type: 'info', args } })) }
        console.log('websocket opened')
    }

    ws.onclose = (event) => {
        console.warn('websocket closed')
        if (event.reason === 'new client') {
            window.close()
        } else {
            setTimeout(initWebsocket, 1000)
        }
    }

    ws.onmessage = async (event) => {
        try {
            /** @type {WsRequest} */
            const request = JSON.parse(event.data)
            if (request.command === 'runUnit') {
                const testFileUrl = request.data

                const result = await appTestUtils.runIframeFunction(
                    new URL('./iframeLauncher.html', import.meta.url).href,
                    '_runFile',
                    testFileUrl
                )

                ws.send(JSON.stringify({ command: 'result', data: result }))
            }
        } catch (error) {
            console.error(error)
        }
    }
}

async function init() {
    initWebsocket()
}

init()
