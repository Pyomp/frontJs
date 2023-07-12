import { Node3D } from '../renderer/models/Node3D.js' 
import { SplattingMesh } from './objects/SplattingMesh.js'

export class SplattingNode extends Node3D {
    constructor(
        parent, gltfPrimitive,
        splattingTexture,
        map1, map2, map3,
    ) {
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