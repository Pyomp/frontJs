import { Asset } from '../../../../modules/managers/Asset.js'
import { Node3D } from '../../../../webGlEngine/core/Node3D.js'
import { glbLoader } from '../../global.js'
import { cityTerrain3D } from './cityTerrain.js'
import { create3D } from './create3D.js'
import { house3D } from './house3D.js'
import { outsideTerrain3D } from './outsideTerrain.js'

async function load() {
    const gltf = await glbLoader.load(new URL('./terrain.glb', import.meta.url))
    const result = await Promise.all([
        outsideTerrain3D.create(gltf),
        cityTerrain3D.create(gltf),
        house3D.create(gltf),
        create3D.create(gltf)
    ])

    return [
        result[0],
        result[1]
    ]
}

function create(data) {
    return new Node3D({
        objects: data,
    })
}

export const zone03D = new Asset({
    load,
    create,
})

zone03D.addEventListener(Asset.EventInstanceDispose, () => {
    outsideTerrain3D.instanceDispose()
    cityTerrain3D.instanceDispose()
    house3D.instanceDispose()
})

// const _ray = new Ray()
// _ray.direction.set(0, -1, 0)

// getHeight(x, y, pointTarget = new Vector3(), normalTarget = new Vector3()) {
//     _ray.origin.set(x, 50, y)
//     return checkMeshIntersection(
//         this.worldMatrix,
//         this.meshTerrain.material.side,
//         _ray,
//         this.meshTerrain.geometry.indices,
//         this.meshTerrain.geometry.a_position.buffer,
//         pointTarget,
//         new Box3(new Vector3(-1000, -1000, -1000), new Vector3(1000, 1000, 1000)), normalTarget
//     )
// }

