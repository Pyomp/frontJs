export class TexturesManager {

    /** @type {WebGL2RenderingContext} */ #gl
    /** @type {Map.<Texture, WebGLTexture>} */
    #glTextures = new Map()

    initGl(gl) {
        this.#gl = gl
        // const ext = gl.getExtension('WEBGL_depth_texture')
        // if (ext) {
        //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, 512, 512, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null)
        // }       

    }

    disposeGl() {
        for (const [textureName, glTexture] of this.#glTextures) {
            this.#gl.deleteTexture(glTexture)
        }
        this.#glTextures.clear()
    }

    dispose() {
        this.disposeGl()
    }

    /**
     * @param {Program} program 
     * @param {{ [name: string]: Texture }} textures 
     */
    updateObjectTextures(program, textures) {
        for (const textureName in textures) {
            const texture = textures[textureName]

            const glTexture = this.getGlTexture(texture)

            this.#gl.activeTexture(program.textureUnits[textureName])
            this.#gl.bindTexture(this.#gl[texture.target], glTexture)

            if (texture.needsParametersUpdate) {
                texture.updateTextureParameters(this.#gl)
            }

            if (texture.needsDataUpdate || texture.autoDataUpdate) {
                texture.updateTextureData(this.#gl)
            }
        }
    }

    /** @param {Texture} texture */
    getGlTexture(texture) {
        if (this.#glTextures.has(texture)) {
            return this.#glTextures.get(texture)
        } else {
            const glTexture = this.#gl.createTexture()
            this.#glTextures.set(texture, glTexture)
            texture.onDispose.add(() => {
                this.#gl.deleteTexture(glTexture)
                this.#glTextures.delete(texture)
            })
            return glTexture
        }
    }
}
