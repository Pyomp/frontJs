export function recordCanvas(canvas, fps = 30) {
    const stream = canvas.captureStream(fps)

    const recorderOptions = {
        audioBitsPerSecond: 0,
        videoBitsPerSecond: 1500000,
        mimeType: 'video/webm'
    }

    const mediaRecorder = new MediaRecorder(stream, recorderOptions)
    const chunks = []

    mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data)
    }

    mediaRecorder.onstop = (e) => {
        const blob = new Blob(chunks, { 'type': "video/webm" })
        chunks.length = 0

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = 'none'
        document.body.appendChild(a)
        a.href = url
        const date = new Date()
        a.download = `${date.getFullYear()}_${date.getMonth()}_${date.getDay()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}.webm`
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    chunks.length = 0
    mediaRecorder.start()

    return () => {
        mediaRecorder.stop()
    }
}
