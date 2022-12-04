import { Blader3D } from "./entities/blader/Blader3D.js" 

export async function initGame() {
    /** asset init */
    await Promise.all([
        Blader3D.init(),
    ])
}