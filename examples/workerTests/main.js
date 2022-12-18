

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: "module" })


let i = 0
const f32a = new Float32Array(1e6).map((v, i) => i)
console.time()
worker.postMessage(f32a.buffer, [f32a.buffer])

worker.onmessage = (event) => {
    console.timeEnd()
    if (i < 1e3) {
        console.time()
        worker.postMessage(event.data, [event.data])
    }
    i++
}


