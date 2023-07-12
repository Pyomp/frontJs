import { Geometry } from '../../renderer/models/Geometry.js' 
import { Material } from '../../renderer/models/Material.js' 
import { Mesh } from './Mesh.js'

export class GltfMesh extends Mesh {
    constructor(gltfPrimitive, name = '') {
        const material = Material.fromGltfMaterial(gltfPrimitive.material)
        const textures = { ...(gltfPrimitive.material?.textures || {}) }
        const geometry = Geometry.getFromGltfPrimitive(gltfPrimitive)

        super({ name, geometry, material, textures })
    }
}