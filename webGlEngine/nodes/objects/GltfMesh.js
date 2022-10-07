import { Geometry } from '../../core/Geometry.js'
import { Material } from '../../core/Material.js'
import { Mesh } from './Mesh.js'

export class GltfMesh extends Mesh {
    constructor(gltfPrimitive) {
        const material = Material.fromGltfMaterial(gltfPrimitive.material)
        const textures = { ...(gltfPrimitive.material?.textures || {}) }
        const geometry = Geometry.getFromGltfPrimitive(gltfPrimitive)

        super(geometry, material, textures)
    }
}