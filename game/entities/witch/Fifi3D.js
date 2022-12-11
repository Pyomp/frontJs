import { Texture } from '../../../webGlEngine/core/Texture.js'
import { service3D } from '../../services/service3D.js'

export const fifi3d = {
    async getGltfNode() {
        const gltfNodes = await service3D.glbLoader.load(new URL('./fifi.glb', import.meta.url))

        const node = gltfNodes['redMesh']

        const texture = new Texture()
        texture.data.src = new URL('./fifi.svg', import.meta.url).href

        // In gltf mesh has array of primitive
        // Each primitive have a material and a geometry data that can be different.    
        for (const primitive of node.mesh.primitives) {
            primitive.material.textures['u_map'] = texture
        }

        return node
    },

    animationDictionary: {
        'fifiIdle_pingpong': 0,
        'fifiRun_pingpong': 1,
        // 'fifiRoll': 2,
        'fifiRoll': 3,
        'fifiJump': 4,
        'fifiSlice': 5,
    }
}