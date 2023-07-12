import { randFloatSpread } from "../../../modules/math/MathUtils.js"
import { Vector3 } from "../../../modules/math/Vector3.js"
import { context3D } from "../../globals/context3D.js"

const _vector3 = new Vector3()
const _vector3_2 = new Vector3()

export function makeParticlePuwuData(entity) {
    const data = {
        weaponBone: entity.node3D.rootBone.findByName('equippedWeapon'),
        lastAxePosition: new Vector3(0, 3, 0.7)
    }

    data.weaponBone
        .applyTranslationTo(data.lastAxePosition)

    return data
}


let next = 0
/**
 * @param {Entity3D} entity 
 */
export function updatePuwuParticles(entity) {
    const particleParams = [
        0, 0, 0,
        0, 0, 0,
        1, 0, 2,
        0, 1, 0.7, 0.3, 1, 5,
        1.5, 1, 0, 0, 0.5, 1,
        3, 0, 0, 0, 0, 0
    ]

    entity.particleData.weaponBone
        .applyTranslationTo(_vector3.set(0, 3, 0.7))

    _vector3_2.set(randFloatSpread(1), randFloatSpread(1), randFloatSpread(1))
        .add(_vector3)
        .toArray(particleParams)

    _vector3_2
        .subVectors(_vector3, entity.particleData.lastAxePosition)
        .addElements(randFloatSpread(0.5), 0, randFloatSpread(0.5))
        .multiplyScalar(30)
        .toArray(particleParams, 3)

    entity.particleData.lastAxePosition.copy(_vector3)

    context3D.renderer.particleManager.setParticle(particleParams)
}
