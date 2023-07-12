export function requestCanvasPictureInPicture(canvas, fps = 10) {
    const video = document.createElement('video')
    video.srcObject = canvas.captureStream(fps)

    if (video.requestPictureInPicture) {
        video.requestPictureInPicture()
        video.play()

        video.addEventListener('leavepictureinpicture', () => {
            video.remove()
            video.pause()
        })
    } else {
        // for mobile (in fullscreen, when clicking home, put the video in picture in picture)
        document.body.appendChild(video)
        video.requestFullscreen()
        video.play()
    }

    return () => {
        document.exitPictureInPicture()
        video.remove()
        video.pause()
        video.srcObject = undefined
    }
}
