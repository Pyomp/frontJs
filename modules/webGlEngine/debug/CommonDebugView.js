import { Euler } from '../../math/Euler.js'
import { Quaternion } from '../../math/Quaternion.js'
import { Vector3 } from '../../math/Vector3.js'
import { recordCanvas } from '../../utils/recordCanvas.js'
import { FPSView } from './components/FPSView.js'

export class MainDebugView {
    #camera
    #cam_pos = new Vector3()
    #cam_quat = new Quaternion()
    #cam_euler = new Euler()
    #cam_scale = new Vector3()

    container = document.createElement('div')
    #decomposeCamSpan = document.createElement('span')
    #button = document.createElement('button')

    #canvasToRecord
    #stopRecord = () => { }

    constructor({
        renderer,
        parent = document.body,
    }) {
        this.#camera = renderer.camera
        this.#canvasToRecord = renderer.canvas

        this.container.style.padding = '10px'
        parent.appendChild(this.container)


        this.#button.textContent = 'Record'
        this.container.appendChild(this.#button)

        this.#button.addEventListener('click', this.#onRecordButtonBound)

        new FPSView()
    }

    #onRecordButtonBound = this.#onRecordButton.bind(this)
    #onRecordButton() {
        if (this.#button.innerHTML === 'Record') {
            this.#stopRecord = recordCanvas(this.#canvasToRecord)
            this.#button.innerHTML = 'Download'
        } else {
            this.#stopRecord()
            this.#button.innerHTML = 'Record'
        }
    }

    update() {
        this.#camera.worldCameraMatrix.decompose(this.#cam_pos, this.#cam_quat, this.#cam_scale)
        this.#cam_euler.setFromQuaternion(this.#cam_quat)
        this.#decomposeCamSpan.innerHTML = `
            cam pos: ${this.#cam_pos.x.toFixed(1)}, ${this.#cam_pos.y.toFixed(1)}, ${this.#cam_pos.z.toFixed(1)}<br>
            cam euler: ${this.#cam_euler.x.toFixed(1)}, ${this.#cam_euler.y.toFixed(1)}, ${this.#cam_euler.z.toFixed(1)}<br>
            `
    }
}





