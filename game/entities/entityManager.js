import { loopRaf } from "../../modules/globals/loopRaf.js"
import { context3D } from "../globals/context3D.js"
import { store } from "../globals/store.js"
import { Puwu3d } from "./puwu/Puwu3D.js"

const entities = [{}, {}, {}, {}, {}, {}, {}, {}]

const EntityClassBinding = [Puwu3d, Puwu3d]

function getEntity(familyId, id) {
    const entitiesFamily = entities[familyId]
    if (!entitiesFamily[id]) {
        entitiesFamily[id] = new EntityClassBinding[familyId]()
        if (store.id == id) {
            context3D.controls.target = entitiesFamily[id].position
            context3D.controls.enabled = true
        }
    }
    return entitiesFamily[id]
}

export const entityManager = {
    update() {
        const now = loopRaf.dateNowSecond - 0.2
        for (const entitiesFamily of entities) {
            for (const id in entitiesFamily) {
                const entity = entitiesFamily[id]
                if (entity.lastFrameUpdate > now) {
                    entity.dispose()
                    delete entitiesFamily[id]
                } else {
                    entity.update()
                }
            }
        }
    },
    updateFrame(familyId, view, offset) {
        const id = view.getBigUint64(offset, true)
        offset += 8

        const entity = getEntity(familyId, id)
        entity.lastFrameUpdate = loopRaf.perfNowSecond

        return entity.updateFrame(view, offset)
    },

}
