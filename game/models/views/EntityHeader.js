import { Vector3 } from "../../../modules/math/Vector3.js"
import { context3D } from "../../globals/context3D.js"

const HP_WIDTH = 80
const HP_WIDTH_HALF = HP_WIDTH / 2
const HP_HEIGHT = 10

const hpModel = document.createElement('div')
hpModel.style.borderRadius = `${HP_HEIGHT / 2}px`
hpModel.style.height = `${HP_HEIGHT}px`
hpModel.style.width = `${HP_WIDTH}px`
hpModel.style.position = 'fixed'

const _vector3 = new Vector3()

export class EntityHeader {

    hpDiv = hpModel.cloneNode()

    constructor() {
        document.body.appendChild(this.hpDiv)
    }

    update(position, offsetY = 3) {
        if (context3D.camera.frustum.containsPoint(position)) {
            _vector3.copy(position)
            _vector3.y += offsetY
            _vector3.project(context3D.camera)

            const x = (_vector3.x * .5 + .5) * context3D.renderer.canvas.clientWidth
            const y = (_vector3.y * -.5 + .5) * context3D.renderer.canvas.clientHeight
            const z = (-_vector3.z * .5 + .5)

            const scale = z * 100
            this.hpDiv.style.display = 'inline'
            this.hpDiv.style.top = `${y - HP_HEIGHT}px`
            this.hpDiv.style.left = `${x - HP_WIDTH_HALF}px`
            this.hpDiv.style.transformOrigin = 'bottom center'
            this.hpDiv.style.transform = `scale(${scale})`
            this.hpDiv.style.zIndex = z * 100000 | 0
        } else {
            this.hpDiv.style.display = 'none'
        }
    }

    setHp(current, max) {
        const percent = current / max * 100
        this.hpDiv.style.background = `linear-gradient(90deg, hsl(0, 100%, 70%) ${percent}%, gray ${percent}%)`
    }

    dispose() {
        this.hpDiv.remove()
    }
}
