
let sendId = 1
function send(ws, method, params) {
    if (ws.readyState !== WebSocket.OPEN) throw new Error('WebSocket not ready')

    const id = sendId++

    const promise = new Promise((resolve, reject) => {
        const onMessage = (text) => {
            try {
                const response = JSON.parse(text)
                if (response.id === id) {
                    ws.removeEventListener('message', onMessage)
                    resolve(response)
                }
            } catch (error) { reject(error) }
        }
        ws.addEventListener('message', onMessage)
        ws.send(JSON.stringify({ id, method, params }))
    })
    return promise
}

export const chromeWs = {}
// ws.onmessage = (event) => { console.log(JSON.parse(event.data)) }
// console.log(
//     await send({
//         // id: 1,
//         method: 'Log.entryAdded',
//         // params: {
//         //     discover: true
//         // },
//     })
// )
