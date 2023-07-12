import { Color } from '../../../math/Color.js'
import { Vector3 } from '../../../math/Vector3.js'
import { UboLightsIndex, UboLightsName } from '../constants.js'
import { Light } from './lightsManager/Light.js'
import { PointLights } from './lightsManager/PointLights.js'

class DirectionalLight extends Light {
    direction = new Vector3(1, 1, 1)
}

const color = new Color()

export class LightsManager {
   /** @type {WebGL2RenderingContext} */ #gl

    ambientLight = new Light()

    /** @type {DirectionalLight[]} */
    directionalLights = []

    #uboGlBuffer
    #uboArray

    directionalLightMaxCount
    pointLightMaxCount

    constructor({
        directionalLightMaxCount = 3,
        pointLightMaxCount = 10,
        pointLightFadeTime = 0.2,
    }) {
        this.directionalLightMaxCount = directionalLightMaxCount
        this.pointLightMaxCount = pointLightMaxCount

        this.#uboArray = new Float32Array(4 + 8 * this.directionalLightMaxCount)

        for (let i = 0; i < this.directionalLightMaxCount; i++)
            this.directionalLights.push(new DirectionalLight())

        this.pointLights = new PointLights({
            pointLightMaxCount,
            pointLightFadeTime,
        })

        this.ambientLight.intensity = 0.05
        this.ambientLight.needsUpdate = true
    }

    initGl(gl) {
        this.#gl = gl
        this.#uboGlBuffer = gl.createBuffer()
        this.pointLights.initGl(gl)
        this.#updateUboGlBuffer()
    }

    disposeGl() {
        this.#gl.deleteBuffer(this.#uboGlBuffer)
    }
    dispose() {
        this.disposeGl()
    }

    #needsUboGlBufferUpdate = true
    #updateUboGlBuffer() {
        if (this.#needsUboGlBufferUpdate) {
            this.#needsUboGlBufferUpdate = false
            this.#gl.bindBuffer(this.#gl.UNIFORM_BUFFER, this.#uboGlBuffer)
            this.#gl.bufferData(this.#gl.UNIFORM_BUFFER, this.#uboArray, this.#gl.DYNAMIC_DRAW)
            this.#gl.bindBufferBase(this.#gl.UNIFORM_BUFFER, UboLightsIndex, this.#uboGlBuffer)
        }
    }



    #updateDirectionalLightsUboArray() {
        for (let i = 0; i < this.directionalLightMaxCount; i++) {
            const light = this.directionalLights[i]

            if (light.needsUpdate) {
                light.needsUpdate = false

                this.#needsUboGlBufferUpdate = true

                light.color.toArray(this.#uboArray, 4 + i * 8)
                this.#uboArray[4 + i * 8 + 3] = light.intensity
                light.direction.toArray(this.#uboArray, 4 + i * 8 + 4)
            }
        }
    }

    #updateAmbientLightsUboArray() {
        if (this.ambientLight.needsUpdate) {
            this.ambientLight.needsUpdate = false
            this.#needsUboGlBufferUpdate = true

            color.copy(this.ambientLight.color)
                .multiplyScalar(this.ambientLight.intensity)
                .toArray(this.#uboArray)

            this.#uboArray[3] = 1
        }
    }

    update(dt) {
        this.#updateAmbientLightsUboArray()
        this.#updateDirectionalLightsUboArray()
        this.#updateUboGlBuffer()
        this.pointLights.update(dt)
    }

    vs_pars() {
        return `${this.pointLights.vs_pars()}`
    }

    vs_main() {
        return `${this.pointLights.vs_main()}`
    }

    /** @param {Object3D} object3D */
    fs_pars(object3D) {
        return `
        struct DirLight {
            vec3 color;
            float intensity;
            vec3 direction;           
        };
        
        layout(std140) uniform ${UboLightsName} {
            vec4 ambient;
            DirLight dirLights[${this.directionalLightMaxCount}];
        };

        void calcDirLights(vec3 v_normal, out vec3 diffuse){
            for (int i = 0; i < ${this.directionalLightMaxCount}; i++) {
                diffuse += dirLights[i].intensity
                    * dirLights[i].color
                    * (dot(v_normal, -dirLights[i].direction) / 2. + .5);
            }
        }

        ${this.pointLights.fs_pars(object3D)}
        `}

    fs_main() {
        return `
        vec3 directionalDiffuse = vec3(0);

        calcDirLights(normal, directionalDiffuse);
        ${this.pointLights.fs_main()}

        vec3 light = ambient.rgb + directionalDiffuse + pointDiffuse + pointSpecular;

        color.rgb = color.rgb * light;

        // color.rgb = pow(color.rgb, vec3(1.0 / 2.2)); // color space ?
        `
    }
}





