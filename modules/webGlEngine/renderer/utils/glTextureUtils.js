export const glTextureUtils = {
    /**
     * @param {{
     *      gl: WebGL2RenderingContext
     *      glTexture: WebGLTexture
     *      target?: WebGl.Texture.Target
     *      wrapS?: WebGl.Texture.Wrap
     *      wrapT?: WebGl.Texture.Wrap
     *      minFilter?: WebGl.Texture.MinFilter
     *      magFilter?: WebGl.Texture.MagFilter
     * }} param0 
     */
    updateParameters({
        gl,
        glTexture,
        target = 'TEXTURE_2D',
        wrapS = 'CLAMP_TO_EDGE',
        wrapT = 'CLAMP_TO_EDGE',
        minFilter = 'LINEAR',
        magFilter = 'LINEAR',
    }) {
        gl.bindTexture(gl[target], glTexture)
        gl.texParameteri(gl[target], gl.TEXTURE_WRAP_S, gl[wrapS])
        gl.texParameteri(gl[target], gl.TEXTURE_WRAP_T, gl[wrapT])
        gl.texParameteri(gl[target], gl.TEXTURE_MIN_FILTER, gl[minFilter])
        gl.texParameteri(gl[target], gl.TEXTURE_MAG_FILTER, gl[magFilter])
    },

    /**
     * @param {{
     *      gl: WebGL2RenderingContext
     *      glTexture: WebGLTexture
     *      target?: WebGl.Texture.Target
     *      level?: GLint
     *      internalformat?: WebGl.Texture.InternalFormat
     *      width?: GLsizei
     *      height?: GLsizei
     *      border?: GLint
     *      format?: WebGl.Texture.Format
     *      type?: WebGl.Texture.Type
     *      data: any
     *      needsMipmap?: boolean
     * }} param0 
    */
    updateData({
        gl,
        glTexture,
        target = 'TEXTURE_2D',
        level = 0,
        internalformat = 'RGBA',
        width,
        height,
        border = 0,
        format = 'RGBA',
        type = 'UNSIGNED_BYTE',
        data,
        needsMipmap = false }) {
        gl.bindTexture(gl[target], glTexture)

        gl.texImage2D(
            gl[target],
            level,
            gl[internalformat],
            width ?? data.width,
            height ?? data.height,
            border,
            gl[format],
            gl[type],
            data
        )

        if (needsMipmap) gl.generateMipmap(gl[target])
    },

    /**
     * @param {{
     *      gl: WebGL2RenderingContext
     *      glProgram: WebGLProgram
     *      uniformName: string
     *      textureCount: number
     * }} param0 
    */
    bindUnit({ gl, glProgram, uniformName, textureCount }) {
        const location = gl.getUniformLocation(glProgram, uniformName)
        const textureUnit = gl[`TEXTURE${textureCount}`]
        gl.uniform1i(location, textureCount)
        return textureUnit
    },
    /**
    * @param {{
    *      gl: WebGL2RenderingContext
    *      glTexture: WebGLTexture
    *      unit: number
    * }} param0 
   */
    bindTexture({ gl, glTexture, unit }) {
        gl.activeTexture(unit)
        gl.bindTexture(gl.TEXTURE_2D, glTexture)
    }
}
