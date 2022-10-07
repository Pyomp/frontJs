import { Box3 } from '../../../math/Box3.js'
import { Sphere } from '../../../math/Sphere.js'
import { Vector3 } from '../../../math/Vector3.js'
import { Asset } from '../../../modules/managers/Asset.js'
import { SkinnedNode } from '../../../webGlEngine/core/Node3D.js'
import { Texture } from '../../../webGlEngine/core/Texture.js'
import { ANIMATION_IDLE, ANIMATION_JUMP, ANIMATION_WALK } from '../../physics/common/constant/animation.js'
import { glbLoader } from '../global.js'

async function load() {
    const gltfNodes = await glbLoader.load(new URL('./blader.glb', import.meta.url))

    const node = gltfNodes['blader']

    const bladerTexture = new Texture()
    bladerTexture.data.src = new URL('./blader.svg', import.meta.url).href

    // In gltf mesh has array of primitive
    // Each primitive have a material and a geometry data that can be different.    
    for (const primitive of node.mesh.primitives) {
        primitive.material.textures['u_map'] = bladerTexture
    }

    return node
}

const animationDictionary = {
    'blader_idle_pingpong': [ANIMATION_IDLE],
    'blader_jump': [ANIMATION_JUMP],
    'blader_walk_pingpong': [ANIMATION_WALK],
}

function create(gltfNode) {
    return new SkinnedNode(gltfNode, animationDictionary)
}

export const blader3D = new Asset({
    load,
    create,
    data: {
        boundingBox: new Box3(new Vector3(-0.5, 0, -0.5), new Vector3(0.5, 1, 0.5)),
        boundingSphere: new Sphere(new Vector3(0, 0.5, 0), 0.5)
    }
})