import { CameraRenderer } from '../../renderer/modules/Camera.js'
import { Object3D } from '../../renderer/models/Object3D.js'
import { Geometry } from '../../renderer/models/Geometry.js'
import { Shader } from '../../renderer/models/Shader.js'

const shader = new Shader({
    getVertexShader: (object3D, renderer) => `#version 300 es

    ${CameraRenderer.vs_pars()}
    ${renderer.lightsManager.vs_pars()}

    in vec3 a_position;
    in vec3 a_normal;
    in vec2 a_uv;

    uniform mat4 u_worldMatrix;

    out vec3 v_normal;
    out vec2 v_uv;

    void main(){

        // v_normal = u_normalMatrix * a_normal;
        v_normal = a_normal;
        v_uv = a_uv;

        v_worldPosition = vec4(a_position, 1.0);

        gl_Position = u_projectionViewMatrix * v_worldPosition;

        ${renderer.lightsManager.vs_main()}
    }
    `,
    getFragmentShader: (object3D, renderer) => `#version 300 es
    precision highp float;
    precision highp int;

    in vec2 v_uv;

    uniform sampler2D u_mapColor;

    uniform sampler2D u_map1;
    uniform vec2 u_map1Scale;

    uniform sampler2D u_map2;
    uniform vec2 u_map2Scale;

    uniform sampler2D u_map3;
    uniform vec2 u_map3Scale;

    uniform sampler2D u_mapSplatting;

    in vec3 v_normal;

    ${renderer.lightsManager.fs_pars(object3D)}

    out vec4 color;

    void main(){

        vec3 splatting = texture(u_mapSplatting, v_uv).rgb;

        color = texture(u_map1, v_uv * u_map1Scale) * splatting.r + 
                texture(u_map2, v_uv * u_map2Scale) * splatting.g + 
                texture(u_map3, v_uv * u_map3Scale) * splatting.b;
                    
        color.a = 1.0;
        
        // color = mix(color, texture(u_mapColor, v_uv).rgb, 0.5);

        vec3 normal = normalize(v_normal);

        ${renderer.lightsManager.fs_main()}
        // color = vec4(1.0, 0.0, 0.0, 1.0);
    }
    `
})

export class SplattingMesh extends Object3D {
    constructor(
        gltfPrimitive,
        splattingTexture,
        map1, map2, map3) {

        const geometry = Geometry.getFromGltfPrimitive(gltfPrimitive)
        const count = geometry.indices.length

        super({
            shader: shader,
            geometry: geometry,
            uniforms: {},
            textures: {
                u_map1: map1,
                u_map2: map2,
                u_map3: map3,
                u_mapSplatting: splattingTexture
            },
            count: count
        })
    }

    draw(gl) {
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0)
    }
}

