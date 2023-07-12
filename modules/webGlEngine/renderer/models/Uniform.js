import {
    UNIFORM_TYPE_COLOR,
    UNIFORM_TYPE_MATRIX3,
    UNIFORM_TYPE_MATRIX4,
    UNIFORM_TYPE_NUMBER,
    UNIFORM_TYPE_VECTOR2,
    UNIFORM_TYPE_VECTOR3,
    UNIFORM_TYPE_VECTOR4
} from "../webGlUtils.js"

export class Uniform {
    needsUpdate = true
    type = -1

    #data
    get data() { return this.#data }
    set data(data) {
        this.#data = data
        const typeofData = typeof data
        if (typeofData === 'number') this.type = UNIFORM_TYPE_NUMBER
        else if (data.isVector2) this.type = UNIFORM_TYPE_VECTOR2
        else if (data.isVector3) this.type = UNIFORM_TYPE_VECTOR3
        else if (data.isVector4) this.type = UNIFORM_TYPE_VECTOR4
        else if (data.isColor) this.type = UNIFORM_TYPE_COLOR
        else if (data.isMatrix3) this.type = UNIFORM_TYPE_MATRIX3
        else if (data.isMatrix4) this.type = UNIFORM_TYPE_MATRIX4
        else {
            console.error(data)
            throw `uniform data unknown`
        }
    }

    constructor(data) {
        if (data) this.data = data
    }
}
