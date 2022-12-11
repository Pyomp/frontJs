import { Vector3, _up } from "../../math/Vector3.js"
import { Vector3Helper } from "../../webGlEngine/helpers/Vector3Helper.js"
import { SkinnedNode } from "../../webGlEngine/nodes/SkinnedNode.js"
import { BLADER_ID, FIFI_ID } from "../constants/constantsEntities.js"
import { serviceLoop } from "../services/serviceLoop.js"
import { blader3d } from "./blader/Blader3D.js"
import { fifi3d } from "./witch/Fifi3D.js"

const entities3d = {
    [BLADER_ID]: blader3d,
    [FIFI_ID]: fifi3d,
}

const gltfNodes = {}

function init(...ENTITIES_ID) {
    return Promise.all(ENTITIES_ID.map(
        async (familyId) => {
            if (!entities3d[familyId]) throw new Error(`no data for family "${familyId}"`)
            gltfNodes[familyId] = await entities3d[familyId].getGltfNode()
        })
    )
}

function free() {
    for (const key in gltfNodes) delete gltfNodes[key]
}

const instances = {}

export function initSystemBlader() {
    storeSettings.onId.add(() => {
        if (instances[storeSettings.id]) { service3D.controls.target = instances[storeSettings.id].node3dPosition }
    })
}

export class Entity3D {
    static init = init
    static free = free
    static instances = instances

    #skinnedNode
    #familyId
    #entityId

    constructor(familyId, entityId) {
        if (!gltfNodes[familyId]) throw new Error(`no gltfNode for family "${familyId}" (needs init)`)

        if (instances[familyId]?.[entityId]) return instances[familyId][entityId]

        if (!instances[familyId]) instances[familyId] = {}
        instances[familyId][entityId] = this

        this.#familyId = familyId
        this.#entityId = entityId

        this.#skinnedNode = new SkinnedNode(gltfNodes[familyId], entities3d[familyId].animationDictionary)

        serviceLoop.addUpdate(this.#update3DBound)

        this.nodePosition = this.#skinnedNode.position

        instances[entityId] = this
    }

    nodePosition
    position = new Vector3()
    velocity = new Vector3()
    rotation = 0
    animation = 0
    animationTime = 0

    lastFrameUpdate = serviceLoop.perfNowSecond
    newUpdate = false

    #updateNewUpdate() {
        if (this.newUpdate === false) return
        this.#skinnedNode.quaternion.setFromAxisAngle(_up, this.rotation)
        this.#skinnedNode.animations.play(this.animation)
        if (this.animationTime > -0.1) this.#skinnedNode.animations.setTimeUpdate(this.animationTime)
        this.#skinnedNode.worldMatrixNeedsUpdates = true
        this.newUpdate = false
    }

    velocityHelper = new Vector3Helper()

    #update3DBound = this.#update3D.bind(this)
    #update3D() {
        this.#updateNewUpdate()

        const elapsedTime = serviceLoop.perfNowSecond - this.lastFrameUpdate
        if (elapsedTime > 5) this.dispose()

        this.nodePosition.x = (this.velocity.x * elapsedTime) + this.position.x
        this.nodePosition.y = (this.velocity.y * elapsedTime) + this.position.y
        this.nodePosition.z = (this.velocity.z * elapsedTime) + this.position.z

        this.velocityHelper.setOrigin(this.nodePosition);
        this.velocityHelper.setDirection(this.velocity);

        this.#skinnedNode.worldMatrixNeedsUpdates = true
    }

    dispose() {
        serviceLoop.deleteUpdate(this.#update3DBound)
        this.#skinnedNode.dispose()
        delete instances[this.#familyId][this.#entityId]
    }
}