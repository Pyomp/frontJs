import { AnimationSystem } from "../renderer/animation/AnimationSystem.js"
import { Shader } from "../renderer/models/Shader.js"
import { CameraRenderer } from "../renderer/modules/Camera.js"

export const basicShader = new Shader({
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

        ${a.a_uv && t.u_map ? `v_uv = a_uv;` : ''}
        ${a.a_vertexColor ? `v_vertexColor = a_vertexColor;` : ''}

        vec4 position = vec4(a_position, 1.0);

        vec4 v_worldPosition = u_worldMatrix * ${a.a_weights ? 'skinMatrix * ' : ''} position;

        gl_Position = u_projectionViewMatrix * v_worldPosition;
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

    ${t.u_map ? `uniform sampler2D u_map;` : ''}

    ${a.a_vertexColor ? `in vec4 v_vertexColor;` : ''}

    ${a.a_uv && t.u_map ? `in vec2 v_uv;` : ''}
    ${t.u_map?.scale ? `uniform vec2 u_mapScale;` : ''}

    ${u.u_color ? `uniform vec4 u_color;` : ''}

    out vec4 color;

    void main() {
        ${a.a_uv && t.u_map ? `color = texture(u_map, v_uv ${t.u_map.scale ? '* u_mapScale' : ''});` : 'color = vec4(1.0);'}

        ${u.u_color ? `color *= u_color;` : ''}

        ${a.a_vertexColor ? `color *= v_vertexColor;` : ''}

        ${m.alphaTest ? `if(color.a < 0.5) discard;` : ''}
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
        ((a.a_uv ? 1 : 0) << 1) +
        ((a.a_vertexColor ? 1 : 0) << 2) +

        ((t.u_map ? 1 : 0) << 3) +
        ((t.u_map?.scale ? 1 : 0) << 4) +

        ((a.a_weights ? 1 : 0) << 5) +
        ((m.shininess ? 1 : 0) << 6) +
        ((m.alphaTest ? 1 : 0) << 7)
}

