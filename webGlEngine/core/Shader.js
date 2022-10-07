import { Camera } from '../renderer/modules/Camera.js'
import { Skin } from '../renderer/skinning/Skin.js'

/**
 * @param {Object3D} object 
 * @param {Renderer} renderer 
 */
export const vertexShaderDefault = (object, renderer) => {

    const m = object.material
    const a = object.geometry.attributes
    const u = object.uniforms
    const t = object.textures
    
    return `#version 300 es
    ${Camera.vs_pars()}

    ${a.a_position ? 'in vec3 a_position;' : ''}
    ${a.a_normal ? `
        in vec3 a_normal;
        out vec3 v_normal;
        uniform mat3 u_normalMatrix;
       ${renderer.lights.vs_pars()}
        ` : ''}

    ${u.u_normalMap ? 'uniform sampler2D u_normalMap;' : ''}

    ${a.a_uv && t.u_map  ? `
        in vec2 a_uv;
        out vec2 v_uv;`
            : ''
        }

    ${a.a_vertexColor ? `
        in vec4 a_vertexColor;
        out vec4 v_vertexColor;
    ` : ''}

    ${a.a_weights ? Skin.vs_pars() : ''}

    uniform mat4 u_worldMatrix;

    void main() {

        ${a.a_weights ? Skin.vs_main() : ''}

        ${a.a_normal ? `v_normal = u_normalMatrix * a_normal;` : ''}
        ${a.a_uv && t.u_map  ? `v_uv = a_uv;` : ''}
        ${a.a_vertexColor ? `v_vertexColor = a_vertexColor;` : ''}

        vec4 position = ${a.a_position ? 'vec4(a_position, 1.0)' : 'vec4(0.0, 0.0, 0.0, 1.0)'};

        ${a.a_normal ? `` : `vec4`} v_worldPosition = u_worldMatrix * ${a.a_weights ? 'skinMatrix * ' : ''} position;

        // vec4 viewSpace = u_viewMatrix * v_worldPosition;
        // viewSpace.z = -15.;
        // gl_Position = u_projectionMatrix * viewSpace;

        gl_Position = u_projectionViewMatrix * v_worldPosition;
  
        ${a.a_normal ? renderer.lights.vs_main() : ''}
    }
`}

/**
 * @param {Object3D} object 
 * @param {Renderer} renderer 
 */
export const fragmentShaderDefault = (object, renderer) => {

    const m = object.material
    const a = object.geometry.attributes
    const u = object.uniforms
    const t = object.textures

    return `#version 300 es
    precision highp float;
    precision highp int;

    ${a.a_normal ? `
        in vec3 v_normal;
        uniform mat3 u_normalMatrix;
        ${renderer.lights.fs_pars(object)}
    ` : ''}

    ${t.u_map ? 'uniform sampler2D u_map;' : ''}
    ${t.u_normalMap ? `uniform sampler2D u_normalMap;` : ''}

    ${a.a_vertexColor ? `in vec4 v_vertexColor;` : ''}

    ${a.a_uv && t.u_map  ? `in vec2 v_uv;` : ''}

    out vec4 color;

    void main() {       

        ${a.a_normal ? `vec3 normal = normalize(v_normal);` : ''}

        ${t.u_normalMap ? `
            // TODO
        ` : ''}        

        ${a.a_uv && t.u_map ? `color = texture(u_map, v_uv);` : 'color = vec4(1.0);'}

        ${a.a_vertexColor ? `color *= v_vertexColor;` : ''}
    
        ${a.a_normal ? renderer.lights.fs_main() : ''}
    }
    `
}
// ${a.a_normal ? 'color.xyz = normal.xyz;' : ''}
const configIdDefault = (object) => {
    const m = object.material
    const a = object.geometry.attributes
    const u = object.uniforms
    const t = object.textures

    return (a.a_position ? 1 : 0) +
        (a.a_normal ? 1 : 0) << 1 +
        (a.a_uv ? 1 : 0) << 2 +

        (t.u_map ? 1 : 0) << 3 +
        (t.u_normalMap ? 1 : 0) << 4 +

        (a.a_weight ? 1 : 0) << 6 +
        (m.shininess ? 1 : 0) << 7
}

export class Shader {
    /**
     * @param {(object: Object3D, renderer?: Renderer) => string } getVertexShader the return should be a valid glsl vertex shader code
     * @param {(object: Object3D, renderer?: Renderer) => string } getFragmentShader the return should be a valid glsl fragment shader code
     * @param {(object: Object3D) => number | string } getConfigId same config ID will re-use webgl program
     */
    constructor(
        getVertexShader,
        getFragmentShader,
        getConfigId = () => 0
    ) {
        this.getVertexShader = getVertexShader
        this.getFragmentShader = getFragmentShader
        this.getConfigId = getConfigId
    }
}

/**
 * @param {Object3D} object 
 * @param {*} shaderNodes 
 */
const debugVertexShader = (object, shaderNodes) => {
    return `#version 300 es
      
            ${Camera.vs_pars()}
            in vec3 a_position;
            in vec3 a_normal;
            out vec3 v_normal;
            in vec2 a_uv;
            out vec2 v_uv; 

            ${shaderNodes.lights.vs_pars(object)}
            
            void main(){
                gl_Position = u_projectionViewMatrix * vec4(a_position, 1.0);
                ${shaderNodes.lights.vs_main(object)}
            }
        `
}

const debugFragmentShader = () => {
    return `#version 300 es
            precision highp float;
            precision highp int;

            out vec4 color;
            void main(){
                color = vec4(1.0);
            }
        `
}

export const defaultShader = new Shader(
    vertexShaderDefault,
    fragmentShaderDefault,
    configIdDefault
)

let debugShaderId = 0
export const debugShader = new Shader(
    debugVertexShader,
    debugFragmentShader,
    () => debugShaderId++
)

