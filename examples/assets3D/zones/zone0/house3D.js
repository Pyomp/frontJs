import { Asset } from '../../../../modules/managers/Asset.js'
import { GltfStaticNode } from '../../../../webGlEngine/core/Node3D.js'

async function load(gltfNodes) {

    const houseGltfNodes = []
    for (const key in gltfNodes) {
        if (!key.includes('house')) continue
        houseGltfNodes.push(gltfNodes[key])
    }

    return houseGltfNodes
}

function create(houseGltfNodes) {
    return houseGltfNodes.map(gltfNode => new GltfStaticNode(gltfNode))
}

export const house3D = new Asset({
    load,
    create,
    autoDispose: false
})