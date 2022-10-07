const gltfTypeToSize = {
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'SCALAR': 1,
}

const classToType = new Map
classToType.set(Uint8Array, 'UNSIGNED_BYTE')
classToType.set(Float32Array, 'FLOAT')
classToType.set(Uint16Array, 'UNSIGNED_SHORT')


export class Attribute {
    /**
     * @param { string } name 
     * @param { Uint8Array | Float32Array | Uint16Array } buffer
     * @param {'VEC2' | 'VEC3' | 'VEC4' | 'SCALAR'} gltfType 
     * @param {'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW' | 'STATIC_READ' | 'DYNAMIC_READ' | 'STREAM_READ' | 'STATIC_COPY' | 'DYNAMIC_COPY' | 'STREAM_COPY'} usage 
     */
    constructor(name, buffer, gltfType, usage = 'STATIC_DRAW') {
        /** @type {string} */
        this.name = name

        /** @type {number} */
        this.size = gltfTypeToSize[gltfType]

        /** @type {'BYTE' | 'SHORT' | 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'FLOAT'} */
        this.type = classToType.get(buffer.constructor)

        /** @type {'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW' | 'STATIC_READ' | 'DYNAMIC_READ' | 'STREAM_READ' | 'STATIC_COPY' | 'DYNAMIC_COPY' | 'STREAM_COPY'} */
        this.usage = usage

        /** @type {Uint8Array | Float32Array | Uint16Array} */
        this.buffer = buffer
    }
}






