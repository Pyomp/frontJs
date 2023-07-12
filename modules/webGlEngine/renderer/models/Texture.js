import { Uniform } from "./Uniform.js"

let id = 0
export class Texture {
    id = id++

    needsMipmap = false

    #minFilter
    set minFilter(value) {
        this.#minFilter = value

        this.needsMipmap = [
            'NEAREST_MIPMAP_NEAREST',
            'LINEAR_MIPMAP_NEAREST',
            'NEAREST_MIPMAP_LINEAR',
            'LINEAR_MIPMAP_LINEAR'
        ].includes(value)
    }
    get minFilter() { return this.#minFilter }

    target
    level
    internalformat
    width
    height
    border
    format
    type

    autoDataUpdate = false
    needsDataUpdate = false
    needsParametersUpdate = true

    /**
     * 
     * @param {{
     *      data?: any
     *      wrapS?: "CLAMP_TO_EDGE" | "REPEAT" | "MIRRORED_REPEAT",
     *      wrapT?: 'CLAMP_TO_EDGE' | 'REPEAT' | 'MIRRORED_REPEAT',
     *      minFilter?: 'LINEAR' | 'NEAREST' | 'NEAREST_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR' | 'LINEAR_MIPMAP_LINEAR',
     *      magFilter?: 'LINEAR' | 'NEAREST',
     *      target?: 'TEXTURE_2D' | 'TEXTURE_CUBE_MAP_POSITIVE_X' | 'TEXTURE_CUBE_MAP_NEGATIVE_X' | 'TEXTURE_CUBE_MAP_POSITIVE_Y' | 'TEXTURE_CUBE_MAP_NEGATIVE_Y' | 'TEXTURE_CUBE_MAP_POSITIVE_Z' | 'TEXTURE_CUBE_MAP_NEGATIVE_Z' ,
     *      level?: number
     *      width?: number
     *      height?: number
     *      border?: number
     *      internalformat?: 'DEPTH_COMPONENT24'|'DEPTH_COMPONENT16'|'ALPHA'| 'RGB'|'RGBA'|'LUMINANCE'|'LUMINANCE_ALPHA'|'DEPTH_COMPONENT' |'DEPTH_STENCIL' |'R8'|'R16F'|'R32F'|'R8UI'|'RG8'|'RG16F'|'RG32F'|'RG8UI'|'RG16UI'|'RG32UI'|'RGB8'|'SRGB8'|'RGB565'|'R11F_G11F_B10F'|'RGB9_E5'|'RGB16F'|'RGB32F'|'RGB8UI'|'RGBA8'|'SRGB8_APLHA8'|'RGB5_A1'|'RGB10_A2'|'RGBA4'|'RGBA16F'|'RGBA32F'|'RGBA8UI',
     *      format?: 'DEPTH_COMPONENT'|'RGB' | 'RGBA' | 'LUMINANCE_ALPHA' | 'LUMINANCE' | 'ALPHA' | 'RED' | 'RED_INTEGER' | 'RG' | 'RG_INTEGER' | 'RGB_INTEGER' | 'RGBA_INTEGER',
     *      type?: 'UNSIGNED_INT'|'UNSIGNED_SHORT'|'UNSIGNED_BYTE' | 'UNSIGNED_SHORT_5_6_5' | 'UNSIGNED_SHORT_4_4_4_4' | 'UNSIGNED_SHORT_5_5_5_1' | 'HALF_FLOAT' | 'FLOAT' | 'UNSIGNED_INT_10F_11F_11F_REV' | 'HALF_FLOAT' | 'UNSIGNED_INT_2_10_10_10_REV',
     *      scale?: Vector2
     *      autoDataUpdate?: boolean
     * }} params
     */
    constructor({
        data = new Image(),

        wrapS = 'CLAMP_TO_EDGE',
        wrapT = 'CLAMP_TO_EDGE',

        minFilter = 'LINEAR',
        magFilter = 'LINEAR',

        target = 'TEXTURE_2D',
        level = 0,
        internalformat = 'RGBA',
        width = 0,
        height = 0,
        border = 0,
        format = 'RGBA',
        type = 'UNSIGNED_BYTE',

        scale,
        autoDataUpdate = false,
    }) {


        this.data = data

        this.scale = scale

        this.wrapS = wrapS
        this.wrapT = wrapT
        this.minFilter = minFilter
        this.magFilter = magFilter

        this.target = target
        this.level = level
        this.internalformat = internalformat
        this.width = width
        this.height = height
        this.border = border
        this.format = format
        this.type = type

        this.autoDataUpdate = autoDataUpdate

        if (data?.constructor === HTMLImageElement) {
            data.onload = () => {
                this.width = data.width
                this.height = data.height
                this.needsDataUpdate = true
            }
        } else {
            this.needsDataUpdate = true
        }
    }

    /** NEEDS gl.bindTexture !!!
     * @param {WebGL2RenderingContext} gl */
    updateTextureParameters(gl) {
        gl.texParameteri(gl[this.target], gl.TEXTURE_WRAP_S, gl[this.wrapS])
        gl.texParameteri(gl[this.target], gl.TEXTURE_WRAP_T, gl[this.wrapT])
        gl.texParameteri(gl[this.target], gl.TEXTURE_MIN_FILTER, gl[this.minFilter])
        gl.texParameteri(gl[this.target], gl.TEXTURE_MAG_FILTER, gl[this.magFilter])
        this.needsParametersUpdate = false
    }

    /** NEEDS gl.bindTexture !!!
     * @param {WebGL2RenderingContext} gl */
    updateTextureData(gl) {
        gl.texImage2D(
            gl[this.target],
            this.level,
            gl[this.internalformat],
            this.width,
            this.height,
            this.border,
            gl[this.format],
            gl[this.type],
            this.data
        )

        if (this.needsMipmap)
            gl.generateMipmap(gl[this.target])

        this.needsDataUpdate = false
    }

    onDispose = new Set()
    dispose() {
        for (const callback of this.onDispose) callback()
    }
}







