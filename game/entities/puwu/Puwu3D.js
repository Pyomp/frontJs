import { loopRaf } from '../../../modules/globals/loopRaf.js'
import { randFloatSpread } from '../../../modules/math/MathUtils.js'
import { Vector3, _up } from '../../../modules/math/Vector3.js'
import { voidFunction } from '../../../modules/utils/utils.js'
import { groundIntersect } from '../../../modules/webGlEngine/extras/raycasterUtils.js'
import { SkinnedNode } from '../../../modules/webGlEngine/nodes/SkinnedNode.js'
import { StaticGltfNode } from '../../../modules/webGlEngine/nodes/StaticGltfNode.js'
import { Texture } from '../../../modules/webGlEngine/renderer/models/Texture.js'
import {
    ANIMATION_ACTION0, ANIMATION_ACTION1,
    ANIMATION_ACTION10,
    ANIMATION_ACTION11,
    ANIMATION_ACTION2, ANIMATION_ACTION3,
    ANIMATION_ACTION4,
    ANIMATION_ACTION5,
    ANIMATION_ACTION6,
    ANIMATION_ACTION7,
    ANIMATION_ACTION8,
    ANIMATION_ACTION9,
    ANIMATION_BLOCK_TRIGGERED, ANIMATION_FALLING,
    ANIMATION_IDLE, ANIMATION_JUMP0,
    ANIMATION_JUMP1, ANIMATION_JUMP2,
    ANIMATION_KNOCKDOWN, ANIMATION_RUN,
    ANIMATION_SLIDE, ANIMATION_STAGGER,
    ANIMATION_STATE0, ANIMATION_STATE1,
    ANIMATION_STATE2, ANIMATION_STATE3
} from '../../constants/constantsAnimations.js'
import { context3D } from '../../globals/context3D.js'
import { EntityHeader } from '../../models/views/EntityHeader.js'
import { managerZones } from '../../zones/managerZones.js'
import { particleGroundHit } from '../particles/groundHit.js'

async function getGltfNode() {
    const gltfNodes = await context3D.glbLoader.load(new URL('../../../assets/3Dmodels/puwu/puwu.glb', import.meta.url))

    const node = gltfNodes['puwuMesh']

    const texture = new Texture({})
    texture.data.src = new URL('../../../assets/3Dmodels/puwu/puwu.svg', import.meta.url).href

    for (const primitive of node.mesh.primitives) {
        primitive.material.textures['u_map'] = texture
    }

    return node
}

async function getWeaponGltfNode() {
    const gltfNodes = await context3D.glbLoader.load(new URL('../../../assets/3Dmodels/puwu/puwu.glb', import.meta.url))
    const gltfNode = gltfNodes['weapon']
    const texture = new Texture({})

    texture.data.src = new URL('../../../assets/3Dmodels/puwu/puwu.svg', import.meta.url).href
    for (const primitive of gltfNode.mesh.primitives) {
        primitive.material.textures['u_map'] = texture
    }


    return gltfNode
}

const animationDictionary = {
    'puwuIdle_pingpong': ANIMATION_IDLE,
    'puwuRun_pingpong': ANIMATION_RUN,
    'puwuFalling': ANIMATION_FALLING,
    'puwuJump': ANIMATION_JUMP0,
    'puwuDoubleJump': ANIMATION_JUMP1,
    'puwuTripleJump': ANIMATION_JUMP2,
    'puwuSlide': ANIMATION_SLIDE,

    'puwuStagger': ANIMATION_STAGGER,
    'puwuKnockdown': ANIMATION_KNOCKDOWN,
    'puwuBlockTriggered': ANIMATION_BLOCK_TRIGGERED,

    'thunderStrike': ANIMATION_ACTION0,
    'puwuAction1Auto1': ANIMATION_ACTION1,
    'puwuAction2Auto2': ANIMATION_ACTION2,
    'puwuAction3Auto3': ANIMATION_ACTION3,
    'leapingStrike': ANIMATION_ACTION4,
    'flatten': ANIMATION_ACTION5,
    'sweepingStrike': ANIMATION_ACTION6,
    'raze': ANIMATION_ACTION7,
    'tackle': ANIMATION_ACTION8,
    'evasiveRoll': ANIMATION_ACTION9,
    'overwhelm': ANIMATION_ACTION10,
    'lethalStrike': ANIMATION_ACTION11,

    'puwuState0_pingpong': ANIMATION_STATE0,
    'puwuState1_pingpong': ANIMATION_STATE1,
    'puwuState2_repeat': ANIMATION_STATE2,
    'puwuState3Block_pingpong': ANIMATION_STATE3,
}

let gltfNode, weaponGltfNodes

async function init() {
    [gltfNode, weaponGltfNodes] = await Promise.all([getGltfNode(), getWeaponGltfNode()])
}

function free() {
    gltfNode = undefined
    weaponGltfNodes = undefined
}

const particleParams = [
    0, 0, 0,
    0, 0, 0,
    1, 0, 2,
    0, 1, 0.7, 0.3, 1, 5,
    1.5, 1, 0, 0, 0.5, 1,
    3, 0, 0, 0, 0, 0
]

const _position = new Vector3()
const _groundPosition = new Vector3()
const _normal = new Vector3()
const _vector3 = new Vector3()
const _vector3_2 = new Vector3()

export class Puwu3d {
    static init = init
    static free = free

    isMe = false

    #header = new EntityHeader()


    framePosition = new Vector3()
    frameVelocity = new Vector3()

    lastFrameUpdate = 0

    weaponNode = new StaticGltfNode({ gltfNode: weaponGltfNodes })
    node3D = new SkinnedNode({
        name: `puwu entity`,
        gltfNode,
        animationDictionary
    })
    position = this.node3D.position

    weaponBone = this.node3D.rootBone.findByName('equippedWeapon')
    lastAxePosition = new Vector3(0, 3, 0.7)

    #stopAnimation = voidFunction
    #animation = -1
    updateFrame(view, offset) {
        this.framePosition.x = view.getFloat32(offset, true)
        offset += 4
        this.framePosition.y = view.getFloat32(offset, true)
        offset += 4
        this.framePosition.z = view.getFloat32(offset, true)
        offset += 4

        this.frameVelocity.x = view.getFloat32(offset, true)
        offset += 4
        this.frameVelocity.y = view.getFloat32(offset, true)
        offset += 4
        this.frameVelocity.z = view.getFloat32(offset, true)
        offset += 4

        const rotation = view.getFloat32(offset, true)
        offset += 4
        const animation = view.getUint16(offset, true)
        offset += 2
        const animationTime = view.getFloat32(offset, true)
        offset += 4
        const animationSpeed = view.getFloat32(offset, true)
        offset += 4
        const hp = view.getUint16(offset, true)
        offset += 2
        const maxHp = view.getUint16(offset, true)
        offset += 2

        this.node3D.quaternion.setFromAxisAngle(_up, rotation)

        if (this.#animation !== animation) {
            this.#animation = animation
            this.#stopAnimation()
            this.stopAnimation = voidFunction

            if (animation === ANIMATION_ACTION0) {
                const timeoutId = setTimeout(() => {
                    if (this.#animation === ANIMATION_ACTION0) {
                        _position.copy(this.lastAxePosition).y += 2
                        if (groundIntersect(_position, managerZones.node3D, _groundPosition, _normal)) {
                            _groundPosition.y += 0.1
                            particleGroundHit(_groundPosition, _normal)
                        }
                    }
                }, (0.2 - animationTime) * 1000 / animationSpeed)

                this.stopAnimation = () => {
                    clearTimeout(timeoutId)
                }
            }
        }

        this.node3D.animation.play(animation, animationTime)
        this.node3D.animation.speed = animationSpeed
        this.#header.setHp(hp, maxHp)

        return offset
    }

    #updateWeaponParticle() {
        this.weaponBone
            .applyTranslationTo(_vector3.set(0, 3, 0.7))

        _vector3_2.set(randFloatSpread(1), randFloatSpread(1), randFloatSpread(1))
            .add(_vector3)
            .toArray(particleParams)

        _vector3_2
            .subVectors(_vector3, this.lastAxePosition)
            .addElements(randFloatSpread(0.5), 0, randFloatSpread(0.5))
            .multiplyScalar(30)
            .toArray(particleParams, 3)

        this.lastAxePosition.copy(_vector3)

        context3D.renderer.particleManager.setParticle(particleParams)
    }

    update() {
        const elapsedTime = loopRaf.perfNowSecond - this.lastFrameUpdate

        this.position.x = (this.frameVelocity.x * elapsedTime) + this.framePosition.x
        this.position.y = (this.frameVelocity.y * elapsedTime) + this.framePosition.y
        this.position.z = (this.frameVelocity.z * elapsedTime) + this.framePosition.z
        this.node3D.localMatrixNeedsUpdates = true

        this.#header.update(this.position)

        this.#updateWeaponParticle()

        this.node3D.updateMatrix(true)

        this.weaponBone.applyTransformation(this.weaponNode.localMatrix)
        this.weaponNode.updateMatrix(true)
        this.weaponNode.position.setFromMatrixPosition(this.weaponNode.localMatrix)
    }

    dispose() {
        this.#header.dispose()
        this.weaponNode.dispose()
        this.node3D.dispose()
    }
}
