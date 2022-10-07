import { Vector2 } from '../../../../math/Vector2.js'
import { Vector3 } from '../../../../math/Vector3.js'
import { Asset } from '../../../../modules/managers/Asset.js'
import { SplattingMesh } from '../../../../webGlEngine/nodes/objects/SplattingMesh.js'
import { Texture } from '../../../../webGlEngine/core/Texture.js'

async function load(gltfNodes) {
    const node = gltfNodes['cityTerrain']

    const splattingTexture = new Texture()
    splattingTexture.data.src = new URL('./textureSplattingCity.png', import.meta.url).href
    const map1 = new Texture({
        minFilter: 'LINEAR_MIPMAP_NEAREST',
        magFilter: 'LINEAR',
        wrapS: 'REPEAT', wrapT: 'REPEAT',
        scale: new Vector2(60, 60)
    })
    map1.data.src = new URL('./terrainTextures/Rock030_1K-JPG/Rock030_1K_Color.jpg', import.meta.url).href

    const map2 = new Texture({
        minFilter: 'LINEAR_MIPMAP_NEAREST',
        wrapS: 'REPEAT', wrapT: 'REPEAT', scale: new Vector2(40, 40)
    })
    map2.data.src = new URL('./terrainTextures/Grass001_1K-JPG/Grass001_1K_Color.jpg', import.meta.url).href

    const map3 = new Texture({
        minFilter: 'LINEAR_MIPMAP_NEAREST',
        wrapS: 'REPEAT', wrapT: 'REPEAT', scale: new Vector2(5, 5)
    })
    map3.data.src = new URL('./terrainTextures/Bricks075A_1K-JPG/Bricks075A_1K_Color.jpg', import.meta.url).href

    return {
        gltfPrimitive: node.mesh.primitives[0],
        map1: map1,
        map2: map2,
        map3: map3,
        splattingTexture: splattingTexture,
    }
}

function create(data) {
    return new SplattingMesh(
        data.gltfPrimitive,
        data.splattingTexture,
        data.map1, data.map2, data.map3,
    )
}

export const cityTerrain3D = new Asset({
    load,
    create,
    autoDispose: false
})
