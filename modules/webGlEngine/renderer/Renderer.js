import { Node3D } from './models/Node3D.js'
import { CameraRenderer } from './modules/Camera.js'
import { LightsManager } from './modules/LightsManager.js'
import { Program } from './Program.js'
import { StateManager } from './modules/StateManager.js'
import { NoBlending } from './constants.js'
import { Vector3 } from '../../math/Vector3.js'
import { Box3 } from '../../math/Box3.js'
import { TexturesManager } from './modules/TexturesManager.js'
import { ParticleManager } from './particle/ParticleManager.js'
import { DepthFrameBuffer } from './modules/DepthFrameBuffer.js'
import { Vector2 } from '../../math/Vector2.js'
import { EventSet } from '../../utils/EventSet.js'
import { UboUtils } from './modules/UboUtils.js'
import { Capabilities } from './modules/Capabilities.js'
import { rendererDefaultOptions } from './rendererDefaultOptions.js'
import { mergeObjects } from '../../utils/utils.js'
import { SkinnedNode } from '../nodes/SkinnedNode.js'
import { visibility } from '../../dom/visibility.js'

const _vector3 = new Vector3()
const _box3 = new Box3()

export class Renderer {
    #pointLightFadeTime

    resolution = new Vector2(1024, 1024)
    #resolutionFactor = 1

    #contextLost = false

    camera
    stateManager = new StateManager()
    texturesManager = new TexturesManager()
    #uboUtils = new UboUtils()
    capabilities = new Capabilities()

    shaderNode = {}
    canvas = document.createElement('canvas')
    #webGLcanvasParams

    constructor(/** @type {DeepPartial<RendererOptions>} */ options = {}) {
        const params = mergeObjects(rendererDefaultOptions, options)

        this.#pointLightFadeTime = params.lights.pointLightFadeTime
        this.#resolutionFactor = params.draw.resolutionFactor

        this.canvas.style.width = '100%'
        this.canvas.style.height = '100%'
        this.canvas.style.position = 'fixed'

        document.body.prepend(this.canvas)

        this.canvas.addEventListener('webglcontextlost', this.#onContextLost.bind(this), false)
        this.canvas.addEventListener('webglcontextrestored', this.#onContextRestored.bind(this), false)

        this.#webGLcanvasParams = {
            ...params.renderer,
            antialias: params.draw.depthFrameBuffer ? false : params.renderer.antialias,
        }

        this.camera = new CameraRenderer(params.camera)
        this.lightsManager = new LightsManager(params.lights)

        this.#initScene()

        if (params.draw.particlesEnabled) {
            if (params.draw.depthFrameBuffer) {
                this.depthFrameBuffer = new DepthFrameBuffer()
                this.particleManager = new ParticleManager(params.particles, this.depthFrameBuffer.depthTexture)
            } else {
                this.particleManager = new ParticleManager(params.particles)
            }
            this.scene.addObject(this.particleManager.particleObject3D)
        }

        this.#initGl()

        this.#resizeObserver.observe(this.canvas)
    }


    #initGl() {
        this.gl = this.canvas.getContext('webgl2', this.#webGLcanvasParams)
        this.capabilities.initGl(this.gl)
        this.capabilities.getError()
        this.camera.initGl(this.gl)
        this.capabilities.getError('initGl camera')
        this.stateManager.initGl(this.gl)
        this.capabilities.getError('initGl stateManager')
        this.lightsManager.initGl(this.gl)
        this.capabilities.getError('initGl lightsManager')
        this.texturesManager.initGl(this.gl)
        this.capabilities.getError('initGl texturesManager')
        this.particleManager?.initGl(this)
        this.capabilities.getError('initGl particleManager')
        this.depthFrameBuffer?.initGL(this)
        this.capabilities.getError('initGl depthFrameBuffer')
        this.#uboUtils.initGl(this)
        this.capabilities.getError('initGl uboUtils')
        this.#onResize()
    }

    #disposeGl() {
        this.scene.traverseObjects((object) => {
            object.vao.dispose()
            object.program.dispose()
            object.vao = null
            object.program = null
        })

        this.camera.disposeGl()
        this.lightsManager.disposeGl()
        this.stateManager.disposeGl()
        this.texturesManager.disposeGl()
        this.particleManager?.disposeGl()
        this.#uboUtils.disposeGl()
    }

    dispose() {
        this.#disposeGl()
        this.canvas.remove()
    }

    #onContextLost(event) {
        event.preventDefault()
        console.warn('WebGL Context Lost')
        this.#contextLost = true
        this.#disposeGl()
        if (visibility.isVisible) {
            this.#initGl()
        } else {
            visibility.addListener(() => {
                this.#initGl()
            }, { once: true })
        }
    }

    #onContextRestored() {
        console.warn('WebGL Context Restored')
        this.#contextLost = false
    }

    /** @type {(dt_s: number)=>void} */
    draw = this.#draw.bind(this)
    #draw(dt_s) {
        if (this.#contextLost) return

        this.#pointLightsUpdate(dt_s)
        this.camera.updateProjectionViewMatrix()
        this.lightsManager.update(dt_s)
        this.particleManager?.update(dt_s)
        this.scene.updateMatrix()
        this.scene.traverse((node) => {
            if (node.constructor === SkinnedNode) node.animation.updateTime(dt_s)
        })

        const nodesToDraw = this.#getNodesInFrustum()

        for (const node of nodesToDraw) {
            if (node.constructor === SkinnedNode) node.animation.updateBoneMatrix()
        }

        const objectsToDraw = this.#getObjectsInFrustum(nodesToDraw)

        for (const object of objectsToDraw) { object.createGlContext(this) }

        const [opaqueObjects, transparentObjects] = this.#sortTransparencyObjects(objectsToDraw)
        this.#optimizeSortObjectsToDraw(opaqueObjects)
        this.#optimizeSortObjectsToDraw(transparentObjects)
        // TODO sort transparent objects, this.#sortFromCameraDistance(transparentObjects.invert?)
        // maybe sort the material.testDepth/writeDepth before as it's already sorted internally

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        this.gl.disable(this.gl.BLEND)

        if (this.depthFrameBuffer) {
            this.stateManager.resetState()
            this.depthFrameBuffer.bind()
            this.stateManager.resetState()
            this.#drawObjects(opaqueObjects)
            this.depthFrameBuffer.blit()
        } else {
            this.#drawObjects(opaqueObjects)
        }

        this.gl.enable(this.gl.BLEND)
        this.#drawObjects(transparentObjects)

        // this.depthFrameBuffer.depthObject3D.createGlContext(this)
        // this.#drawObjects([this.depthFrameBuffer.depthObject3D])
    }

    #initScene() {
        this.scene = new Node3D({ parent: new Node3D() })
        if (!Node3D.defaultScene) Node3D.defaultScene = this.scene
    }

    onResize = new EventSet()
    #onResize() {
        const width = Math.floor(this.canvas.clientWidth * this.#resolutionFactor) || 1
        const height = Math.floor(this.canvas.clientHeight * this.#resolutionFactor) || 1
        this.resolution.set(width, height)
        this.canvas.width = width
        this.canvas.height = height
        this.gl.viewport(0, 0, width, height)
        this.depthFrameBuffer?.setSize(this)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.#uboUtils.update()
        this.onResize.emit()
    }
    #resizeObserver = new ResizeObserver(this.#onResize.bind(this))

    #getNodesInFrustum() {
        const nodes = []

        this.scene.traverse((node) => {
            const boundingBox = node.boundingBox

            if (!boundingBox
                || this.camera.frustum.intersectsBox(
                    _box3.copy(boundingBox).translate(node.position))
            ) {
                nodes.push(node)
            }

        })

        return nodes
    }

    #getObjectsInFrustum(/** @type {Node3D[]} */ nodes) {
        /** @type {Object3D[]} */
        const result = []

        for (const node of nodes) {
            for (const object of node.objects) {
                const boundingBox = object.geometry.boundingBox

                if (!boundingBox
                    || this.camera.frustum.intersectsBox(
                        _box3.copy(boundingBox).translate(node.position))
                ) {
                    result.push(object)
                }
            }
        }

        return result
    }

    /** @param {Object3D[]} objects */
    #sortTransparencyObjects(objects) {
        const opaque = []
        const transparent = []

        for (const object of objects) {
            if (object.material.blending === NoBlending) {
                opaque.push(object)
            } else {
                transparent.push(object)
            }
        }

        return [opaque, transparent]
    }

    #optimizeSortObjectsToDraw(/** @type {Object3D[]} */  objects) {
        objects.sort((a, b) => {
            if (a.program.id !== b.program.id) return a.program.id - b.program.id
            if (a.vao.id !== b.vao.id) return a.vao.id - b.vao.id
            if (a.material.configId !== b.material.configId) return a.material.configId - b.material.configId
            return 0
        })
    }

    #sortFromCameraDistance(element3Ds) {
        for (const element3D of element3Ds) {
            element3D.distanceToCameraSq =
                _vector3.subVectors(element3D.position, this.camera.position).lengthSq()
        }
        element3Ds.sort((a, b) => a.distanceToCameraSq - b.distanceToCameraSq)

        return element3Ds
    }

    /** @param {Object3D[]} objects */
    #drawObjects(objects) {
        /** @type {Program} */ let currentProgram
        let currentVao
        for (const object of objects) {
            if (currentProgram !== object.program) {
                currentProgram = object.program
                this.gl.useProgram(object.program.glProgram)
            }

            if (currentVao !== object.vao) {
                currentVao = object.vao
                this.gl.bindVertexArray(object.vao.glVao)
            }

            this.stateManager.glParamsUpdate(object.material)

            this.texturesManager.updateObjectTextures(currentProgram, object.textures)

            currentProgram.updateUniforms(object.uniforms)

            object.draw(this.gl)
        }
    }

    pointLights = new Set()
    #pointLightUpdateTime = 0
    #pointLightsUpdate(dt) {
        this.#pointLightUpdateTime += dt
        if (this.#pointLightUpdateTime > this.#pointLightFadeTime) {
            this.#pointLightUpdateTime = 0
            const pointLights = this.#sortFromCameraDistance([...this.pointLights.values()])
            this.lightsManager.pointLights.updatePointLights(pointLights)
        }
    }
}
