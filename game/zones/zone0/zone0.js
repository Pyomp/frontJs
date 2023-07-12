import { Vector2 } from '../../../modules/math/Vector2.js'
import { Node3D } from '../../../modules/webGlEngine/renderer/models/Node3D.js'
import { Texture } from '../../../modules/webGlEngine/renderer/models/Texture.js'
import { SplattingMesh } from '../../../modules/webGlEngine/nodes/objects/SplattingMesh.js'
import { context3D } from '../../globals/context3D.js'
import { GltfMesh } from '../../../modules/webGlEngine/nodes/objects/GltfMesh.js'
import { DoubleSide } from '../../../modules/webGlEngine/renderer/constants.js'
import { Spherical } from '../../../modules/math/Spherical.js'
import { PI, PI2 } from '../../../modules/math/MathUtils.js'
import { PointLight } from '../../../modules/webGlEngine/renderer/modules/lightsManager/PointLights.js'
import { loopRaf } from '../../../modules/globals/loopRaf.js'

/**
 *  @type {{
 *  splattingTexture?: Texture
 *  map1? : Texture
 *  map2? : Texture
 *  map3? : Texture
 *  groundGltfPrimitive?: GltfPrimitive
 *  rockGltfPrimitive?: GltfPrimitive
 *  treeGltfPrimitive?: GltfPrimitive
 *  leavesGltfPrimitive?: GltfPrimitive
 *  sliderGltfPrimitive?: GltfPrimitive
 *  tobogganGltfPrimitive?: GltfPrimitive
 *  bowlGltfPrimitive?: GltfPrimitive
 * }}
*/
const cache = {}

async function init() {
    {
        const gltfNodes = await context3D.glbLoader.load(new URL('../../../assets/3Dmodels/zone0/zone0.glb', import.meta.url))
        {
            const node = gltfNodes['terrainStart']
            cache.splattingTexture = new Texture({})
            cache.splattingTexture.data.src = new URL('../../../assets/3Dmodels/zone0/textureSplatting.png', import.meta.url).href
            cache.map1 = new Texture({
                minFilter: 'LINEAR_MIPMAP_NEAREST',
                magFilter: 'LINEAR',
                wrapS: 'REPEAT', wrapT: 'REPEAT',
                scale: new Vector2(60, 60)
            })
            cache.map1.data.src = new URL('../../../assets/textures/Grass001_1K-JPG/Grass001_1K_Color.jpg', import.meta.url).href

            cache.map2 = new Texture({
                minFilter: 'LINEAR_MIPMAP_NEAREST',
                wrapS: 'REPEAT', wrapT: 'REPEAT', scale: new Vector2(40, 40)
            })
            cache.map2.data.src = new URL('../../../assets/textures/Ground037_1K-JPG/Ground037_1K_Color.jpg', import.meta.url).href

            cache.map3 = new Texture({
                minFilter: 'LINEAR_MIPMAP_NEAREST',
                wrapS: 'REPEAT', wrapT: 'REPEAT', scale: new Vector2(5, 5)
            })
            cache.map3.data.src = new URL('../../../assets/textures/Ground031_1K-JPG/Ground031_1K_Color.jpg', import.meta.url).href

            cache.groundGltfPrimitive = node.mesh.primitives[0]
        }
        {
            cache.rockGltfPrimitive = gltfNodes['rock1'].mesh.primitives[0]
            const texture = new Texture({
                wrapS: 'REPEAT',
                wrapT: 'REPEAT',
                minFilter: 'LINEAR_MIPMAP_NEAREST',
                scale: new Vector2(8, 8)
            })
            texture.data.src = new URL('../../../assets/textures/Rock037_1K-JPG/Rock037_1K_Color.jpg', import.meta.url).href
            cache.rockGltfPrimitive.material.textures['u_map'] = texture
        }
        {
            cache.sliderGltfPrimitive = gltfNodes['slider'].mesh.primitives[0]
            const texture = new Texture({
                wrapS: 'REPEAT',
                wrapT: 'REPEAT',
                minFilter: 'LINEAR_MIPMAP_NEAREST',
                scale: new Vector2(8, 8)
            })
            texture.data.src = new URL('../../../assets/textures/Rock037_1K-JPG/Rock037_1K_Color.jpg', import.meta.url).href
            cache.rockGltfPrimitive.material.textures['u_map'] = texture
        }
        {
            cache.tobogganGltfPrimitive = gltfNodes['toboggan'].mesh.primitives[0]
            cache.bowlGltfPrimitive = gltfNodes['bowl'].mesh.primitives[0]
        }
    }
    {
        const gltfNodes = await context3D.glbLoader.load(new URL('./tree.glb', import.meta.url))
        cache.treeGltfPrimitive = gltfNodes['tree'].mesh.primitives[0]
        cache.leavesGltfPrimitive = gltfNodes['leafs'].mesh.primitives[0]
        const texture = new Texture({})
        texture.data.src = new URL('../../../assets/3Dmodels/zone0/leaves.png', import.meta.url).href
        cache.leavesGltfPrimitive.material.textures['u_map'] = texture
    }
}

function destroy() {
    for (const key in cache) {
        delete cache[key]
    }
}

export class Zone0 {
    static init = init
    static destroy = destroy

    #meshTerrain = new SplattingMesh(
        cache.groundGltfPrimitive,
        cache.splattingTexture,
        cache.map1, cache.map2, cache.map3,
    )
    #rock1 = new GltfMesh(cache.rockGltfPrimitive, 'rock1')
    #tree = new GltfMesh(cache.treeGltfPrimitive, 'tree')
    #leaves = new GltfMesh(cache.leavesGltfPrimitive, 'leaves')
    #slider = new GltfMesh(cache.sliderGltfPrimitive, 'slider')
    #toboggan = new GltfMesh(cache.tobogganGltfPrimitive, 'toboggan')
    #bowl = new GltfMesh(cache.bowlGltfPrimitive, 'bowl')

    node3D = new Node3D({
        objects: [
            this.#meshTerrain,
            this.#rock1,
            this.#tree,
            this.#leaves,
            this.#slider,
            this.#toboggan,
            this.#bowl
        ]
    })

    groundGeometries = [this.#meshTerrain.geometry, this.#rock1.geometry]

    #lightsDispose

    constructor() {
        if (!cache.groundGltfPrimitive) throw new Error('TerrainNode is not initialized "await TerrainNode.init()"')
        initLights()
        this.#leaves.material.alphaTest = true
        this.#leaves.material.side = DoubleSide
        // this.#lightsDispose = initPointLights()
    }

    dispose() {
        this.#lightsDispose()
        this.node3D.dispose()
    }
}

function initLights() {
    const directionalLight = context3D.renderer.lightsManager.directionalLights[0]
    directionalLight.direction.set(-1, -1, -1).normalize()
    directionalLight.intensity = 0.5
    directionalLight.color.setRGB(1, 1, 1)
    directionalLight.visible = 1
    directionalLight.needsUpdate = true

    context3D.renderer.lightsManager.ambientLight.color.setRGB(1, 1, 1)
    context3D.renderer.lightsManager.ambientLight.intensity = 0.3
    context3D.renderer.lightsManager.ambientLight.needsUpdate = true
}

function initPointLights() {
    const POINT_LIGHT_COUNT = 20
    const updates = []

    // const node = new Node3D({ objects: [Points] })

    for (let i = 0; i < POINT_LIGHT_COUNT; i++) {
        const light = new PointLight()
        light.visible = 1
        context3D.renderer.pointLights.add(light)
        const spherical = new Spherical(1.2, Math.random() * PI2, Math.random() * PI2)
        light.color.setHSL(Math.random(), 1, 0.7)
        light.intensity = 100


        let age = Math.random() * PI * 2

        const update = (dt) => {
            age += dt / 10

            light.position.x = Math.cos(age) * 200 * Math.sin(age) ** 2
            light.position.z = Math.sin(age) * 200 * Math.cos(age) ** 3
            light.position.y = 25 + 20 * Math.cos(age) ** 3
        }
        // update(1)
        updates.push(update)
    }
    const update = (dt) => {
        for (const cb of updates) {
            cb(dt)
        }
    }

    loopRaf.beforeRenderListeners.add(update)
    return () => { loopRaf.beforeRenderListeners.delete(update) }
}
