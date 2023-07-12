import { Texture } from '../../../modules/webGlEngine/renderer/models/Texture.js'
import {
    ANIMATION_ACTION0, ANIMATION_ACTION1,
    ANIMATION_ACTION10,
    ANIMATION_ACTION11,
    ANIMATION_ACTION2, ANIMATION_ACTION3,
    ANIMATION_ACTION4,
    ANIMATION_ACTION5,
    ANIMATION_ACTION6,
    ANIMATION_ACTION7,
    ANIMATION_ACTION8,
    ANIMATION_ACTION9,
    ANIMATION_BLOCK_TRIGGERED, ANIMATION_FALLING,
    ANIMATION_IDLE, ANIMATION_JUMP0,
    ANIMATION_JUMP1, ANIMATION_JUMP2,
    ANIMATION_KNOCKDOWN, ANIMATION_RUN,
    ANIMATION_SLIDE, ANIMATION_STAGGER,
    ANIMATION_STATE0, ANIMATION_STATE1,
    ANIMATION_STATE2, ANIMATION_STATE3
} from '../../constants/constantsAnimations.js'
import { context3D } from '../../globals/context3D.js'
import { ThunderStrikeEffectAnimation } from './animations/thunderStrike.js'
import { updatePuwuParticles, makeParticlePuwuData } from './puwuParticles.js'

export const puwu3d = {
    async getGltfNode() {
        const gltfNodes = await context3D.glbLoader.load(new URL('../../../assets/3Dmodels/puwu/puwu.glb', import.meta.url))

        const node = gltfNodes['puwuMesh']

        const texture = new Texture({})
        texture.data.src = new URL('../../../assets/3Dmodels/puwu/puwu.svg', import.meta.url).href

        for (const primitive of node.mesh.primitives) {
            primitive.material.textures['u_map'] = texture
        }

        return node
    },

    async getWeaponGltfNode() {
        const gltfNodes = await context3D.glbLoader.load(new URL('../../../assets/3Dmodels/puwu/puwu.glb', import.meta.url))
        const gltfNode = gltfNodes['weapon']
        const texture = new Texture({})

        texture.data.src = new URL('../../../assets/3Dmodels/puwu/puwu.svg', import.meta.url).href
        for (const primitive of gltfNode.mesh.primitives) {
            primitive.material.textures['u_map'] = texture
        }


        return gltfNode
    },

    makeParticleData: makeParticlePuwuData,
    updateParticles: updatePuwuParticles,
    ClassEffectAnimation: {
        [ANIMATION_ACTION0]: ThunderStrikeEffectAnimation
    },

    animationDictionary: {
        'puwuIdle_pingpong': ANIMATION_IDLE,
        'puwuRun_pingpong': ANIMATION_RUN,
        'puwuFalling': ANIMATION_FALLING,
        'puwuJump': ANIMATION_JUMP0,
        'puwuDoubleJump': ANIMATION_JUMP1,
        'puwuTripleJump': ANIMATION_JUMP2,
        'puwuSlide': ANIMATION_SLIDE,

        'puwuStagger': ANIMATION_STAGGER,
        'puwuKnockdown': ANIMATION_KNOCKDOWN,
        'puwuBlockTriggered': ANIMATION_BLOCK_TRIGGERED,

        'puwuAction0': ANIMATION_ACTION0,
        'puwuAction1Auto1': ANIMATION_ACTION1,
        'puwuAction2Auto2': ANIMATION_ACTION2,
        'puwuAction3Auto3': ANIMATION_ACTION3,
        'leapingStrike': ANIMATION_ACTION4,
        'flatten': ANIMATION_ACTION5,
        'sweepingStrike': ANIMATION_ACTION6,
        'raze': ANIMATION_ACTION7,
        'tackle': ANIMATION_ACTION8,
        'evasiveRoll': ANIMATION_ACTION9,
        'overwhelm': ANIMATION_ACTION10,
        'lethalStrike': ANIMATION_ACTION11,

        'puwuState0_pingpong': ANIMATION_STATE0,
        'puwuState1_pingpong': ANIMATION_STATE1,
        'puwuState2_repeat': ANIMATION_STATE2,
        'puwuState3Block_pingpong': ANIMATION_STATE3,
    }
}
