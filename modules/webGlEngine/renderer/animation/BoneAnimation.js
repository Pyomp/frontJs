import { Euler } from '../../../math/Euler.js'
import { Quaternion } from '../../../math/Quaternion.js'
import { Vector3 } from '../../../math/Vector3.js'
import { KeyFrame } from './KeyFrame.js'

// from gltf spec
const GltfFrameTypeVec3 = "VEC3"
const GltfInterpolationLinear = 'LINEAR'
const GltfInterpolationStep = 'STEP'
const GltfInterpolationCubic = 'CUBICSPLINE'

const _euler = new Euler()

export class BoneAnimation {
    /** @type {KeyFrame | undefined} */ position
    /** @type {KeyFrame | undefined} */ quaternion
    /** @type {KeyFrame | undefined} */ scale

    /** 
     * @param {GltfBoneAnimation} gltfBoneAnimation
     */
    constructor(gltfBoneAnimation) {
        if (gltfBoneAnimation.translation)
            this.#initPosition(gltfBoneAnimation.translation)
        if (gltfBoneAnimation.rotation)
            this.#initQuaternion(gltfBoneAnimation.rotation)
        if (gltfBoneAnimation.scale)
            this.#initScale(gltfBoneAnimation.scale)
    }

    #getVector3Frame(frame) {
        let result = []
        const l = frame.length / 3
        for (let i = 0; i < l; i++) {
            result.push(new Vector3().fromArray(frame, i * 3))
        }
        return result
    }

    /** 
     * @param {GltfKeyFrame} translation
     */
    #initPosition(translation) {
        const key = translation.key
        const frame = this.#getVector3Frame(translation.frame)
        const isLinear = translation.interpolation === GltfInterpolationLinear
            || translation.interpolation === GltfInterpolationStep
        this.position = new KeyFrame(key, frame, isLinear)
    }

    /** 
     * @param {GltfKeyFrame} scale
     */
    #initScale(scale) {
        const key = scale.key
        const frame = this.#getVector3Frame(scale.frame)
        const isLinear = scale.interpolation === GltfInterpolationLinear
            || scale.interpolation === GltfInterpolationStep
        this.scale = new KeyFrame(key, frame, isLinear)
    }

    #getQuaternionFrame(frame, isEuler) {
        let result = []
        const size = isEuler === true ? 3 : 4
        const l = frame.length / size
        for (let i = 0; i < l; i++) {
            if (isEuler === true) {
                _euler.fromArray(frame, i * size)
                result.push(new Quaternion().setFromEuler(_euler))
            } else {
                result.push(new Quaternion().fromArray(frame, i * size))
            }
        }
        return result
    }

    /** 
     * @param {GltfKeyFrame} rotation
     */
    #initQuaternion(rotation) {
        const key = rotation.key
        const isEuler = rotation.frameType === GltfFrameTypeVec3
        const frame = this.#getQuaternionFrame(rotation.frame, isEuler)
        const isLinear = rotation.interpolation === GltfInterpolationLinear
            || rotation.interpolation === GltfInterpolationStep
        this.quaternion = new KeyFrame(key, frame, isLinear)
    }

    getMaxTime() {
        let max = 0
        if (this.position)
            max = Math.max(...this.position.key)
        if (this.quaternion)
            max = Math.max(max, ...this.quaternion.key)
        if (this.scale)
            max = Math.max(max, ...this.scale.key)
        return max
    }
}