import { Matrix3 } from '../../../math/Matrix3.js'
import { Matrix4 } from '../../../math/Matrix4.js'
import { Object3D } from '../../renderer/models/Object3D.js'
import { Uniform } from '../../renderer/models/Uniform.js'

const _matrix3 = new Matrix3()
const _matrix4 = new Matrix4()

export class Mesh extends Object3D {
    isMesh = true
    constructor({
        name = '',
        geometry,
        material,
        textures = {},
        shader = undefined
    }) {
        const uniforms = {
            u_worldMatrix: new Uniform(_matrix4)
        }
        if (material.shininess) uniforms.u_shininess = new Uniform(material.shininess)
        if (geometry.attributes.a_normal) uniforms.u_normalMatrix = new Uniform(_matrix3)

        super({
            name,
            geometry,
            material,
            textures,
            uniforms,
            count: geometry.indices.length,
            shader,
        })
    }

    draw(gl) {
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0)
    }
}

