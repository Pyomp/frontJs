import { Animations } from "../Animations.js"
import { Bone } from "../modules/Bone.js"

const map = {}
let f32a
onmessage = (event) => {
    if (event.data.constructor === ArrayBuffer) {

        if (event.data.byteLength === 10) {
            const view = new DataView(event.data)
            const id = view.getUint32(0)
            const animationId = view.getUint16(4)
            const animationTime = view.getFloat32(6)

            map[id].play(animationId, animationTime < 0 ? undefined : animationTime)
        } else {
            const dt = new Float32Array(event.data)[0]

            for (const key in map) {
                map[key].update(dt)
                
            }
        }
    } else {
        const data = event.data
        if (data.gltfSkin) {
            const inverseBindMatrices = data.gltfSkin.inverseBindMatrices.buffer
            f32a = new Float32Array(data.sab)
            const root = new Bone(data.gltfSkin.root, f32a, inverseBindMatrices)
            const animations = new Animations(data.gltfSkin.animations, root, data.animationDictionary)
            map[data.id] = animations
        } else {
            delete map[data.id]
        }
    }
}