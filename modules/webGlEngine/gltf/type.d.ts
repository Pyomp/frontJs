interface GltfPrimitive {
    attributes: GltfAttributes
    indices?: GltfBuffer
    material?: GltfMaterial
}

interface GltfNode {
    name?: string
    mesh?: GltfMesh
    skin?: GltfSkin
    translation?: [number, number, number]
    rotation?: [number, number, number, number]
    scale?: [number, number, number]
}

interface GltfAttributes {
    JOINTS_0?: GltfBuffer
    NORMAL?: GltfBuffer
    POSITION?: GltfBuffer
    TEXCOORD_0?: GltfBuffer
    WEIGHTS_0?: GltfBuffer
}

interface GltfBuffer {
    buffer: Uint8Array | Uint16Array | Uint32Array | Float32Array
    count: number
    type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4"
    min?: number
    max?: number
}

interface GltfMaterial {
    name?: string
    alphaMode?: "OPAQUE" | "BLEND" | "MASK"
    alphaCutoff?: number
    emissiveFactor?: [number, number, number]
    doubleSided?: boolean
    extensions?: GltfMaterialExtensions
    pbrMetallicRoughness?: GltfPbrMetallicRoughness

    textures: {
        [textureName: string]: Texture
    }
}

interface GltfMesh {
    name?: string
    primitives: [GltfPrimitive]

}

type GltfAnimation = { [boneName: string]: GltfBoneAnimation }
type GltfAnimations = { [animationName: string]: GltfAnimation }
interface GltfSkin {
    name?: string
    inverseBindMatrices?: GltfBuffer
    animations?: GltfAnimations
    root: GltfBone
    bonesCount: number
}

interface GltfMaterialExtensions {
    KHR_materials_unlit?: {}
}

interface GltfImage {
    uri?: string
    mimeType?: string

    buffer?: GltfBuffer
    name?: string
    type?: 'PNG' | 'JPG' | 'SVG'
}

interface GltfSampler {
    magFilter?: 9728 | 9729 // NEAREST | LINEAR
    minFilter?: 9728 | 9729 // NEAREST | LINEAR
    wrapS?: 9728 | 9729 | 9984 | 9985 | 9986 | 9987 // NEAREST | LINEAR | NEAREST_MIPMAP_NEAREST | LINEAR_MIPMAP_NEAREST | NEAREST_MIPMAP_LINEAR | LINEAR_MIPMAP_LINEAR
    wrapT?: 9728 | 9729 | 9984 | 9985 | 9986 | 9987 // NEAREST | LINEAR | NEAREST_MIPMAP_NEAREST | LINEAR_MIPMAP_NEAREST | NEAREST_MIPMAP_LINEAR | LINEAR_MIPMAP_LINEAR
    name?: string
}

interface GltfTexture {
    sampler: any
    source: GltfImage
    name?: string
    texCoord?: number // The set index of texture’s TEXCOORD attribute used for texture coordinate mapping.
}

interface GltfPbrMetallicRoughness {
    baseColorFactor?: [number, number, number, number]
    baseColorTexture?: GltfTexture
    metallicFactor?: number
    roughnessFactor?: number
    metallicRoughnessTexture?: GltfTexture
}

class GltfBoneAnimation {
    translation?: GltfKeyFrame
    rotation?: GltfKeyFrame
    scale?: GltfKeyFrame
}

class GltfBone {
    id: number
    name: string
    children?: [GltfBone]
    translation?: [number, number, number]
    rotation?: [number, number, number, number]
    scale?: [number, number, number]
}

class GltfKeyFrame {
    key: Float32Array
    frame: Float32Array
    frameType: string
    interpolation: 'LINEAR' | 'STEP' | 'CUBICSPLINE'
}

interface GLBLoader {
    load: (url: URL) => Promise<{
        [name: string]: GltfNode
    }>
}
