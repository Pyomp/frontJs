import { AnimationSystem } from "./AnimationSystem.js"
import { Bone } from "./Bone.js"

const map = {}

onmessage = (event) => {
    const data = event.data
    if (data.constructor === ArrayBuffer) {
        playAnimation(data)
    } else {
        if (data.gltfSkin) {
            createAnimations(data)
        } else {
            delete map[data.id]
        }
    }
}

// use to change or synchronize the animation
function playAnimation(buffer) {
    const view = new DataView(buffer)
    const id = view.getUint32(0)
    const animationId = view.getUint16(4)
    const animationTime = view.getFloat32(6)

    map[id].play(animationId, animationTime < 0 ? undefined : animationTime)
}

// update from the raf loop in the main thread
const FREQUENCY_ANIMATION = 60
const DT_ANIMATION_MS = 1000 / FREQUENCY_ANIMATION
let last = performance.now()
function update() {
    const now = performance.now()
    const dt_ms = now - last
    const dt_s = dt_ms / 1000
    last = now

    for (const key in map) {
        map[key].update(dt_s)

    }

    const timeBeforeNextUpdate = Math.max(DT_ANIMATION_MS - performance.now() - last, 0)
    setTimeout(update, timeBeforeNextUpdate)
}

// create the animation system for the object3D
function createAnimations(data) {
    const { gltfSkin, sab, animationDictionary, id } = data
    const inverseBindMatrices = gltfSkin.inverseBindMatrices.buffer
    const f32a = new Float32Array(sab)
    const root = new Bone(gltfSkin.root, f32a, inverseBindMatrices)
    const animations = new AnimationSystem(gltfSkin.animations, root, animationDictionary)
    map[id] = animations
}


