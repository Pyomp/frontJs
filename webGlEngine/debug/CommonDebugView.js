import { Euler } from '../../math/Euler.js'
import { Quaternion } from '../../math/Quaternion.js'
import { Vector3 } from '../../math/Vector3.js'
import { CanvasRecorder } from '../../modules/misc/CanvasRecorder.js' 
import { FPSView } from './components/FPSView.js' 

export class MainDebugView {

    constructor({
        renderer,
        parent = document.body,
    }) {

        this.container = document.createElement('div')
        this.container.style.padding = '10px'
        parent.appendChild(this.container)

        const cam_pos = new Vector3()
        const cam_quat = new Quaternion()
        const cam_euler = new Euler()
        const cam_scale = new Vector3()

        const cam = renderer.camera

        const decompose_cam = document.createElement('span')
        this.container.appendChild(decompose_cam)
        renderer.onBeforeRender.add(() => {
            cam.worldCameraMatrix.decompose(cam_pos, cam_quat, cam_scale)
            cam_euler.setFromQuaternion(cam_quat)
            decompose_cam.innerHTML = `
            cam pos: ${cam_pos.x.toFixed(1)}, ${cam_pos.y.toFixed(1)}, ${cam_pos.z.toFixed(1)}<br>
            cam euler: ${cam_euler.x.toFixed(1)}, ${cam_euler.y.toFixed(1)}, ${cam_euler.z.toFixed(1)}<br>
            `
        })

        const canvasRecorder = new CanvasRecorder(renderer.canvas)

        const button = document.createElement('button')
        button.innerHTML = 'Record'
        this.container.appendChild(button)
        button.addEventListener('click', () => {
            if (button.innerHTML === 'Record') {
                canvasRecorder.record()
                button.innerHTML = 'Download'
            } else {
                canvasRecorder.stop()
                button.innerHTML = 'Record'
            }
        })

        new FPSView(this.container, renderer.onBeforeRender)
    }
}





