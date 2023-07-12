const DURATION_BEFORE_DISPOSE = 5000

const cacheMap = {}
const cache = {
    get(geometryId, programId) {
        return cacheMap[geometryId]?.[programId]
    },
    set(geometryId, programId, vao) {
        if (!cacheMap[geometryId]) cacheMap[geometryId] = {}
        cacheMap[geometryId][programId] = vao
    },
    delete(geometryId, programId) {
        delete cacheMap[geometryId]?.[programId]
    }
}

let id = 0

export class Vao {
    static create(renderer, object3D) {
        const cacheVao = cache.get(object3D.geometry.id, object3D.program.id)
        if (cacheVao) {
            cacheVao.addObject3D(object3D)
            return cacheVao
        } else {
            const vao = new Vao(renderer, object3D)
            cache.set(object3D.geometry.id, object3D.program.id, vao)
            return vao
        }
    }

    id = id++

    /** @type {{[attributeName: string]: WebGLBuffer}} */
    #glBuffers = {}
    /** @type {WebGLBuffer} */
    #indicesGlBuffer
    /** @type {{[attributeName: string]: TypedArray}} */
    #attributesTypedArray = {}

    #gl
    #programId
    #geometryId

    #object3Ds = new Set()
    addObject3D(object3D) {
        this.#object3Ds.add(object3D)
        object3D.onDispose.add(() => { this.#deleteObject(object3D) })
    }

    #deleteObject(object) {
        this.#object3Ds.delete(object)
        if (this.#object3Ds.size === 0) {
            setTimeout(() => { if (this.#object3Ds.size === 0) this.dispose() }, DURATION_BEFORE_DISPOSE)
        }
    }

    /**
     * @param {Renderer} renderer
     * @param {Object3D} object3D
     */
    constructor(renderer, object3D) {
        this.addObject3D(object3D)
        this.#geometryId = object3D.geometry.id
        this.#programId = object3D.program.id

        this.#gl = renderer.gl
        this.#initGl(object3D.program, object3D.geometry)
    }

    attributesUpdate(attributeName) {
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#glBuffers[attributeName])
        this.#gl.bufferSubData(this.#gl.ARRAY_BUFFER, 0, this.#attributesTypedArray[attributeName])
    }

    #initGl(program, /** @type {Geometry} */ geometry) {
        if (this.glVao !== undefined) return

        this.#gl.useProgram(program.glProgram)
        this.glVao = this.#gl.createVertexArray()
        this.#gl.bindVertexArray(this.glVao)

        const attributes = geometry.attributes
        for (const key in attributes) {
            const attribute = attributes[key]
            const name = attribute.name

            const location = this.#gl.getAttribLocation(program.glProgram, name)
            if (location === -1) {
                console.log(`getAttribLocation: ${name} location not found (optimized)`)
            } else {
                this.#glBuffers[name] = this.#gl.createBuffer()
                const buffer = attribute.buffer
                this.#attributesTypedArray[name] = buffer

                this.#gl.enableVertexAttribArray(location)
                this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#glBuffers[name])
                this.#gl.bufferData(this.#gl.ARRAY_BUFFER, buffer, this.#gl[attribute.usage])

                if (attribute.type !== 'FLOAT') {
                    this.#gl.vertexAttribIPointer(location, attribute.size, this.#gl[attribute.type], 0, 0)
                } else {
                    this.#gl.vertexAttribPointer(location, attribute.size, this.#gl[attribute.type], false, 0, 0)
                }
            }
        }

        if (geometry.indices !== undefined) {
            this.#indicesGlBuffer = this.#gl.createBuffer()
            this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.#indicesGlBuffer)
            this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER, geometry.indices, this.#gl.STATIC_DRAW)
        }
    }

    #disposeGl() {
        if (this.glVao === undefined) return

        this.#gl.deleteVertexArray(this.glVao)

        for (const key in this.#glBuffers) {
            const glBuffer = this.#glBuffers[key]
            this.#gl.deleteBuffer(glBuffer)
        }
        this.#gl.deleteBuffer(this.#indicesGlBuffer)

        this.glVao = undefined
        this.#glBuffers = {}
    }

    dispose() {
        this.#disposeGl()
        cache.delete(this.#geometryId, this.#programId)
    }
}
