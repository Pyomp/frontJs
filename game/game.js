import { BLADER_ID, FIFI_ID } from "./constants/constantsEntities.js"
import { Entity3D } from "./entities/Entity3D.js"

export async function initGame() {
    /** asset init */
    await Promise.all([
        Entity3D.init(BLADER_ID, FIFI_ID),
    ])
}