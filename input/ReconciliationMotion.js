import { _up } from '../math/Vector3.js'

export class ReconciliationMotion {

    #loop

    /** @type {Map<Motion, Node3D | SkinnedNode>} */
    reconciliationMap = new Map()

    /**
     * 
     * @param {{ 
     *      dateNowSecond: number
     *      updatesFrame: Set<()=>{}>
     *  }} loop 
     */
    constructor(loop) {
        this.#loop = loop
        this.#loop.updatesFrame.add(this.#update)
    }

    /**
     * @param {
     *      motion: {
     *          position: Vector3,
     *          velocity: Vector3,
     *          animationTime: number,
     *          theta: number,
     *          timestampSecond: number,
     *      }
     *  } entity 
     * @param {Node3D} node3D
     */
    addEntity(entity, node3D) {
        this.reconciliationMap.set(entity.motion, node3D)
        entity.addEventListener('dispose', () => {
            this.reconciliationMap.delete(entity.motion)
        })
    }

    #update = () => {
        const now = this.#loop.dateNowSecond

        for (const [motion, node3D] of this.reconciliationMap) {

            const position3D = node3D.position
            const velocity = motion.velocity

            const dtSync = now - motion.timestampSecond

            position3D.copy(motion.position)

            const veloX = velocity.x * dtSync
            const veloY = velocity.y * dtSync
            const veloZ = velocity.z * dtSync

            position3D.x += veloX
            position3D.y += veloY
            position3D.z += veloZ
            if (position3D.y < 0) {
                position3D.y = 0
            }

            node3D.animations.play(motion.animation)
            node3D.animations.setTimeUpdate(motion.animationTime + dtSync)
            // node3D.animations.update()
            // node3D.

            node3D.quaternion.setFromAxisAngle(_up, motion.theta)
            node3D.worldMatrixNeedsUpdates = true
        }
    }

    dispose() {

        this.#loop.updatesFrame.delete(this.#update)

    }
}