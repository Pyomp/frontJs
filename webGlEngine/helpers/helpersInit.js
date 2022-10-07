import { GlbLoader } from '../gltfLoader/GlbLoader.js'

export const helperModels = {
    vectorPrimitive: undefined,
    movePrimitive: undefined
}

const loader = new GlbLoader()
const gltfNodes = await loader.load(new URL('./helpers.glb', import.meta.url))
helperModels.vectorPrimitive = gltfNodes['vector'].mesh.primitives[0]
helperModels.movePrimitive = gltfNodes['move'].mesh.primitives[0]

