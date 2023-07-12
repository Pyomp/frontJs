import { Vector3 } from "../../../../modules/math/Vector3.js"
import { groundIntersect } from "../../../../modules/webGlEngine/extras/raycasterUtils.js"
import { particleGroundHit } from "../../../particles/groundHit.js"
import { managerZones } from "../../../zones/managerZones.js"

const TIME_BEFORE_HIT = 0.3

const _position = new Vector3()
const _groundPosition = new Vector3()
const _normal = new Vector3()

export class ThunderStrikeEffectAnimation {
    needsHitParticle = true

    #entity
    constructor(entity) {
        this.#entity = entity
    }

    update() {
        if (this.needsHitParticle && this.#entity.animationTime > TIME_BEFORE_HIT) {
            this.needsHitParticle = false
            _position.copy(this.#entity.particleData.lastAxePosition).y += 2
            if (groundIntersect(_position, managerZones.node3D, _groundPosition, _normal)) {
                _groundPosition.y += 0.1
                particleGroundHit(_groundPosition, _normal)
            }
        }
    }
}
