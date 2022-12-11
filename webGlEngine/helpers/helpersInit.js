import { GlbLoader } from '../gltfLoader/GlbLoader.js'

export const helperModels = {
    init: undefined,
    vectorPrimitive: undefined,
    movePrimitive: undefined
}

const loader = new GlbLoader()
helperModels.init = loader.load(new URL('./helpers.glb', import.meta.url))
const gltfNodes = await helperModels.init
helperModels.vectorPrimitive = gltfNodes['vector'].mesh.primitives[0]
helperModels.movePrimitive = gltfNodes['move'].mesh.primitives[0]

