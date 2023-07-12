import { Box3 } from '../math/Box3.js'
import { Ray } from '../math/Ray.js'
import { Vector3 } from '../math/Vector3.js'

const _ray = new Ray()

class Entity {
    #entity

    constructor({
        entity,
        eventTarget,
        position,
        velocity,
        model,
        moveSpeed,
        controls,
    }) {
        this.#entity = entity
        this.eventTarget = eventTarget
        this.position = position
        this.velocity = velocity
        this.moveSpeed = moveSpeed
        this.controls = controls
        this.model = model
    }

    get customPhysic() { return this.#entity.customPhysic }
    get zone() { return this.#entity.zone }
}

export class PhysicsManager {

    #entities = []
    #deltaTime = 0.05

    constructor(frequencySecond) {
        this.#deltaTime = 1 / frequencySecond
    }

    /**
     * 
     * @param {{
     *      entity: {
     *          customPhysic: (velocity: Vector3) => {} | null
     *          zone: { 
     *              has: () => boolean, 
     *              getHeight: () => number
     *              objects3DStatic: { 
     *                  position: Vector3,
     *                  model: {
     *                      boundingBox: Box3,
     *                      boundingSphere?: Sphere,
     *                  } 
     *              }[]
     *          }
     *          model: {
     *              boundingBox: Box3,
     *              boundingSphere?: Sphere,
     *          }    
     *      }   
     *      eventTarget: EventTarget,
     *      position: Vector3,
     *      velocity: Vector3,
     *      moveSpeed: { value },
     *      controls: Vector2,
     * }} 
     */
    add({
        entity,
        eventTarget,
        position,
        velocity,
        moveSpeed,
        controls,
    } = {}) {
        const ent = new Entity({
            entity,
            eventTarget,
            position,
            velocity,
            moveSpeed,
            controls,
        })

        this.#entities.push(ent)

        eventTarget.addEventListener('dispose', () => {
            const index = this.#entities.indexOf(ent)
            this.#entities.splice(index, 1)
        })
    }

    applyControls(entity) {
        entity.velocity.x += entity.controls.x * entity.moveSpeed.value
        entity.velocity.z += entity.controls.y * entity.moveSpeed.value
    }

    applyPhysics(entity) {

        const velocity = entity.velocity
        const position = entity.position

        if (entity.customPhysic) {
            entity.customPhysic(velocity)
        } else {
            velocity.x /= 1.3
            velocity.z /= 1.3
            velocity.y -= 2
        }

        position.x += velocity.x * this.#deltaTime
        position.y += velocity.y * this.#deltaTime
        position.z += velocity.z * this.#deltaTime

        // if (velocity.x < VELOCITY_CLAMP && velocity.x > -VELOCITY_CLAMP) velocity.x = 0
        // if (velocity.z < VELOCITY_CLAMP && velocity.z > -VELOCITY_CLAMP) velocity.z = 0
    }

    checkCollision() {
        const length = this.#entities.length
        for (let i = 0; i < length - 1; i++) {

            const entityA = this.#entities[i]

            for (let j = i + 1; j < length; j++) {

                const entityB = this.#entities[j]

                if (!entityA.zone || entityA.zone.has(entityB)) {

                    if (entityA.boundingSphere && entityB.boundingSphere) {
                        sphereSphereCollision(entityA, entityB)
                    } else {
                        boxBoxCollision(entityA, entityB)
                    }
                }
            }
        }
    }

    checkTerrainCollision(entity) {

        // for (const object of entity.zone.objects3DStatic) {
        //     boxBoxCollision(entity, object)
        // }

        const y = entity.zone.getHeight(entity.position.x, entity.position.z)
        if (entity.position.y < y) {
            entity.position.y = y
            entity.velocity.y = 0
        }

        // TODO terrain normal 
    }

    update() {
        for (const entity of this.#entities) {
            this.applyControls(entity)
            this.applyPhysics(entity)
        }

        this.checkCollision()

        for (const entity of this.#entities) {
            this.checkTerrainCollision(entity)
        }
    }
}

const _vector3 = new Vector3()
const _vA = new Vector3()
const _vB = new Vector3()
function sphereSphereCollision(entityA, entityB) {
    const boudingSphereA = entityA.model.boudingSphere
    const boudingSphereB = entityB.model.boudingSphere

    _vA.addVectors(boudingSphereA.center, entityA.position)
    _vB.addVectors(boudingSphereB.center, entityB.position)
    const collisionDistance = Math.abs(boudingSphereB.radius - boudingSphereA.radius)
    const collisionDistanceSq = collisionDistance ** 2
    const distanceSq = _vector3.subVectors(_vB, _vA).lengthSq()
    if (distanceSq > collisionDistanceSq) return // collision

    const distanceToAdd = collisionDistance - distanceSq ** 0.5

    // ratio ? see boxboxCollision

    const ratioA = 0.5
    const ratioB = 0.5

    entityA.position.x += distanceToAdd.x * ratioA
    entityA.position.y += distanceToAdd.y * ratioA
    entityA.position.z += distanceToAdd.z * ratioA

    entityB.position.x += distanceToAdd.x * ratioB
    entityB.position.y += distanceToAdd.y * ratioB
    entityB.position.z += distanceToAdd.z * ratioB
}

function boxBoxCollision(entityA, entityB) {
    const boundingBoxA = entityA.model.boundingBox
    const boundingBoxB = entityB.model.boundingBox

    const distHorizontalA = (entityB.position.x + boundingBoxB.max.x) - (entityA.position.x + boundingBoxA.min.x)
    if (distHorizontalA > 0) return false // no collision
    const distHorizontalB = (entityA.position.x + boundingBoxB.min.x) - (entityB.position.x + boundingBoxA.max.x)
    if (distHorizontalB < 0) return false // no collision
    const distHorizontal = distHorizontalB < -distHorizontalA ? distHorizontalB : distHorizontalA

    const distDepthA = (entityB.position.z + boundingBoxB.max.z) - (entityA.position.z + boundingBoxA.min.z)
    if (distDepthA > 0) return false // no collision
    const distDepthB = (entityA.position.z + boundingBoxB.min.z) - (entityB.position.z + boundingBoxA.max.z)
    if (distDepthB < 0) return false // no collision
    const distDepth = distDepthB < -distDepthA ? distDepthB : distDepthA

    const distVerticalA = (entityB.position.y + boundingBoxB.max.y) - (entityA.position.y + boundingBoxA.min.y)
    if (distVerticalA > 0) return false // no collision
    const distVerticalB = (entityA.position.y + boundingBoxB.min.y) - (entityB.position.y + boundingBoxA.max.y)
    if (distVerticalB < 0) return false // no collision
    const distVertical = distVerticalB < -distVerticalA ? distVerticalB : distVerticalA

    if (entityB.velocity > 0) {
        // _vector3.subVectors(_cB, _cA)
        // _vA.copy(entityA.velocity).projectOnVector(_vector3)
        // _vB.copy(entityB.velocity).projectOnVector(_vector3)
        // const ratioA = _vA.length() / _vB.length()
        // const ratioB = 1 - ratioA
        const ratioA = 0.5
        const ratioB = 0.5

        entityA.position.x += distHorizontal * ratioA
        entityA.position.y += distVertical * ratioA
        entityA.position.z += distDepth * ratioA

        entityB.position.x += distHorizontal * ratioB
        entityB.position.y += distVertical * ratioB
        entityB.position.z += distDepth * ratioB
    } else {
        entityA.position.x += distHorizontal
        entityA.position.y += distVertical
        entityA.position.z += distDepth
    }
}