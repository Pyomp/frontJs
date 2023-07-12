import { Color } from '../../../math/Color.js'
import { CameraRenderer } from '../../renderer/modules/Camera.js'
import { Attribute } from '../../renderer/models/Attribute.js'
import { Material } from '../../renderer/models/Material.js'
import { Object3D } from '../../renderer/models/Object3D.js'
import { Uniform } from '../../renderer/models/Uniform.js'
import { Texture } from '../../renderer/models/Texture.js'
import { Shader } from '../../renderer/models/Shader.js'
import { Geometry } from '../../renderer/models/Geometry.js'
import { AdditiveBlending } from '../../renderer/constants.js'
import { Matrix4 } from '../../../math/Matrix4.js'

const vs = `#version 300 es
${CameraRenderer.vs_pars()}

in vec3 a_position;

uniform mat4 u_worldMatrix;

void main(){

    gl_Position = u_projectionViewMatrix * u_worldMatrix * vec4(a_position, 1.0);
    gl_PointSize = 300. / gl_Position.z;
}
`
const fs = `#version 300 es
precision highp float;
precision highp int;

uniform vec3 u_color;
uniform sampler2D u_map;

out vec4 color;

void main(){

    color = texture(u_map, gl_PointCoord.xy) * vec4(u_color, 1.0);
    // color = vec4(1.0, 0.0, 0.0, 1.0);
    // color.rgb *= color.a;
    // if(color.a < 0.1) discard;
    // color.a = 0.3;
}
`

let map
function assetInit() {
    map = new Texture({})
    map.data.src = new URL('./spark.svg', import.meta.url).href
}

const shader = new Shader({ getVertexShader: () => vs, getFragmentShader: () => fs })
const material = new Material({
    blending: AdditiveBlending,
    depthTest: true,
    depthWrite: false,
})

export class Points extends Object3D {
    static assetInit = assetInit
    static map

    constructor(count) {

        if (!map) throw new Error('Points is not initialized "await Points.init()"')

        const positions = new Float32Array(3 * count)
        const color = new Color(1, 1, 1)
        super({
            shader: shader,
            material: material,
            geometry: new Geometry([
                new Attribute('a_position', positions, "VEC3", "DYNAMIC_DRAW")
            ]),
            uniforms: {
                u_color: new Uniform(color),
                u_worldMatrix: new Uniform()
            },
            textures: {
                u_map: map
            },
            count,
        })

        this.positions = positions
        this.color = color
    }

    init(node) {
        this.uniforms['u_worldMatrix'] = new Uniform(node.worldMatrix)
    }

    /** @param {WebGLRenderingContext} gl */
    draw(gl) {
        this.vao.attributesUpdate('a_position')
        gl.drawArrays(gl.POINTS, 0, this.count)
    }
}

