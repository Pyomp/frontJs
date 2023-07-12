import { getGltfData } from './GltfNodes.js'


/* BINARY EXTENSION */
const BINARY_EXTENSION_HEADER_MAGIC = 'glTF'
const BINARY_EXTENSION_HEADER_LENGTH = 12
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 }

class GLBinaryData {

    constructor(data) {

        const textDecoder = new TextDecoder()

        this.content = null
        this.body = null

        const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH)

        this.header = {
            magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
            version: headerView.getUint32(4, true),
            length: headerView.getUint32(8, true)
        }

        if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {

            throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.')

        } else if (this.header.version < 2.0) {

            throw new Error('THREE.GLTFLoader: Legacy binary file detected.')

        }

        const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH

        const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH)
        let chunkIndex = 0

        while (chunkIndex < chunkContentsLength) {

            const chunkLength = chunkView.getUint32(chunkIndex, true)
            chunkIndex += 4

            const chunkType = chunkView.getUint32(chunkIndex, true)
            chunkIndex += 4

            if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {

                const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength)
                this.content = JSON.parse(textDecoder.decode(contentArray))

            } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {

                const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex
                this.body = data.slice(byteOffset, byteOffset + chunkLength)

            }

            // Clients must ignore chunks with unknown types.

            chunkIndex += chunkLength

        }

        if (this.content === null) {

            throw new Error('THREE.GLTFLoader: JSON content not found.')

        }
    }
}

export class GlbLoader {

    /**
     * @param {URL | string} url 
     */
    async load(url) {
        if (typeof fetch === 'undefined') {
            return getGltfData(new GLBinaryData((await import('fs')).readFileSync(url)))
        } else {
            return getGltfData(new GLBinaryData(await (await fetch(url)).arrayBuffer()))
        }
    }
}
