import { Vector3 } from '../../../../../math/Vector3.js'
import { MoveSpeed } from './MoveSpeed.js'

export class Motion {

    position = new Vector3()
    velocity = new Vector3()
    theta = 0
    animation = 0
    animationTime = -1
    timestampSecond = Date.now() / 1000
    moveSpeed = new MoveSpeed()

    toArray() {
        return [
            this.position.x,
            this.position.y,
            this.position.z,
        ]
    }

    fromArray(a) {
        if (a?.constructor !== Array) return
        this.position.x = a[0]
        this.position.y = a[1]
        this.position.z = a[2]
    }
}