/** @typedef {Map.<Geometry, Vao>} CacheGeometryToVao */
/** @type {Map.<Program, CacheGeometryToVao>}  */
const cacheProgramToCache = new Map()

const cache = {
    get(geometry, program) {
        if (!cacheProgramToCache.has(program)) return null
        const cacheVaos = cacheProgramToCache.get(program)
        if (!cacheVaos.has(geometry)) return null
        const vao = cacheVaos.get(geometry)
        return vao
    },
    set(geometry, program, vao) {
        let cacheVaos = cacheProgramToCache.get(program)
        if (!cacheVaos) {
            cacheVaos = new Map()
            cacheProgramToCache.set(program, cacheVaos)
        }
        cacheVaos.set(geometry, vao)
    },
    delete(geometry, program) {
        const cacheVaos = cacheProgramToCache.get(program)
        if (cacheVaos) {
            cacheVaos.delete(geometry)
            if (cacheVaos.size === 0) {
                cacheProgramToCache.delete(program)
            }
        }
    }
}

export class Vao {
    /** @type {Program} */
    #program
    /** @type {{[attributeName: string]: WebGLBuffer}} */
    #glBuffers = {}
    /** @type {WebGLBuffer} */
    #indexGlBuffer
    /** @type {{[attributeName: string]: TypedArray}} */
    #attributesBuffer = {}
    /** @type {WebGL2RenderingContext} */
    #gl

    #usedCount = 1
    incrUsedCount() { this.#usedCount++ }
    decrUsedCount() {
        this.#usedCount--
        if (this.#usedCount === 0) {
            this.dispose()
        }
    }

    /** @type {Geometry} */
    #geometry

    id = Math.random() * 100
    
    /**
     * @param {Object3D} object3D
     */
    constructor(object3D) {
        this.#geometry = object3D.geometry
        this.#program = object3D.program

        const cacheVao = cache.get(this.#geometry, this.#program)
        if (cacheVao) {
            cacheVao.incrUsedCount()
            return cacheVao
        }
        else cache.set(this.#geometry, this.#program, this)
        
        this.incrUsedCount()
        this.#initGl()
    }

    attributesUpdate(attributeName) {
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#glBuffers[attributeName])
        this.#gl.bufferSubData(this.#gl.ARRAY_BUFFER, 0, this.#attributesBuffer[attributeName], 0)
    }

    #initGl() {
        if (this.glVao !== undefined) return
        this.#gl = this.#program.gl
        this.#gl.useProgram(this.#program.glProgram)
        this.glVao = this.#gl.createVertexArray()
        this.#gl.bindVertexArray(this.glVao)

        const attributes = this.#geometry.attributes
        for (const key in attributes) {
            const attribute = attributes[key]
            const name = attribute.name

            const location = this.#gl.getAttribLocation(this.#program.glProgram, name)
            if (location === -1) {
                console.log(`getAttribLocation: ${name} location not found (optimized)`)
            } else {
                this.#glBuffers[name] = this.#gl.createBuffer()
                const buffer = attribute.buffer
                this.#attributesBuffer[name] = buffer

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

        if (this.#geometry.indices !== undefined) {
            this.#indexGlBuffer = this.#gl.createBuffer()
            this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.#indexGlBuffer)
            this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER, this.#geometry.indices, this.#gl.STATIC_DRAW)
        }
    }

    #disposeGl() {
        if (this.glVao === undefined) return

        this.#gl.deleteVertexArray(this.glVao)

        for (const key in this.#glBuffers) {
            const glbuffer = this.#glBuffers[key]
            this.#gl.deleteBuffer(glbuffer)
        }
        this.#gl.deleteBuffer(this.#indexGlBuffer)

        this.glVao = undefined
        this.#glBuffers = {}
    }

    dispose() {
        this.#disposeGl()
        cache.delete(this.#geometry, this.#program)
    }
}
