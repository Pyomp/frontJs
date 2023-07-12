import { AnimationSystem } from "../renderer/animation/AnimationSystem.js"
import { Shader } from "../renderer/models/Shader.js"
import { CameraRenderer } from "../renderer/modules/Camera.js"

export const phongShader = new Shader({
    getVertexShader,
    getFragmentShader,
    getConfigId
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

    ${a.a_position ? 'in vec3 a_position;' : ''}
    ${a.a_normal ? `
        in vec3 a_normal;
        out vec3 v_normal;
        uniform mat3 u_normalMatrix;
       ${renderer.lightsManager.vs_pars()}
        ` : ''}

    ${u.u_normalMap ? 'uniform sampler2D u_normalMap;' : ''}

    ${a.a_uv && t.u_map ? `
        in vec2 a_uv;
        out vec2 v_uv;`
            : ''
        }

    ${a.a_vertexColor ? `
        in vec4 a_vertexColor;
        out vec4 v_vertexColor;
    ` : ''}

    ${a.a_weights ? AnimationSystem.vs_pars() : ''}

    uniform mat4 u_worldMatrix;

    void main() {
        ${a.a_weights ? AnimationSystem.vs_main() : ''}

        ${a.a_normal ? `v_normal = u_normalMatrix * a_normal;` : ''}
        ${a.a_uv && t.u_map ? `v_uv = a_uv;` : ''}
        ${a.a_vertexColor ? `v_vertexColor = a_vertexColor;` : ''}

        vec4 position = ${a.a_position ? 'vec4(a_position, 1.0)' : 'vec4(0.0, 0.0, 0.0, 1.0)'};

        ${a.a_normal ? `` : `vec4`} v_worldPosition = u_worldMatrix * ${a.a_weights ? 'skinMatrix * ' : ''} position;

        // vec4 viewSpace = u_viewMatrix * v_worldPosition;
        // viewSpace.z = -15.;
        // gl_Position = u_projectionMatrix * viewSpace;

        gl_Position = u_projectionViewMatrix * v_worldPosition;
  
        ${a.a_normal ? renderer.lightsManager.vs_main() : ''}
    }
`}

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

    ${a.a_normal ? `
        in vec3 v_normal;
        ${renderer.lightsManager.fs_pars(object)}
    ` : ''}

    ${t.u_map ? 'uniform sampler2D u_map;' : ''}
    ${t.u_normalMap ? `uniform sampler2D u_normalMap;` : ''}

    ${a.a_vertexColor ? `in vec4 v_vertexColor;` : ''}

    ${a.a_uv && t.u_map ? `in vec2 v_uv;` : ''}
    ${t.u_map?.scale ? `uniform vec2 u_mapScale;` : ''}

    out vec4 color;

    void main() {       

        ${a.a_normal ? `vec3 normal = normalize(v_normal);` : ''}

        ${t.u_normalMap ? `
            // TODO
        ` : ''}        

        ${a.a_uv && t.u_map ? `color = texture(u_map, v_uv ${t.u_map.scale ? '* u_mapScale' : ''});` : 'color = vec4(1.0);'}

        ${a.a_vertexColor ? `color *= v_vertexColor;` : ''}

        ${m.alphaTest ? `if(color.a < 0.5) discard;` : ''}
        
        ${a.a_normal ? renderer.lightsManager.fs_main() : ''}
    }
    `
}

/**
 * @param {Object3D} object 
 */
function getConfigId(object) {
    const m = object.material
    const a = object.geometry.attributes
    const u = object.uniforms
    const t = object.textures

    return (a.a_position ? 1 : 0) +
        ((a.a_normal ? 1 : 0) << 1) +
        ((a.a_uv ? 1 : 0) << 2) +
        ((a.a_vertexColor ? 1 : 0) << 3) +

        ((t.u_map ? 1 : 0) << 4) +
        ((t.u_normalMap ? 1 : 0) << 5) +
        ((t.u_map?.scale ? 1 : 0) << 6) +

        ((a.a_weights ? 1 : 0) << 7) +
        ((m.shininess ? 1 : 0) << 8) +
        ((m.alphaTest ? 1 : 0) << 9)
}
