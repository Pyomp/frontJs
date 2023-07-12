import { Points } from "../../nodes/objects/Points.js"
import { Texture } from "../../renderer/models/Texture.js"
import { PointLight } from "../../renderer/modules/lightsManager/PointLights.js"

const POINT_LIGHT_COUNT = 20

export class LightComponent {
   /** @type {Light[]} */ #lights = []
    #pointsPositionAttribute

    constructor(/**@type {Renderer}*/ renderer) {
        const map = new Texture({})
        map.data.src = new URL('./spark.svg', import.meta.url).href
        const points = new Points(POINT_LIGHT_COUNT, map)
        this.#pointsPositionAttribute = points.geometry.attributes.a_position.buffer
        renderer.scene.addObject(points)
        // const node = new Node3D({ objects: [points] })

        for (let i = 0; i < POINT_LIGHT_COUNT; i++) {
            this.#lights.push(new Light(renderer))

        }
    }

    update = this.#update.bind(this)
    #update(dtS) {
        for (let i = 0; i < POINT_LIGHT_COUNT; i++) {
            this.#lights[i].update(dtS)
            this.#lights[i].position.toArray(this.#pointsPositionAttribute, i * 3)
        }
    }
}

class Light {
    #light = new PointLight()
    #time = Math.random() * Math.PI * 2
    position = this.#light.position

    // #spherical = new Spherical(1.2, Math.random() * PI2, Math.random() * PI2)
    constructor(renderer) {
        this.#light.visible = 1
        this.#light.color.setRGB(1, 1, 1)
        this.#light.intensity = 0.5

        renderer.pointLights.add(this.#light)
    }

    update = this.#update.bind(this)
    #update(dtS) {
        this.#time += dtS

        this.#light.position.x = Math.cos(this.#time) * 10 * Math.sin(this.#time) ** 2
        this.#light.position.z = Math.sin(this.#time) * 10 * Math.cos(this.#time) ** 2
        this.#light.position.y = 2.5 + Math.cos(this.#time) ** 3

        this.#light.needsUpdate = true
    }
}
