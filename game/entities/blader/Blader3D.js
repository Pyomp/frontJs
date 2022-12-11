import { Texture } from '../../../webGlEngine/core/Texture.js'
import { service3D } from '../../services/service3D.js'

export const blader3d = {
    async getGltfNode() {
        const gltfNodes = await service3D.glbLoader.load(new URL('./blader.glb', import.meta.url))

        const node = gltfNodes['blader']

        const bladerTexture = new Texture()
        bladerTexture.data.src = new URL('./blader.svg', import.meta.url).href

        // In gltf mesh has array of primitive
        // Each primitive have a material and a geometry data that can be different.    
        for (const primitive of node.mesh.primitives) {
            primitive.material.textures['u_map'] = bladerTexture
        }

        return node
    },
    
    animationDictionary: {
        'blader_idle_pingpong': 0,
        'blader_walk_pingpong': 1,
    }
}