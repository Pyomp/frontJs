




export class CanvasPictureInPicture {
    constructor(
        canvas,
        fps = 10
    ) {
        const video = document.createElement('video')
        video.srcObject = canvas.captureStream(fps)

        let enable = false
        this.toggle = () => {
            if (enable) {
                enable = false
                document.exitPictureInPicture()
            } else {
                enable = true
                if (!video.requestPictureInPicture) {
                    document.body.appendChild(video)
                    video.requestFullscreen()
                    video.play()
                    video.close()
                    return
                }
                video.requestPictureInPicture()
                video.play()
            }
        }

        video.addEventListener('fullscreenchange', () => {
            if (!enable) {
                video.remove()
                video.pause()
            }
        })
        video.addEventListener('leavepictureinpicture', () => {
            enable = false
            video.pause()
        })
    }
}






