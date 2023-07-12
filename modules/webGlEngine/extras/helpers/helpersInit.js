import { GlbLoader } from "../../gltf/GlbLoader.js"

export const helperModels = {
    vectorPrimitive: undefined,
    movePrimitive: undefined
}

const gltfNodes = await new GlbLoader().load(new URL('./helpers.glb', import.meta.url))
helperModels.vectorPrimitive = gltfNodes['vector'].mesh.primitives[0]
helperModels.movePrimitive = gltfNodes['move'].mesh.primitives[0]
