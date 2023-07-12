import { Vector2 } from "../../math/Vector2.js"

const _vector2 = new Vector2()

export class Select3D {
    #node3DCallback = {}
    #node3DIntersected = []

    #camera

    constructor(camera, domElement) {
        this.#camera = camera
        domElement.addEventListener('pointermove', this.#onPointerMoveBound)
        domElement.addEventListener('click', this.#onClickBound)
    }

    deleteObjectClick(node3D, callback) {
        if (this.#node3DCallback[node3D]) {
            this.#node3DCallback[node3D.id].delete(callback)
        }
    }

    addObjectClick(node3D, callback) {
        if (!this.#node3DCallback[node3D]) this.#node3DCallback[node3D] = new Set()
        this.#node3DCallback[node3D.id].add(callback)
    }

    #onClickBound = this.#onClick.bind(this)
    #onClick() {
        for (const nodeId in this.#node3DCallback) {
            if (this.#node3DCallback[nodeId])
                for (const callback of this.#node3DCallback[nodeId]) callback()
        }
    }

    #onPointerMoveBound = this.#onPointerMove.bind(this)
    #pointerX = 0
    #pointerY = 0
    #onPointerMove(event) {
        this.#pointerX = event.clientX
        this.#pointerY = event.clientY
    }

    update() {
        _vector2.x = (this.#pointerX / innerWidth) * 2 - 1
        _vector2.y = - (this.#pointerY / innerHeight) * 2 + 1
        // raycaster.setFromCamera(this.#pointer, this.#camera)
        // const intersects = raycaster.intersectObjects(this.#obj3D_to_check, false)

        // if (intersects?.[0]) {
        //     const index = this.#obj3D_to_check.indexOf(intersects[0].object)
        //     this.#on_canvas_cb[index]()
        //     return true
        // }
    }
}