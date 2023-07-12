import { Vector3, _up } from "../../modules/math/Vector3.js"
import { SkinnedNode } from "../../modules/webGlEngine/nodes/SkinnedNode.js"
import { EntityHeader } from "../models/views/EntityHeader.js"
import { PUWU_ID, FIFI_ID } from "../constants/constantsEntities.js"
import { loopRaf } from "../../modules/globals/loopRaf.js"
import { skillLoader } from "../views/skillLoader.js"
import { ANIMATION_STATE0, ANIMATION_STATE1 } from "../constants/constantsAnimations.js"
import { puwu3d } from "./puwu/puwu3D.js"
import { StaticGltfNode } from "../../modules/webGlEngine/nodes/StaticGltfNode.js"

const entities3d = {
    [PUWU_ID]: puwu3d,
    [FIFI_ID]: puwu3d,
}

const gltfNodes = {}
const weaponGltfNodes = {}
const updatesParticles = {}
const ClassEffectAnimations = {}
const ClassEffectAnimationsEmpty = { update() { } }

function init(...ENTITIES_ID) {
    return Promise.all(ENTITIES_ID.map(
        async (familyId) => {
            if (!entities3d[familyId]) throw new Error(`no data for family "${familyId}"`)
            gltfNodes[familyId] = await entities3d[familyId].getGltfNode()
            weaponGltfNodes[familyId] = await entities3d[familyId].getWeaponGltfNode()
            updatesParticles[familyId] = entities3d[familyId].updateParticles
            ClassEffectAnimations[familyId] = entities3d[familyId].ClassEffectAnimation
        })
    )
}

function free() {
    for (const key in gltfNodes) delete gltfNodes[key]
}

const instances = {}

/** @type {Set<Entity3D>} */
const set = new Set()

export class Entity3D {
    static init = init
    static free = free
    static instances = instances
    static set = set

    isMe = false

    node3D
    #familyId
    #entityId

    #header = new EntityHeader()
    #headerUpdate = () => { this.#header.update(this.nodePosition) }

    nodePosition
    position = new Vector3()
    velocity = new Vector3()
    rotation = 0

    #animation = 0
    get animation() { return this.#animation }
    set animation(value) {
        this.effectAnimation = ClassEffectAnimations[this.#familyId][value] ? new ClassEffectAnimations[this.#familyId][value](this) : ClassEffectAnimationsEmpty
        this.#animation = value
    }
    animationTime = 0
    animationSpeed = 1

    hp = 100
    maxHp = 100

    lastFrameUpdate = loopRaf.perfNowSecond
    newUpdate = false

    constructor(familyId, entityId) {
        if (!gltfNodes[familyId]) throw new Error(`no gltfNode for family "${familyId}" (needs init)`)

        if (instances[familyId]?.[entityId]) return instances[familyId][entityId]

        if (!instances[familyId]) instances[familyId] = {}
        instances[familyId][entityId] = this

        set.add(this)
        this.#familyId = familyId
        this.#entityId = entityId

        this.node3D = new SkinnedNode({
            name: `entity family ${familyId}`,
            gltfNode: gltfNodes[familyId],
            animationDictionary: entities3d[familyId].animationDictionary
        })

        this.weaponBone = this.node3D.rootBone.findByName('equippedWeapon')

        this.particleData = entities3d[familyId].makeParticleData(this)

        loopRaf.beforeRenderListeners.add(this.#update3DBound)

        loopRaf.afterRenderListeners.add(this.#headerUpdate)

        this.nodePosition = this.node3D.position

        this.setWeapon(weaponGltfNodes[familyId])

        // service3D.atmosphere.addBody(new Sphere(this.nodePosition, 1), this.velocity)
        instances[entityId] = this
    }

    setWeapon(gltfNode) {
        this.weaponNode = new StaticGltfNode({ gltfNode })
    }

    #updateNewUpdate() {
        this.node3D.quaternion.setFromAxisAngle(_up, this.rotation)
        this.node3D.animation.play(this.#animation, this.animationTime)
        this.node3D.localMatrixNeedsUpdates = true

        this.node3D.animation.speed = this.animationSpeed

        if (this.isMe
            && (this.#animation === ANIMATION_STATE0 || this.#animation === ANIMATION_STATE1)
        ) {
            skillLoader.time = this.animationTime
            skillLoader.speed = this.animationSpeed
        }

        this.#header.setHp(this.hp, this.maxHp)

        this.newUpdate = false
    }

    #update3DBound = this.#update3D.bind(this)
    #update3D(dt_s) {
        if (this.newUpdate === true) this.#updateNewUpdate()

        const elapsedTime = loopRaf.perfNowSecond - this.lastFrameUpdate
        if (elapsedTime > 5) { this.dispose(); return }

        this.nodePosition.x = (this.velocity.x * elapsedTime) + this.position.x
        this.nodePosition.y = (this.velocity.y * elapsedTime) + this.position.y
        this.nodePosition.z = (this.velocity.z * elapsedTime) + this.position.z

        updatesParticles[this.#familyId](this, dt_s)

        this.node3D.localMatrixNeedsUpdates = true

        this.effectAnimation.update()

        this.node3D.updateMatrix(true)
        this.weaponBone.applyTransformation(this.weaponNode.localMatrix)
        this.weaponNode.updateMatrix(true)
        this.weaponNode.position.setFromMatrixPosition(this.weaponNode.localMatrix)
    }

    dispose() {
        this.#header.dispose()
        this.weaponNode.dispose()

        loopRaf.beforeRenderListeners.delete(this.#update3DBound)

        loopRaf.afterRenderListeners.delete(this.#headerUpdate)


        this.node3D.dispose()
        delete instances[this.#familyId][this.#entityId]
        set.delete(this)
    }
}
