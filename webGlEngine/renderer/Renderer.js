import { Node3D } from '../core/Node3D.js'
import { Camera } from './modules/Camera.js'
import { Lights } from './modules/Lights.js'
import { Program } from './Program.js'
import { State } from './modules/State.js'
import { Texture } from '../core/Texture.js'
import { Vao } from './Vao.js'
import { Frustum } from '../../math/Frustum.js'
import { NoBlending } from './constants.js'
import { Vector3 } from '../../math/Vector3.js'
import { Box3 } from '../../math/Box3.js'

const _vector3 = new Vector3()
const groupToIndex = new Map()
function compareGroupBy(a, b) {
    let indexGroup = 0
    groupToIndex.clear()
    let indexA = groupToIndex.get(a)
    let indexB = groupToIndex.get(b)

    if (indexA === undefined) {
        indexA = indexGroup++
        groupToIndex.set(a, indexA)
    }
    if (indexB === undefined) {
        indexB = indexGroup++
        groupToIndex.set(b, indexB)
    }

    return indexA - indexB
}

const box3 = new Box3()

export class Renderer {
    /** @type {Map.<Texture, WebGLTexture>} */
    glTextures = new Map()

    #cameraFrustum = new Frustum()
    onBeforeRender = new Set()
    #pointLightFadeTime

    shaderNode = {}

    constructor({
        parent = document.body,
        directionalLightMaxCount = 2,
        pointLightMaxCount = 20,
        pointLightFadeTime = 0.2,
        useSpecular = true,
    } = {}) {
        this.#pointLightFadeTime = pointLightFadeTime

        this.canvas = document.createElement('canvas')
        parent.prepend(this.canvas)
        this.canvas.style.width = '100%'
        this.canvas.style.height = '100%'
        this.canvas.style.position = 'fixed'

        this.#initGl({
            directionalLightMaxCount,
            pointLightMaxCount,
            pointLightFadeTime,
            useSpecular,
        })
        this.#initScene()
        this.#initResizeListener()

        this.canvas.addEventListener('webglcontextlost', (e) => {
            console.log('webglcontextlost')
            // this.#initGl()
        })

        // window.addEventListener('keydown', (e) => {
        //     switch (e.key) {
        //         case 'o':
        //             this.gl.getExtension('WEBGL_lose_context').loseContext()
        //             break
        //         case 'p':

        //             break
        //     }
        // })
    }

    draw = this.#drawProto.bind(this)
    #drawProto(dt) {
        this.#pointLightsUpdate(dt)
        for (const cb of this.onBeforeRender) cb(dt)
        this.camera.updateProjectionViewMatrix()
        this.#cameraFrustum.setFromProjectionMatrix(this.camera.projectionViewMatrix)
        this.lights.update(dt)
        this.#updateNodes(dt)

        const objectToDraw = this.#getObjectsToDraw()
        this.#sortObjectsToDraw(objectToDraw)

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        this.#drawObjects(objectToDraw)
    }

    dispose() {
        this.camera.dispose()
        this.lights.dispose()
        this.canvas.remove()
        this.glTextures.clear()
    }

    #initGl({
        directionalLightMaxCount,
        pointLightMaxCount,
        pointLightFadeTime,
        useSpecular,
    }) {
        const gl = this.canvas.getContext('webgl2', {
            alpha: true,
            depth: true,
            stencil: false,
            antialias: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false,
        })

        this.gl = gl

        this.state = new State(gl)
        this.camera = new Camera(gl)
        this.lights = new Lights(gl, {
            directionalLightMaxCount,
            pointLightMaxCount,
            pointLightFadeTime,
            useSpecular,
        })
    }

    pointLights = new Set()

    #initScene() {
        this.scene = new Node3D()
        Node3D.defaultScene = this.scene
        this.scene.onAdd = this.#compileNode.bind(this)
    }

    #initResizeListener() {
        this.#onResize()
        this.#resizeObserver.observe(this.canvas)
    }

    #onResize() {
        this.width = this.canvas.clientWidth || 1
        this.height = this.canvas.clientHeight || 1
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.gl.viewport(0, 0, this.width, this.height)
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()
    }
    #resizeObserver = new ResizeObserver(this.#onResize.bind(this))

    /**
     * @param {Node3D} node3D 
     */
    #compileNode(node3D) {
        node3D.traverseObjects((object3D) => {
            object3D.createGlContext(this)
        })
    }

    /** @param {Texture} texture */
    #getGlTexture(texture) {
        if (this.glTextures.has(texture)) {
            return this.glTextures.get(texture)
        } else {
            const glTexture = this.gl.createTexture()
            this.glTextures.set(texture, glTexture)
            texture.onDispose.add(() => {
                this.gl.deleteTexture(glTexture)
                this.glTextures.delete(texture)
            })
            return glTexture
        }
    }

    #updateNodes(dt) {
        if (this.scene.worldMatrixNeedsUpdates === true) {
            this.scene.updateWorldMatrix(true, true)
        }
        this.scene.traverse((child) => {
            if (child.worldMatrixNeedsUpdates === true) {
                child.updateWorldMatrix(true, true)
            }
            child.onBeforeRender(dt)
        })
    }

    #getObjectsToDraw() {
        const objects = []
        this.scene.traverseObjects((object, node) => {
            const boundingBox = object.geometry.boundingBox

            if (!boundingBox
                ||this.#cameraFrustum.intersectsBox(box3.copy(boundingBox).translate(node.position))) {
                objects.push(object)
            }
        })
        return objects
    }

    #compareTransparent(a, b) {
        const isATransparent = a !== NoBlending
        const isBTransparent = b !== NoBlending
        if (isATransparent && !isBTransparent) return 1
        else if (!isATransparent && isBTransparent) return -1
        else return 0
    }

    /** TODO NEEDS TEST !!! */
    /** @param {Object3D[]} objects */
    #sortObjectsToDraw(objects) {
        objects.sort((a, b) => {
            const compareTransparent = this.#compareTransparent(a.material.blending, b.material.blending)
            if (compareTransparent !== 0) return compareTransparent

            const compareProgram = compareGroupBy(a.program, b.program)
            if (compareProgram !== 0) return compareProgram

            const compareVao = compareGroupBy(a.vao, b.vao)
            if (compareVao !== 0) return compareVao
        })
    }


    #getDistanceSqToCamera(position) {
        return _vector3.subVectors(position, this.camera.position).lengthSq()
    }

    /** @param {PointLight[]} pointLights */
    #sortPointLights(pointLights) {
        for (const light of pointLights) {
            light.distanceToCameraSq = this.#getDistanceSqToCamera(light.position)
        }
        pointLights.sort((a, b) => a.distanceToCameraSq - b.distanceToCameraSq)
        return pointLights
    }

    /**
     * @param {Program} program 
     * @param {Texture} texture 
     * @param {string} textureName
     */
    #updateTextureData(program, texture, textureName) {
        if (texture.needsDataUpdate === true || texture.autoDataUpdate === true) {
  
            this.gl.texImage2D(this.gl[texture.target], texture.level, this.gl[texture.internalformat], texture.width, texture.height, texture.border,
                this.gl[texture.format], this.gl[texture.type], texture.data)

            if (texture.needsMipmap)
                this.gl.generateMipmap(this.gl[texture.target])

            if (texture.scale)
                program.uniformSetters[textureName + 'Scale'](texture.scale)

            texture.needsDataUpdate = false
        }
    }

    /** @param {Texture} texture */
    #updateTextureParameters(texture, glTexture) {
        if (texture.needsParametersUpdate) {
            texture.needsParametersUpdate = false
            this.gl.bindTexture(this.gl[texture.target], glTexture)
            this.gl.texParameteri(this.gl[texture.target], this.gl.TEXTURE_WRAP_S, this.gl[texture.wrapS])
            this.gl.texParameteri(this.gl[texture.target], this.gl.TEXTURE_WRAP_T, this.gl[texture.wrapT])
            this.gl.texParameteri(this.gl[texture.target], this.gl.TEXTURE_MIN_FILTER, this.gl[texture.minFilter])
            this.gl.texParameteri(this.gl[texture.target], this.gl.TEXTURE_MAG_FILTER, this.gl[texture.magFilter])
        }
    }

    /**
     * @param {Program} program 
     * @param {{ [name: string]: Texture }} textures 
     */
    #texturesUpdate(program, textures) {
        for (const textureName in textures) {
            const texture = textures[textureName]

            const glTexture = this.#getGlTexture(texture)

            this.#updateTextureParameters(texture, glTexture)

            this.gl.activeTexture(program.textureUnits[textureName])
            this.gl.bindTexture(this.gl[texture.target], glTexture)

            this.#updateTextureData(program, texture, textureName)
        }
    }

    /** @param {Object3D[]} objects */
    #drawObjects(objects) {
        let currentProgram
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

            this.state.glParamsUpdate(object.material)
            this.#texturesUpdate(currentProgram, object.textures)
            currentProgram.uniformsUpdate(object.uniforms)

            object.draw(this.gl)
        }
    }

    #pointLightUpdateTime = 0
    #pointLightsUpdate(dt) {
        this.#pointLightUpdateTime += dt
        if (this.#pointLightUpdateTime > this.#pointLightFadeTime) {
            this.#pointLightUpdateTime = 0
            const pointLights = this.#sortPointLights([...this.pointLights.values()])
            this.lights.pointLights.updatePointLights(pointLights)
        }
    }
}


