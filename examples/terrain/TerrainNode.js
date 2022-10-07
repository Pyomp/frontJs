import { Vector2 } from '../../math/Vector2.js'
import { InitManager } from '../../modules/managers/InitManager.js'
import { GlbLoader } from '../../webGlEngine/gltfLoader/GlbLoader.js'
import { Node3D } from '../../webGlEngine/core/Node3D.js'
import { Texture } from '../../webGlEngine/core/Texture.js'
import { SplattingMesh } from '../../webGlEngine/nodes/objects/SplattingMesh.js'
import { Vector3 } from '../../math/Vector3.js'
import { checkMeshIntersection } from '../../webGlEngine/utils/Raycaster.js'
import { Ray } from '../../math/Ray.js'
import { Box3 } from '../../math/Box3.js'

let gltfPrimitive, map1, map2, map3, splattingTexture

const { init, destroy } = new InitManager(
    async () => {
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


const _ray = new Ray()
_ray.direction.set(0, -1, 0)

export class Terrain3D extends Terrain3D {
    static init = init
    static destroy = destroy

    constructor(parent) {
        super(
            parent,
            gltfPrimitive,
            splattingTexture,
            map1, map2, map3,
        )
    }
    getHeight(x, y, pointTarget = new Vector3(), normalTarget = new Vector3()) {
        _ray.origin.set(x, 50, y)
        return checkMeshIntersection(
            this.worldMatrix,
            this.meshTerrain.material.side,
            _ray,
            this.meshTerrain.geometry.indices,
            this.meshTerrain.geometry.a_position.buffer,
            pointTarget,
            new Box3(new Vector3(-1000, -1000, -1000), new Vector3(1000, 1000, 1000)), normalTarget)
    }
}

export class TerrainNode extends Node3D {
    constructor(parent) {
        if (!gltfPrimitive) throw new Error('TerrainNode is not initialized "await TerrainNode.init()"')

        const meshTerrain = new SplattingMesh(
            gltfPrimitive,
            splattingTexture,
            map1, map2, map3,
        )

        super({
            objects: [meshTerrain],
            parent: parent,
        })

        this.meshTerrain = meshTerrain
    }
}