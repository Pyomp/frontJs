import { Quaternion } from '../../../math/Quaternion.js'
import { Vector3 } from '../../../math/Vector3.js'
import { LoopOnce, LoopPingpong, LoopRepeat } from './constants.js'
import { Track } from './modules/Track.js'

const _vector3 = new Vector3()
const _position = new Vector3()
const _scale = new Vector3()
const _quaternion = new Quaternion()

const tracksCache = new WeakMap()
const initialPoseCache = new WeakMap()

export class Animations {
    #rootBone
    #initialPose = {}
    #poseSaved = {}
    #tracks = {}
    #currentAnimationName = ''
    #t = 0
    #fadeTime = 0
    #timeNeedsUpdate = true
    #timeDirection = 1

    fadeParam = 0.2

    /**
     * @param {GltfAnimations} gltfAnimations 
     * @param {Bone} rootBone
     * @param {{[gltfAnimationName: string]: string | number}} animationDictionary 
     */
    constructor(gltfAnimations, rootBone, animationDictionary = {}) {

        this.#rootBone = rootBone
        this.#initInitialPose()
        this.#initPoseSaved()
        this.#initTracks(gltfAnimations, animationDictionary)
    }

    #extractLoopFromName(animationName) {
        if (animationName.includes('pingpong')) {
            return LoopPingpong
        } else if (animationName.includes('repeat')) {
            return LoopRepeat
        } else {
            return LoopOnce
        }
    }

    #initTracks(gltfAnimations, animationDictionary) {
        const cache = tracksCache.get(gltfAnimations)
        if (cache) {
            this.#tracks = cache
            return
        }

        const tracks = {}
        for (const animationName in gltfAnimations) {
            const reference = animationDictionary[animationName] ?? animationName
            const gltfAnimation = gltfAnimations[animationName]
            const loop = this.#extractLoopFromName(animationName)
            tracks[reference] = new Track(gltfAnimation, loop)
        }

        tracksCache.set(gltfAnimations, tracks)

        this.#tracks = tracks
    }

    #initInitialPose() {
        const cache = initialPoseCache.get(this.#rootBone)
        if (cache) {
            this.#initialPose = cache
            return
        }

        this.#rootBone.traverse((bone) => {
            this.#initialPose[bone.name] = {
                position: new Vector3().copy(bone.position),
                quaternion: new Quaternion().copy(bone.quaternion),
                scale: new Vector3().copy(bone.scale),
            }
        })

        initialPoseCache.set(this.#rootBone, this.#initialPose)
    }

    #initPoseSaved() {
        this.#rootBone.traverse((bone) => {
            this.#poseSaved[bone.name] = {
                position: new Vector3().copy(bone.position),
                quaternion: new Quaternion().copy(bone.quaternion),
                scale: new Vector3().copy(bone.scale),
            }
        })
    }

    /**
     * @param {number} index 
     * @param {number[]} keys 
     */
    #getAlpha(index, keys) {
        return (this.#t - keys[index - 1]) / (keys[index] - keys[index - 1])
    }

    /**
     * @param {number[]} keys 
     */
    #getIndexFromKeysTime(keys) {
        let i = 0
        while (this.#t > keys[i]) i++
        return i
    }

    /**
     * @param {number} index 
     * @param {number[]} keys 
     * @param {Vector3[]} frames 
     */
    #lerpVector3(index, keys, frames) {
        if (index === 0) {
            _vector3.copy(frames[0])
        } else if (index >= keys.length) {
            _vector3.copy(frames[frames.length - 1])
        } else {
            const alpha = this.#getAlpha(index, keys)
            _vector3.lerpVectors(frames[index - 1], frames[index], alpha)
        }
        return _vector3
    }

    /**
    * @param {number} index 
    * @param {number[]} keys 
    * @param {Vector3[]} frames 
    */
    #cubicVector3Interpolation(index, keys, frames) {
        if (index === 0) {
            _vector3.copy(frames[0])
        } else if (index >= keys.length) {
            if (keys.length < 3) _vector3.copy(frames[0])
            else _vector3.copy(frames[frames.length - 2])
        } else {
            const alpha = this.#getAlpha(index, keys)
            _vector3.cubicSpline(
                frames[(index - 1) * 3 + 1], frames[(index - 1) * 3 + 2],
                frames[index * 3 + 1], frames[index * 3],
                alpha
            )
        }
        return _vector3
    }

    #getBonePosition(boneTransformation) {
        const position = boneTransformation.position

        if (!position) return null

        const keys = position.key
        const frames = position.frame

        const index = this.#getIndexFromKeysTime(keys)

        if (position.isLinear) {
            return _position.copy(this.#lerpVector3(index, keys, frames))
        } else {
            return _position.copy(this.#cubicVector3Interpolation(index, keys, frames))
        }
    }

    #getBoneScale(boneTransformation) {
        const scale = boneTransformation.scale

        if (!scale) return null

        const keys = scale.key
        const frames = scale.frame

        const index = this.#getIndexFromKeysTime(keys)

        if (scale.isLinear) {
            return _scale.copy(this.#lerpVector3(index, keys, frames))
        } else {
            return _scale.copy(this.#cubicVector3Interpolation(index, keys, frames))
        }
    }

    /**
     * @param {number} index 
     * @param {number[]} keys 
     * @param {Quaternion[]} frames 
     */
    #slerpQuaternion(index, keys, frames) {
        if (index === 0) {
            _quaternion.copy(frames[0])
        } else if (index >= frames.length) {
            _quaternion.copy(frames[frames.length - 1])
        } else {
            const alpha = this.#getAlpha(index, keys)
            _quaternion.slerpQuaternions(frames[index - 1], frames[index], alpha)
        }
        return _quaternion
    }

    /**
     * @param {number} index 
     * @param {number[]} keys 
     * @param {Quaternion[]} frames 
     */
    #cubicQuaternion(index, keys, frames) {
        if (index === 0) {
            _quaternion.copy(frames[1])
        } else if (index >= frames.length) {
            _quaternion.copy(frames[frames.length - 2])
        } else {
            const alpha = this.#getAlpha(index, keys)

            const deltaTime = keys[index] - keys[index - 1]

            // _q0.copy(frames[(index - 1) * 3 + 2])
            // _q0.x *= deltaTime
            // _q0.y *= deltaTime
            // _q0.z *= deltaTime
            // _q0.w *= deltaTime

            // _q1.copy(frames[index * 3])
            // _q1.x *= deltaTime
            // _q1.y *= deltaTime
            // _q1.z *= deltaTime
            // _q1.w *= deltaTime

            // _quaternion.cubicSpline(
            //     frames[(index - 1) * 3 + 1], _q0,
            //     frames[index * 3 + 1], _q1,
            //     alpha
            // )

            _quaternion.cubicSpline(
                frames[(index - 1) * 3 + 1], frames[(index - 1) * 3 + 2],
                frames[index * 3 + 1], frames[index * 3],
                alpha)
        }
        return _quaternion
    }

    #getBoneQuaternion(boneTransformation) {
        const quaternion = boneTransformation.quaternion

        if (!quaternion) return null

        const keys = quaternion.key
        const frames = quaternion.frame

        const index = this.#getIndexFromKeysTime(keys)

        if (quaternion.isLinear) {
            return _quaternion.copy(this.#slerpQuaternion(index, keys, frames))
        } else {
            return _quaternion.copy(this.#cubicQuaternion(index, keys, frames))
        }
    }

    #applyTransformationToBone(bone, position, quaternion, scale) {
        if (this.#fadeTime < 1) {
            const saved = this.#poseSaved[bone.name]
            const initial = this.#initialPose[bone.name]
            bone.position.lerpVectors(saved.position, position || initial.position, this.#fadeTime)
            bone.quaternion.slerpQuaternions(saved.quaternion, quaternion || initial.quaternion, this.#fadeTime)
            bone.scale.lerpVectors(saved.scale, scale || initial.scale, this.#fadeTime)
        } else {
            const initial = this.#initialPose[bone.name]
            bone.position.copy(position || initial.position)
            bone.quaternion.copy(quaternion || initial.quaternion)
            bone.scale.copy(scale || initial.scale)
        }
    }

    #updateBone(bone) {
        const animation = this.#tracks[this.#currentAnimationName]
        if (animation === undefined) return
        const boneTransformation = animation.bones[bone.name]
        if (boneTransformation === undefined) {
            this.#applyTransformationToBone(bone)
        } else {
            const position = this.#getBonePosition(boneTransformation)
            const quaternion = this.#getBoneQuaternion(boneTransformation)
            const scale = this.#getBoneScale(boneTransformation)

            this.#applyTransformationToBone(bone, position, quaternion, scale)
        }
    }

    #updateFadeTime(deltaTime) {
        this.#fadeTime += deltaTime / this.fadeParam
    }

    #applyLoopToTime(animation) {
        if (this.#t > animation.end) {
            if (animation.loop === LoopPingpong) {
                this.#timeDirection = -1
                this.#t = animation.end
            } else if (animation.loop === LoopOnce) {
                return
            } else {
                this.#t %= animation.end
            }
        } else if (this.#t < 0) {
            this.#t = 0
            if (animation.loop === LoopPingpong) this.#timeDirection = 1
        }
    }

    #updateTime(deltaTime, animation) {
        if (this.#timeNeedsUpdate === true) {
            this.#t += deltaTime * this.#timeDirection
        } else {
            this.#timeNeedsUpdate = true
        }

        this.#applyLoopToTime(animation)
    }

    #saveCurrentPose() {
        this.#rootBone.traverse((bone) => {
            const bonePose = this.#poseSaved[bone.name]
            bonePose.position.copy(bone.position)
            bonePose.quaternion.copy(bone.quaternion)
            bonePose.scale.copy(bone.scale)
        })
    }

    setTimeUpdate(timeUpdate) {
        this.#timeNeedsUpdate = false
        this.#t = timeUpdate
    }

    update(deltaTime) {
        const animation = this.#tracks[this.#currentAnimationName]

        if (!animation) return

        this.#updateFadeTime(deltaTime)
        this.#updateTime(deltaTime, animation)

        this.#rootBone.traverse((bone) => { this.#updateBone(bone) })
        this.#rootBone.update()
    }

    play(animationName, timeUpdate) {
        if (this.#currentAnimationName === animationName) return
        this.#fadeTime = 0
        this.#saveCurrentPose()
        this.#currentAnimationName = animationName

        if (timeUpdate >= 0) {
            this.setTimeUpdate(timeUpdate)
        }
    }

    stop() { this.#currentAnimationName = '' }
}
