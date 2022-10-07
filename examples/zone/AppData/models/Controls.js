import { Math_abs, Math_cos, Math_sin, PI, PI2 } from '../../../../math/MathUtils.js'

export class Controls {

    angle = 0
    radius = 0
    move_speed = 1.5

    /**
     * @param {Motion} motion 
     * @param {State} state 
     */
    update = (motion, state, timestamp) => {

        state.is_controls = false
        motion.timestamp = timestamp

        const length = this.radius * this.move_speed
        if (length === 0) return // no controls

        state.is_controls = true

        let angle_dif = (this.angle - motion.rotation) % PI2
        angle_dif += (angle_dif > PI) ? -PI2 : (angle_dif < -PI) ? PI2 : 0

        const angle_length = Math_abs(angle_dif)
        // if (angle_length > 0.2) {
        //     if (angle_dif > 0) {
        //         motion.rotation += 0.2
        //     } else {
        //         motion.rotation -= 0.2
        //     }
        // } else {
        motion.rotation += angle_dif
        // }

        const v = motion.velocity
        if (angle_length < PI) {
            const new_length = (v.z ** 2 + v.x ** 2) ** 0.5 + length
            v.z = Math_cos(motion.rotation) * new_length
            v.x = Math_sin(motion.rotation) * new_length
        } else {
            v.z += Math_cos(motion.rotation) * length
            v.x += Math_sin(motion.rotation) * length
        }

        motion.emit('change')
    }
}