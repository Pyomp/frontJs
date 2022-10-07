import { Vector3 } from '../../../math/Vector3.js'
import { UboLightsIndex, UboLightsName } from '../constants.js'
import { Light } from './Light.js'
import { PointLights } from './PointLights.js'


class DirectionalLight extends Light {
    direction = new Proxy(new Vector3(1, 1, 1), this.proxyHandler)
}

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

                if (light.visible === 1) {
                    light.direction.toArray(this.#uboArray, 4 + i * 8)
                    this.#uboArray[4 + i * 8 + 3] = 1
                    light.color.toArray(this.#uboArray, 4 + i * 8 + 4)
                    this.#uboArray[4 + i * 8 + 7] = light.intensity
                } else {
                    this.#uboArray[4 + i * 8 + 3] = 0
                }
            }
        }
    }

    #updateAmbientLightsUboArray() {
        if (this.ambientLight.needsUpdate) {
            this.ambientLight.needsUpdate = false
            this.ambientLight.color.toArray(this.#uboArray)
            this.#uboArray[3] = this.ambientLight.intensity
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
            vec3 direction;
            float visible;
            vec3 diffuse;
            float intensity;
        };
        
        layout(std140) uniform ${UboLightsName} {
            vec4 ambient;
            DirLight dirLights[${this.directionalLightMaxCount
            }];
        };

        void calcDirLights(vec3 v_normal, out vec3 diffuse){
            for (int i = 0; i < ${this.directionalLightMaxCount}; i++) {
                if (dirLights[i].visible > 0.5) {
                    diffuse += dirLights[i].intensity * dirLights[i].diffuse * (dot(v_normal, dirLights[i].direction) / 2. + .5);
                }
            }
        }

        ${this.pointLights.fs_pars(object3D)}
        `}

    fs_main() {
        return `
        vec3 diffuse;
        vec3 specular;

        calcDirLights(normal, diffuse);
        ${this.pointLights.fs_main()}

        color.rgb = (color.rgb * 0.9 + 0.1) * (diffuse + specular);
        
        // color.rgb = pow(color.rgb, vec3(1.0 / 2.2)); // color space ?
        `
    }
}





