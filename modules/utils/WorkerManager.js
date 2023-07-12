

/**
 * NEEDS TEST  
 * protocol to communicate between main and worker  
*/
export class WorkerManager {
    constructor(
        url,
        dispatcher = {
            ping: (data) => { console.log(`ping worker: ${performance.now() - data}ms`) }
        }
    ) {

        const worker = new Worker(url, { type: 'module' })
        const resolves = {}

        this.dispatcher = dispatcher

        let messageId = 0
        this.request = (cmd, data) => {
            return new Promise((resolve) => {
                worker.postMessage({ id: ++messageId, cmd: cmd, data: data })
                resolves[messageId] = resolve
            })
        }

        this.send = (cmd, data) => {
            worker.postMessage({ cmd: cmd, data: data })
        }

        worker.onmessage = (e) => {
            const messageId = e.data.id
            if (messageId !== undefined) {
                const resolve = resolves[messageId]
                if (resolve !== undefined) {
                    resolve(e.data.data)
                    delete resolves[messageId]
                }
            } else {
                const callback = this.dispatcher[e.data.cmd]
                if (callback === undefined) {
                    console.warn(new Error(`callback undefined cmd: ${e.data.cmd}`))
                } else {
                    callback(e.data.data)
                }
            }
        }

        worker.onerror = (event) => {
            console.warn(event.message, event)
        }

        this.dispose = () => {
            worker.terminate()
        }
    }
}

/**
 * call this on workers
*/
export function initWorker() {

    const dispatcher = {
        ping: (data) => { return data },
    }

    window.onmessage = async (e) => {
        const cmd = e.data.cmd
        const messageId = e.data.id
        const data = e.data.data
        const callback = dispatcher[cmd]
        if (callback === undefined) {
            console.warn(new Error(`callback undefined cmd: ${cmd}`))
            postMessage(undefined)
        } else if (messageId !== undefined) {
            postMessage({ id: messageId, data: await callback(data) })
        }
    }
    return dispatcher
}











