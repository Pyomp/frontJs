import { Object3D } from '../../core/Object3D.js'
import { Uniform } from '../../core/Uniform.js'

export class Mesh extends Object3D {
    isMesh = true
    constructor(geometry, material, textures = {}) {
        const uniforms = {
            u_worldMatrix: new Uniform()
        }
        if (material.shininess) uniforms.u_shininess = new Uniform(material.shininess)
        if (geometry.attributes.a_normal) uniforms.u_normalMatrix = new Uniform()

        super({
            geometry: geometry,
            material: material,
            textures: textures,
            uniforms: uniforms,
            count: geometry.indices.length,
        })
    }

    draw(gl) {
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0)
    }
}

