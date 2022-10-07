
import { Vector3 } from '../../../../../../math/Vector3.js'
import { EventDispatcher } from '../../../../../../modules/common/EventDispatcher.js'

export class Motion extends EventDispatcher {

    position = new Vector3()
    velocity = new Vector3()
    rotation = 0
    timestamp = 0
    
    toArray = () => [
        this.position.x,
        this.position.y,
        this.position.z,
        this.rotation
    ]
    fromArray = (a) => {
        if (a?.constructor !== Array) return
        this.position.x = a[0]
        this.position.y = a[1]
        this.position.z = a[2]
        this.rotation = a[3]
        this.emit('change')
    }
}