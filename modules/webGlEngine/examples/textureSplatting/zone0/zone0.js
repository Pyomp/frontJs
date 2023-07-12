import { Vector2 } from '../../../../math/Vector2.js'
import { Node3D } from '../../../renderer/models/Node3D.js'
import { Texture } from '../../../renderer/models/Texture.js'
import { SplattingMesh } from '../../../nodes/objects/SplattingMesh.js'
import { GltfMesh } from '../../../nodes/objects/GltfMesh.js'
import { GlbLoader } from '../../../gltf/GlbLoader.js'

let gltfPrimitive, map1, map2, map3, splattingTexture
let rockGltfPrimitive

async function init() {

    const gltfNodes = await new GlbLoader().load(new URL('./zone0.glb', import.meta.url))

    const node = gltfNodes['terrainStart']

    {
        splattingTexture = new Texture({})
        splattingTexture.data.src = new URL('./textureSplatting.png', import.meta.url).href
        map1 = new Texture({
            minFilter: 'LINEAR_MIPMAP_NEAREST',
            magFilter: 'LINEAR',
            wrapS: 'REPEAT', wrapT: 'REPEAT',
            scale: new Vector2(60, 60)
        })
        map1.data.src = new URL('./textures/Grass001_1K-JPG/Grass001_1K_Color.jpg', import.meta.url).href

        map2 = new Texture({
            minFilter: 'LINEAR_MIPMAP_NEAREST',
            wrapS: 'REPEAT', wrapT: 'REPEAT', scale: new Vector2(40, 40)
        })
        map2.data.src = new URL('./textures/Ground037_1K-JPG/Ground037_1K_Color.jpg', import.meta.url).href

        map3 = new Texture({
            minFilter: 'LINEAR_MIPMAP_NEAREST',
            wrapS: 'REPEAT', wrapT: 'REPEAT', scale: new Vector2(5, 5)
        })
        map3.data.src = new URL('./textures/Ground031_1K-JPG/Ground031_1K_Color.jpg', import.meta.url).href

        gltfPrimitive = node.mesh.primitives[0]
    }
    {
        rockGltfPrimitive = gltfNodes['rock1'].mesh.primitives[0]
        const texture = new Texture({})
        texture.data.src = new URL('./textures/Rock037_1K-JPG/Rock037_1K_Color.jpg', import.meta.url).href
        rockGltfPrimitive.material.textures['u_map'] = texture
    }
}

function destroy() {
    rockGltfPrimitive = undefined
    gltfPrimitive = undefined
    map1 = undefined
    map2 = undefined
    map3 = undefined
    splattingTexture = undefined
}


export class Zone0 {
    static init = init
    static destroy = destroy

    #meshTerrain = new SplattingMesh(
        gltfPrimitive,
        splattingTexture,
        map1, map2, map3,
    )
    #rock1 = new GltfMesh(rockGltfPrimitive, 'rock1')

    node3D = new Node3D({
        objects: [this.#meshTerrain, this.#rock1]
    })

    #lightsDispose

    constructor(renderer) {
        if (!gltfPrimitive) throw new Error('TerrainNode is not initialized "await TerrainNode.init()"')
        initLights(renderer)
        // this.#lightsDispose = initPointLights()
    }

    dispose() {
        this.#lightsDispose()
        this.node3D.dispose()
    }
}

function initLights(renderer) {
    const directionalLight = renderer.lightsManager.directionalLights[0]
    directionalLight.direction.set(-1, -1, -1).normalize()
    directionalLight.intensity = 0.5
    directionalLight.color.setRGB(1, 1, 1)
    directionalLight.visible = 1
    directionalLight.needsUpdate = true

    renderer.lightsManager.ambientLight.color.setRGB(1, 1, 1)
    renderer.lightsManager.ambientLight.intensity = 0.3
    renderer.lightsManager.ambientLight.needsUpdate = true
}

// function initPointLights() {
//     const POINT_LIGHT_COUNT = 20
//     const updates = []

//     const node = new Node3D({ objects: [points] })

//     for (let i = 0; i < POINT_LIGHT_COUNT; i++) {
//         const light = new PointLight()
//         light.visible = 1
//         service3D.renderer.pointLights.add(light)
//         const spherical = new Spherical(1.2, Math.random() * PI2, Math.random() * PI2)
//         light.color.setHSL(Math.random(), 1, 0.7)
//         light.intensity = 100


//         let age = Math.random() * PI * 2

//         const update = (dt) => {
//             age += dt / 10

//             light.position.x = Math.cos(age) * 200 * Math.sin(age) ** 2
//             light.position.z = Math.sin(age) * 200 * Math.cos(age) ** 3
//             light.position.y = 25 + 20 * Math.cos(age) ** 3
//         }
//         // update(1)
//         updates.push(update)
//     }
//     const update = (dt) => {
//         for (const cb of updates) {
//             cb(dt)
//         }
//     }
//     service3D.renderer.onBeforeRender.add(update)
//     return () => { service3D.renderer.onBeforeRender.delete(update) }
// }
