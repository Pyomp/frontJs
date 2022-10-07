import { AdditiveBlending, BackSide, DoubleSide, FrontSide, NormalBlending, NoBlending } from '../renderer/constants.js'

export class Material {
    /**
     * @param {{
     *      blending?: number,
     *      depthTest?: boolean,
     *      depthWrite?: boolean,
     *      shininess?: number,
     *      side?: FrontSide | DoubleSide | BackSide,
     * }} params
     */
    constructor({
        blending = NoBlending,
        depthTest = true,
        depthWrite = true,

        shininess,
        side = FrontSide,
    } = {}) {
        this.blending = blending
        this.depthTest = depthTest
        this.depthWrite = depthWrite

        this.shininess = shininess
        this.side = side
    }

    /** @param {GltfMaterial} gltfMaterial*/
    static fromGltfMaterial(gltfMaterial) {
        if (!gltfMaterial) return new Material()

        let blending = NoBlending
        if (gltfMaterial.alphaMode === 'BLEND') {
            blending = AdditiveBlending
        }

        let shininess
        if (gltfMaterial.pbrMetallicRoughness?.roughnessFactor !== undefined) {
            shininess = 200 ** (1 - gltfMaterial.pbrMetallicRoughness.roughnessFactor)
        }

        return new Material({
            blending: blending,
            shininess: shininess,
        })
    }
}




