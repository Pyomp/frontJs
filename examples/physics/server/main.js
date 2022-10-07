import { PhysicsManager } from '../../../gameEngine/physics/PhysicsManager.js'
import { WebSocketServerManager } from '../../../modules/communication/server/WebSocketServerManager.js'
import { ACTION_JUMP } from '../../AppData/actions.js'
import { AppData } from '../../AppData/AppData.js'
import { assets3D } from '../../assets3D/assets3D.js'
import { ANIMATION_IDLE, ANIMATION_WALK } from '../common/constant/animation.js'
import { CMD_ACTION, CMD_MOTION } from '../common/constant/websocketCommand.js'
import { EntityFrame } from '../common/websocketFrame/entityFrame.js'
import { MoveFrame } from '../common/websocketFrame/motionFrame.js'
import { wsManager } from './config.js'

const FPS = 30
const DELTA_TIME = 1 / FPS
const DELTA_TIME_MS = DELTA_TIME * 1000
const VELOCITY_CLAMP = 0.001

const entityFrame = new EntityFrame()

const physics = new PhysicsManager(FPS)
wsManager.group.onAdd.add(
    /** @param {Client} client */
    (client) => {
        client.appData.
        physics.add({
            entity: {
                zone: {
                    has: () => true,
                    getHeight: () => 0
                }
            }, // client.appData.player,
            eventTarget: client.appData.player,
            position: client.appData.player.motion.position,
            velocity: client.appData.player.motion.velocity,

            boundingBox: () => assets3D[client.appData.player.customization.model],
            boundingSphere: () => assets3D[client.appData.player.customization.model],
            moveSpeed: client.appData.player.motion.moveSpeed,

            controls: client.appData.controls,
        })
    }
)

setInterval(() => {
    physics.update()

    // for (const client of webSocketServerManager.group.clients) {
    //     const motion = client.appData.player.motion
    //     const controls = client.appData.controls
    //     const { velocity, position } = motion

    //     // apply event zqsd
    //     velocity.x += controls.x * 3
    //     velocity.z += controls.y * 3
    //     if (Math.abs(controls.x) < 0.01 && Math.abs(controls.y) < 0.01) motion.animation = ANIMATION_IDLE
    //     else motion.animation = ANIMATION_WALK

    //     // physics

    //     if (velocity.x === 0 && velocity.z === 0 && velocity.y === 0 && position.y === 0)
    //         continue

    //     velocity.x /= 1.3
    //     velocity.z /= 1.3
    //     velocity.y -= 2

    //     position.x += velocity.x * DELTA_TIME
    //     position.y += velocity.y * DELTA_TIME
    //     position.z += velocity.z * DELTA_TIME

    //     if (velocity.x < VELOCITY_CLAMP && velocity.x > -VELOCITY_CLAMP) velocity.x = 0
    //     if (velocity.z < VELOCITY_CLAMP && velocity.z > -VELOCITY_CLAMP) velocity.z = 0

    //     if (position.y < 0) {
    //         position.y = 0
    //         velocity.y = 0
    //     }
    // }


    // send data through websocket
    entityFrame.offset = 0

    for (const client of webSocketServerManager.group.clients) {
        if (!client.isConnected()) continue

        entityFrame.type = 1
        entityFrame.id = client.id

        const motion = client.appData.player.motion
        const clientPosition = motion.position
        entityFrame.positionX = clientPosition.x
        entityFrame.positionY = clientPosition.y
        entityFrame.positionZ = clientPosition.z

        const clientVelocity = motion.velocity
        entityFrame.velocityX = clientVelocity.x
        entityFrame.velocityY = clientVelocity.y
        entityFrame.velocityZ = clientVelocity.z

        entityFrame.animation = motion.animation
        entityFrame.animationTime = motion.animationTime
        entityFrame.theta = client.appData.controls.theta

        entityFrame.offset++
    }

    webSocketServerManager.group.broadcast(entityFrame.buffer)

}, DELTA_TIME_MS)

const motionFrame = new MoveFrame()
webSocketServerManager.addRoute(CMD_MOTION, (client, payload, ws) => {
    motionFrame.ui8a.set(payload)
    client.appData.controls.x = motionFrame.x
    client.appData.controls.y = motionFrame.y
    client.appData.controls.theta = motionFrame.theta
})

/** @type {{[cmd: number | string]: (client: Client, dataView: DataView)=>{}}} */
const actionDictionary = {
    [ACTION_JUMP]: (client, dataView) => {
        client.appData.player.motion.velocity.y += 20
    }
}

webSocketServerManager.addRoute(CMD_ACTION, (client, payload, ws) => {
    const dataView = new DataView(payload.buffer)
    const action = dataView.getUint32(payload.byteOffset + 2)
    actionDictionary[action](client, dataView)
})

export default webSocketServerManager