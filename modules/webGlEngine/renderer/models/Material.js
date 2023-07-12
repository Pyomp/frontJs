import {
    AdditiveBlending,
    BackSide,
    DoubleSide,
    FrontSide,
    NormalBlending,
    NoBlending,
    MultiplyBlending
} from '../../renderer/constants.js'

function getConfigId(material) {
    let i = 0

    return (material.blending === NoBlending ? 1 : 0)
        + ((material.blending === NormalBlending ? 1 : 0) << i++)
        + ((material.blending === AdditiveBlending ? 1 : 0) << i++)
        + ((material.blending === MultiplyBlending ? 1 : 0) << i++)
        + ((material.depthTest ? 1 : 0) << i++)
        + ((material.depthWrite ? 1 : 0) << i++)
        + ((material.side === FrontSide ? 1 : 0) << i++)
        + ((material.side === DoubleSide ? 1 : 0) << i++)
        + ((material.side === BackSide ? 1 : 0) << i++)
}

export class Material {

    /**
     * @param {{
     *      blending?: number,
     *      depthTest?: boolean,
     *      depthWrite?: boolean,
     *      alphaTest?: boolean,
     *      shininess?: number,
     *      side?: FrontSide | DoubleSide | BackSide,
     * }} params
     */
    constructor({
        blending = NoBlending,
        depthTest = true,
        depthWrite = true,
        alphaTest = false, // to limit getShaderId, set to 0.5. If more value needed, change it into an uniform in shaders

        shininess,
        side = FrontSide,
    }) {
        this.blending = blending
        this.depthTest = depthTest
        this.depthWrite = depthWrite
        this.alphaTest = alphaTest

        this.shininess = shininess
        this.side = side
        this.configId = getConfigId(this)
    }

    /** @param {GltfMaterial} gltfMaterial*/
    static fromGltfMaterial(gltfMaterial) {
        if (!gltfMaterial) return new Material({})

        const material = new Material({})

        if (gltfMaterial.alphaMode === 'MASK') {
            material.alphaTest = true
        } else if (gltfMaterial.alphaMode === 'BLEND') {
            material.blending = AdditiveBlending
        }

        if (gltfMaterial.pbrMetallicRoughness?.roughnessFactor !== undefined) {
            material.shininess = 200 ** (1 - gltfMaterial.pbrMetallicRoughness.roughnessFactor)
        }
        return material
    }
}




