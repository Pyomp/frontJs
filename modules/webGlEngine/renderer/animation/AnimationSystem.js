import { Quaternion } from '../../../math/Quaternion.js'
import { Vector3 } from '../../../math/Vector3.js'
import { LoopOnce, LoopPingpong, LoopRepeat } from './constants.js'
import { Track } from './Track.js'

const vs_pars = () => `
in vec4 a_weights;
in uvec4 a_joints;

uniform sampler2D u_jointTexture;

mat4 getBoneMatrix(uint jointNdx) {
    return mat4(
      texelFetch(u_jointTexture, ivec2(0, jointNdx), 0),
      texelFetch(u_jointTexture, ivec2(1, jointNdx), 0),
      texelFetch(u_jointTexture, ivec2(2, jointNdx), 0),
      texelFetch(u_jointTexture, ivec2(3, jointNdx), 0));
}
`

const vs_main = () => `
mat4 skinMatrix = getBoneMatrix(a_joints[0]) * a_weights[0] +
                getBoneMatrix(a_joints[1]) * a_weights[1] +
                getBoneMatrix(a_joints[2]) * a_weights[2] +
                getBoneMatrix(a_joints[3]) * a_weights[3];
`

const _vector3 = new Vector3()
const _position = new Vector3()
const _scale = new Vector3()
const _quaternion = new Quaternion()

const tracksCache = new WeakMap()
const initialPoseCache = new WeakMap()

export class AnimationSystem {
    static vs_pars = vs_pars
    static vs_main = vs_main

    #rootBone
    #initialPose = {}
    #poseSaved = {}

    /** @type {{[trackName: string]: Track}} */
    #tracks = {}
    /** @type {Track} */ #currentAnimation
    #t = 0
    speed = 1
    #fadeTime = 0
    #timeDirection = 1

    fadeSpeed = 7

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
        this.#initCurrentAnimation()
        this.#rootBone.updateMatrix()
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

    #initCurrentAnimation() {
        for (const key in this.#tracks) { this.#currentAnimation = this.#tracks[key]; break }
    }

    #initTracks(gltfAnimations, animationDictionary) {
        const cache = tracksCache.get(gltfAnimations)
        if (cache) {
            this.#tracks = cache
            return
        }

        /** @type {{[trackName: string]: Track}} */
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

    /** @param { KeyFrame } bonePositionKeyFrame */
    #getBonePosition(bonePositionKeyFrame) {
        if (!bonePositionKeyFrame) return null

        const keys = bonePositionKeyFrame.key
        const frames = bonePositionKeyFrame.frame

        const index = this.#getIndexFromKeysTime(keys)

        if (bonePositionKeyFrame.isLinear) {
            return _position.copy(this.#lerpVector3(index, keys, frames))
        } else {
            return _position.copy(this.#cubicVector3Interpolation(index, keys, frames))
        }
    }

    /**  @param { KeyFrame } boneScaleKeyFrame */
    #getBoneScale(boneScaleKeyFrame) {
        if (!boneScaleKeyFrame) return null

        const keys = boneScaleKeyFrame.key
        const frames = boneScaleKeyFrame.frame

        const index = this.#getIndexFromKeysTime(keys)

        if (boneScaleKeyFrame.isLinear) {
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

            _quaternion.cubicSpline(
                frames[(index - 1) * 3 + 1], frames[(index - 1) * 3 + 2],
                frames[index * 3 + 1], frames[index * 3],
                alpha)
        }
        return _quaternion
    }

    /**  @param { KeyFrame } quaternionKeyFrame */
    #getBoneQuaternion(quaternionKeyFrame) {
        if (!quaternionKeyFrame) return null

        const keys = quaternionKeyFrame.key
        const frames = quaternionKeyFrame.frame

        const index = this.#getIndexFromKeysTime(keys)

        if (quaternionKeyFrame.isLinear) {
            return this.#slerpQuaternion(index, keys, frames)
        } else {
            return this.#cubicQuaternion(index, keys, frames)
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

    #updateBoneFromFrame(bone) {
        const boneTransformation = this.#currentAnimation.bones[bone.name]

        if (boneTransformation === undefined) {
            this.#applyTransformationToBone(bone)
        } else {
            const position = this.#getBonePosition(boneTransformation.position)
            const quaternion = this.#getBoneQuaternion(boneTransformation.quaternion)
            const scale = this.#getBoneScale(boneTransformation.scale)

            this.#applyTransformationToBone(bone, position, quaternion, scale)
        }
    }

    #updateFadeTime(deltaTime) {
        this.#fadeTime += deltaTime * this.fadeSpeed
    }

    #applyLoopToTime() {
        if (this.#t > this.#currentAnimation.end) {
            if (this.#currentAnimation.loop === LoopPingpong) {
                this.#timeDirection = -1
                this.#t = this.#currentAnimation.end
            } else if (this.#currentAnimation.loop === LoopOnce) {
                return
            } else {
                this.#t %= this.#currentAnimation.end
            }
        } else if (this.#t < 0) {
            this.#t = -this.#t
            if (this.#currentAnimation.loop === LoopPingpong) this.#timeDirection = 1
        }
    }

    #updateTime(deltaTime) {
        this.#t += deltaTime * this.#timeDirection * this.speed
        this.#applyLoopToTime()
    }

    #saveCurrentPose() {
        this.#rootBone.traverse((bone) => {
            const bonePose = this.#poseSaved[bone.name]
            bonePose.position.copy(bone.position)
            bonePose.quaternion.copy(bone.quaternion)
            bonePose.scale.copy(bone.scale)
        })
    }

    updateTime(deltaTime) {
        this.#updateFadeTime(deltaTime)
        this.#updateTime(deltaTime)
    }

    updateBoneMatrix() {
        this.#rootBone.traverse((bone) => { this.#updateBoneFromFrame(bone) })
        this.#rootBone.updateMatrix()
    }

    play(animationName, timeUpdate = 0) {
        const track = this.#tracks[animationName]
        if (this.#currentAnimation !== track) {
            if (track === undefined) return
            this.#t = 0
            this.#fadeTime = 0
            this.#timeDirection = 1
            this.#saveCurrentPose()
            this.#currentAnimation = this.#tracks[animationName]
        }

        if (this.#currentAnimation.loop === LoopOnce) {
            this.#t = timeUpdate
        }
    }
}
