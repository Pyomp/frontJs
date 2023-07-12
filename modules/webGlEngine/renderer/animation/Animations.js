import { Texture } from '../models/Texture.js'

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })

let id = 0

export class Animations {
    static initialized = false

    static update = (dt_s) => {
        const f32a = new Float32Array([dt_s])
        worker.postMessage(f32a.buffer, [f32a.buffer])
    }

    id = id++

    constructor(node3D, gltfNode, animationDictionary) {
        const width = 16
        const height = gltfNode.skin.bonesCount
        const sab = new SharedArrayBuffer(width * height * 4)
        const dataTexture = new Float32Array(sab)

        const texture = new Texture({
            data: dataTexture,

            wrapS: 'CLAMP_TO_EDGE',
            wrapT: 'CLAMP_TO_EDGE',
            minFilter: 'NEAREST',
            magFilter: 'NEAREST',

            target: 'TEXTURE_2D',
            level: 0,
            internalformat: 'RGBA32F',
            width: width / 4,
            height: height,
            border: 0,
            format: 'RGBA',
            type: 'FLOAT',

            autoDataUpdate: true,
        })

        node3D.traverse(node => {
            for (const object of node.objects) {
                object.textures['u_jointTexture'] = texture
            }
        })

        worker.postMessage({ id: this.id, gltfSkin: gltfNode.skin, animationDictionary, sab })
    }

    play(animationId, animationTime) {
        const buffer = new ArrayBuffer(10)
        const view = new DataView(buffer)
        view.setUint32(0, this.id)
        view.setUint16(4, animationId)
        view.setFloat32(6, animationTime)
        worker.postMessage(buffer, [buffer])
    }

    dispose() {
        worker.postMessage({ id: this.id })
    }
}