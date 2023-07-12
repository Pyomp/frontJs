import { Box3 } from '../../../math/Box3.js'
import { Attribute } from './Attribute.js'

const cache = new WeakMap()

function getFromGltfPrimitive(gltfPrimitive) {
    if (cache.has(gltfPrimitive) === true) {
        return cache.get(gltfPrimitive)
    } else {
        const gltfAttributes = gltfPrimitive.attributes
        const attributes = []
        const boundingBox = new Box3()
        if (gltfAttributes.POSITION) {
            const data = gltfAttributes.POSITION
            attributes.push(new Attribute('a_position', data.buffer, data.type))
            if (data.min && data.max) {
                boundingBox.min.fromArray(data.min)
                boundingBox.max.fromArray(data.max)
            }
        }
        // this extension appear when the Blender shader have no BSDF Node
        if (gltfAttributes.NORMAL && !gltfPrimitive.material?.extensions?.KHR_materials_unlit) {
            attributes.push(new Attribute('a_normal', gltfAttributes.NORMAL.buffer, gltfAttributes.NORMAL.type))
        }

        let i = 0
        while (gltfAttributes[`TEXCOORD_${i}`]) {
            const name = i === 0 ? 'a_uv' : `a_uv${i + 1}`
            attributes.push(new Attribute(name, gltfAttributes[`TEXCOORD_${i}`].buffer, gltfAttributes[`TEXCOORD_${i}`].type))
            i++
        }

        i = 0
        while (gltfAttributes[`JOINTS_${i}`]) {
            const name = i === 0 ? 'a_joints' : `a_joints${i + 1}`
            attributes.push(new Attribute(name, gltfAttributes[`JOINTS_${i}`].buffer, gltfAttributes[`JOINTS_${i}`].type))
            i++
        }

        i = 0
        while (gltfAttributes[`WEIGHTS_${i}`]) {
            const name = i === 0 ? 'a_weights' : `a_weights${i + 1}`
            attributes.push(new Attribute(name, gltfAttributes[`WEIGHTS_${i}`].buffer, gltfAttributes[`WEIGHTS_${i}`].type))
            i++
        }

        i = 0
        while (gltfAttributes[`COLOR_${i}`]) {
            const name = i === 0 ? 'a_vertexColor' : `a_color${i + 1}`
            const attributeBuffer = gltfAttributes[`COLOR_${i}`].buffer
            const buffer = new Float32Array(attributeBuffer.length)
            const max = (2 ** (attributeBuffer.BYTES_PER_ELEMENT * 8)) - 1
            for (let i = 0; i < attributeBuffer.length; i++) {
                buffer[i] = attributeBuffer[i] / max
            }
            attributes.push(new Attribute(name, buffer, gltfAttributes[`COLOR_${i}`].type))
            i++
        }

        const geometry = new Geometry(attributes, boundingBox, gltfPrimitive.indices?.buffer)

        cache.set(gltfPrimitive, geometry)

        return geometry
    }
}

let id = 0

export class Geometry {
    id = id++

    static getFromGltfPrimitive = getFromGltfPrimitive

    /** @type {{[attributeName: string]: Attribute}} */
    attributes = {}

    indices
    boundingBox

    /**
     * @param {Attribute[]} attributes 
     * @param {Box3=} boundingBox
     * @param {undefined | Uint8Array | Uint16Array | Uint32Array=} indices
     */
    constructor(attributes = [], boundingBox, indices) {
        for (const attribute of attributes) {
            this.attributes[attribute.name] = attribute
        }
        this.boundingBox = boundingBox
        this.indices = indices
    }
}