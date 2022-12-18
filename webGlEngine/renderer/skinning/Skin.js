
import { Texture } from '../../core/Texture.js'
import { Bone } from './modules/Bone.js'

const vs_pars = () => `
in vec4 a_weights;
in uvec4 a_joints;

uniform sampler2D u_jointTexture;

mat4 getBoneMatrix(uint jointNdx) {
    return mat4(
      texelFetch(u_jointTexture, ivec2(0, jointNdx), 0),
      texelFetch(u_jointTexture, ivec2(1, jointNdx), 0),
      texelFetch(u_jointTexture, ivec2(2, jointNdx), 0),
      texelFetch(u_jointTexture, ivec2(3, jointNdx), 0));
}
`

const vs_main = () => `
mat4 skinMatrix = getBoneMatrix(a_joints[0]) * a_weights[0] +
                getBoneMatrix(a_joints[1]) * a_weights[1] +
                getBoneMatrix(a_joints[2]) * a_weights[2] +
                getBoneMatrix(a_joints[3]) * a_weights[3];
`


export class Skin {
    static vs_pars = vs_pars
    static vs_main = vs_main

    /**
     * @param {GltfNode} gltfNode
     * @param {Node3D} node3D
     */
    constructor(gltfNode, node3D) {
        const inverseBindMatrices = gltfNode.skin.inverseBindMatrices.buffer

        const width = 16
        const height = gltfNode.skin.bonesCount
        const data = new Float32Array(width * height)

        const texture = new Texture({
            data: data,

            wrapS: 'CLAMP_TO_EDGE',
            wrapT: 'CLAMP_TO_EDGE',
            minFilter: 'NEAREST',
            magFilter: 'NEAREST',

            target: 'TEXTURE_2D',
            level: 0,
            internalformat: 'RGBA32F',
            width: width / 4,
            height: height,
            border: 0,
            format: 'RGBA',
            type: 'FLOAT',

            autoDataUpdate: true,
        })

        node3D.traverse(node => {
            for (const object of node.objects) {
                object.textures['u_jointTexture'] = texture
            }
        })

        this.root = new Bone(gltfNode.skin.root, data, inverseBindMatrices)
    }

    dispose() { }
}











