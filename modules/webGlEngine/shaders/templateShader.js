import { Shader } from "../renderer/models/Shader.js"
import { CameraRenderer } from "../renderer/modules/Camera.js"

export const templateShader = new Shader({
    getVertexShader,
    getFragmentShader,
    getConfigId,
})

/**
 * @param {Object3D} object 
 * @param {Renderer} renderer
 */
function getVertexShader(object, renderer) {

    const m = object.material
    const a = object.geometry.attributes
    const u = object.uniforms
    const t = object.textures

    return `#version 300 es
      
            ${CameraRenderer.vs_pars()}
            in vec3 a_position;
            in vec3 a_normal;
            out vec3 v_normal;
            in vec2 a_uv;
            out vec2 v_uv; 
            
            void main(){
                gl_Position = u_projectionViewMatrix * vec4(a_position, 1.0);
            }
        `
}

/**
 * @param {Object3D} object 
 * @param {Renderer} renderer
 */
function getFragmentShader(object, renderer) {

    const m = object.material
    const a = object.geometry.attributes
    const u = object.uniforms
    const t = object.textures

    return `#version 300 es
            precision highp float;
            precision highp int;

            out vec4 color;
            void main(){
                color = vec4(1.0);
            }
        `
}

let debugShaderId = 0
function getConfigId() { return debugShaderId++ }
