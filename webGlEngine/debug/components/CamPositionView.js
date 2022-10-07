
export class CamPositionView {

    container = document.createElement('div')

    #camera

    constructor(parent) {
        this.#camera = camera
        parent.appendChild(this.container)
    }

    #update = () => {
        this.#camera.worldCameraMatrix.decompose(cam_pos, cam_quat, cam_scale)
        cam_euler.setFromQuaternion(cam_quat)
        decompose_cam.innerHTML = `
        cam pos: ${cam_pos.x.toFixed(1)}, ${cam_pos.y.toFixed(1)}, ${cam_pos.z.toFixed(1)}<br>
        cam euler: ${cam_euler.x.toFixed(1)}, ${cam_euler.y.toFixed(1)}, ${cam_euler.z.toFixed(1)}<br>
        `
        this.container.textContent = `
            cam pos: ${cam_pos.x.toFixed(1)}, ${cam_pos.y.toFixed(1)}, ${cam_pos.z.toFixed(1)}<br>
            cam euler: ${cam_euler.x.toFixed(1)}, ${cam_euler.y.toFixed(1)}, ${cam_euler.z.toFixed(1)}<br>
        `
    }

    dispose = () => {
        this.container.remove()
    }
}