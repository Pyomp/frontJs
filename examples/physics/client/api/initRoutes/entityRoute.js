import { CMD_ENTITY } from '../../../common/constant/websocketCommand.js'
import { EntityFrame } from '../../../common/websocketFrame/entityFrame.js'
import { appData } from '../../global.js'

export function initEntityRoute(ws) {
    const entityFrame = new EntityFrame()
    ws.dispatcher[CMD_ENTITY] = (data) => {
        entityFrame.ui8a.set(data)
        entityFrame.offset = 0

        const motion = appData.player.motion
        const position = motion.position
        position.x = entityFrame.positionX
        position.y = entityFrame.positionY
        position.z = entityFrame.positionZ

        const velocity = motion.velocity
        velocity.x = entityFrame.velocityX
        velocity.y = entityFrame.velocityY
        velocity.z = entityFrame.velocityZ

        motion.theta = entityFrame.theta

        motion.animation = entityFrame.animation
        motion.animationTime = entityFrame.animationTime

        motion.timestampSecond = Date.now() / 1000
    }
}