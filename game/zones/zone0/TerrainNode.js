import { Vector2 } from '../../../math/Vector2.js'
import { GlbLoader } from '../../../webGlEngine/gltfLoader/GlbLoader.js'
import { Node3D } from '../../../webGlEngine/core/Node3D.js'
import { Texture } from '../../../webGlEngine/core/Texture.js'
import { SplattingMesh } from '../../../webGlEngine/nodes/objects/SplattingMesh.js'
import { InitManager } from '../../../managers/InitManager.js'
import { Points } from './Points.js'
import { service3D } from '../../services/service3D.js'
import { PointLight } from '../../../webGlEngine/renderer/modules/PointLights.js'
import { Spherical } from '../../../math/Spherical.js'
import { PI, PI2 } from '../../../math/MathUtils.js'

let gltfPrimitive, map1, map2, map3, splattingTexture

const assets = new InitManager(
    async () => {
        await Points.init()

        const glbLoader = new GlbLoader()
        const gltfNodes = await glbLoader.load(new URL('./terrain.glb', import.meta.url))

        const node = gltfNodes['terrainStart']

        splattingTexture = new Texture()
        splattingTexture.data.src = new URL('./textureSplatting.png', import.meta.url).href
        map1 = new Texture({
            minFilter: 'LINEAR_MIPMAP_NEAREST',
            magFilter: 'LINEAR',
            wrapS: 'REPEAT', wrapT: 'REPEAT',
            scale: new Vector2(60, 60)
        })
        map1.data.src = new URL('./terrainTextures/Grass001_1K-JPG/Grass001_1K_Color.jpg', import.meta.url).href

        map2 = new Texture({
            minFilter: 'LINEAR_MIPMAP_NEAREST',
            wrapS: 'REPEAT', wrapT: 'REPEAT', scale: new Vector2(40, 40)
        })
        map2.data.src = new URL('./terrainTextures/Ground037_1K-JPG/Ground037_1K_Color.jpg', import.meta.url).href

        map3 = new Texture({
            minFilter: 'LINEAR_MIPMAP_NEAREST',
            wrapS: 'REPEAT', wrapT: 'REPEAT', scale: new Vector2(5, 5)
        })
        map3.data.src = new URL('./terrainTextures/Ground031_1K-JPG/Ground031_1K_Color.jpg', import.meta.url).href

        gltfPrimitive = node.mesh.primitives[0]
    },
    () => {
        gltfPrimitive = undefined
        map1 = undefined
        map2 = undefined
        map3 = undefined
        splattingTexture = undefined
    }
)

export class Zone0 {
    static assets = assets

    #meshTerrain = new SplattingMesh(
        gltfPrimitive,
        splattingTexture,
        map1, map2, map3,
    )

    #node3D = new Node3D({
        objects: [this.#meshTerrain]
    })

    #lightsDispose

    constructor() {
        if (!gltfPrimitive) throw new Error('TerrainNode is not initialized "await TerrainNode.init()"')

        this.#lightsDispose = initLights()
    }

    dispose() {
        this.#lightsDispose()
        this.#node3D.dispose()
    }
}

const initLights = () => {
    const directionalLight = service3D.renderer.lights.directionalLights[0]
    directionalLight.direction.set(-1, -1, -1).normalize()
    directionalLight.intensity = 0.2
    directionalLight.color.setRGB(1, 1, 1)
    directionalLight.visible = 1
    directionalLight.needsUpdate = true
    service3D.renderer.lights.update()

    service3D.renderer.lights.ambientLight.color.setRGB(1, 1, 1)
    service3D.renderer.lights.ambientLight.intensity = 0.1
    service3D.renderer.lights.ambientLight.needsUpdate = true

    const POINT_LIGHT_COUNT = 20
    const updates = []

    const points = new Points(POINT_LIGHT_COUNT)
    const node = new Node3D({ objects: [points] })

    for (let i = 0; i < POINT_LIGHT_COUNT; i++) {
        const light = new PointLight()
        light.visible = 1
        service3D.renderer.pointLights.add(light)
        const spherical = new Spherical(1.2, Math.random() * PI2, Math.random() * PI2)
        light.color.setHSL(Math.random(), 1, 0.7)
        light.intensity = 100


        points.updateColors(light.color, i)

        let age = Math.random() * PI * 2

        const update = (dt) => {
            age += dt / 10

            light.position.x = Math.cos(age) * 200 * Math.sin(age) ** 2
            light.position.z = Math.sin(age) * 200 * Math.cos(age) ** 3
            light.position.y = 25 + 20 * Math.cos(age) ** 3

            light.position.toArray(points.positions, i * 3)
        }
        // update(1)
        updates.push(update)
    }
    const update = (dt) => {
        for (const cb of updates) {
            cb(dt)
        }
    }
    service3D.renderer.onBeforeRender.add(update)
    return () => { service3D.renderer.onBeforeRender.delete(update) }
}
