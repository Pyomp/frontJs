let id = 0
export class Shader {
    id = id++

    /**
     * @param {{
     *      getVertexShader: (object: Object3D, renderer?: Renderer) => string 
     *      getFragmentShader: (object: Object3D, renderer?: Renderer) => string 
     *      getConfigId?: (object: Object3D) => number | string 
     *      useUboUtils?: boolean
     * }} params
     */
    constructor({
        getVertexShader,
        getFragmentShader,
        getConfigId = () => 0,
        useUboUtils = false,
    }) {
        this.getVertexShader = getVertexShader
        this.getFragmentShader = getFragmentShader
        this.getConfigId = getConfigId
        this.useUboUtils = useUboUtils
    }
}

