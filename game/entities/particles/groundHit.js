import { Math_random, PI2 } from "../../../modules/math/MathUtils.js"
import { Quaternion } from "../../../modules/math/Quaternion.js"
import { Vector3 } from "../../../modules/math/Vector3.js"
import { context3D } from "../../globals/context3D.js"
import { loopRaf } from "../../../modules/globals/loopRaf.js"

const TIME_PARTICLE = 0.001

const _particlePosition = new Vector3()
const _particleAcceleration = new Vector3()
const _quaternion = new Quaternion()

export function particleGroundHit(position, normal) {
    let rest = 0
    let particleCount = 100

    const _position = new Vector3().copy(position)
    const _normal = new Vector3().copy(normal)

    function update() {
        rest += loopRaf.dt_s

        while (rest > TIME_PARTICLE) {
            rest -= TIME_PARTICLE
            particleCount--

            _quaternion.setFromAxisAngle(_normal, Math_random() * PI2)

            _particlePosition.set(0.5, 0, 0)
            _particlePosition.applyQuaternion(_quaternion).add(_position)
            _particleAcceleration.set(50, 0, 0)
            _particleAcceleration.applyQuaternion(_quaternion)

            context3D.renderer.particleManager.setParticle([
                _particlePosition.x, _particlePosition.y, _particlePosition.z,
                _particleAcceleration.x, _particleAcceleration.y, _particleAcceleration.z,
                0.9, -30, 1,
                0, 1, 0.7, 0.3, 1, 1,
                0.3, 0, 0, 1, 0.5, 4,
                0.6, 0, 0, 0, 0, 0
            ])

            if (particleCount === 0) { loopRaf.beforeRenderListeners.delete(update); return }
        }
    }

    loopRaf.beforeRenderListeners.add(update)
}
