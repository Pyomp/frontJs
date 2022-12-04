import { Color } from '../../../math/Color.js'
import { Vector3 } from '../../../math/Vector3.js'
import { UboLightsIndex, UboLightsName } from '../constants.js'
import { Light } from './Light.js'
import { PointLights } from './PointLights.js'

class DirectionalLight extends Light {
    direction = new Vector3(1, 1, 1)
}

const color = new Color()

export class Lights {
    #gl

    ambientLight = new Light()

    /** @type {DirectionalLight[]} */
    directionalLights = []

    #uboGlBuffer
    #uboArray

    directionalLightMaxCount
    pointLightMaxCount
    useSpecular

    /**
     * @param {WebGL2RenderingContext} gl
     */
    constructor(gl, {
        directionalLightMaxCount = 3,
        pointLightMaxCount = 10,
        pointLightFadeTime = 0.2,
        useSpecular = true,
    }) {
        this.directionalLightMaxCount = directionalLightMaxCount
        this.pointLightMaxCount = pointLightMaxCount
        this.useSpecular = useSpecular

        this.#uboArray = new Float32Array(4 + 8 * this.directionalLightMaxCount)

        this.#gl = gl
        this.#uboGlBuffer = gl.createBuffer()

        for (let i = 0; i < this.directionalLightMaxCount; i++)
            this.directionalLights.push(new DirectionalLight())

        this.pointLights = new PointLights(gl, {
            pointLightMaxCount,
            pointLightFadeTime,
            useSpecular,
        })

        this.ambientLight.intensity = 0.05
        this.ambientLight.needsUpdate = true

        this.#updateUboGlBuffer()
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

    dispose() {
        this.#gl.deleteBuffer(this.#uboGlBuffer)
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
        vec3 directionalDiffuse;

        calcDirLights(normal, directionalDiffuse);
        ${this.pointLights.fs_main()}

        color.rgb = (color.rgb * 0.9 + 0.1) *  (ambient.rgb + directionalDiffuse + pointDiffuse + pointSpecular);
        
        // color.rgb = pow(color.rgb, vec3(1.0 / 2.2)); // color space ?
        `
    }
}





