import { Vector3 } from '../../../../math/Vector3.js'
import { UboPointLightsIndex, UboPointLightsName } from '../../constants.js'
import { Light } from './Light.js'

export class PointLight extends Light {
    /** @type {Vector3} */
    position = new Vector3()

    #transitionFade = 1
    /** used in internal renderer */
    get transitionFade() { return this.#transitionFade }
    set transitionFade(value) { this.#transitionFade = value; this.needsUpdate = true }
    /** used in internal renderer */
    distanceToCameraSq = Infinity
}

export class PointLights {
   /** @type {WebGL2RenderingContext} */ #gl

    /** @type {PointLight[]} */
    #pointLights
    /** @type {PointLight[]} */
    #newPointLights

    #uboGlBuffer
    #uboArray

    #velocityFade

    pointLightMaxCount

    constructor({
        pointLightMaxCount = 10,
        pointLightFadeTime = 0.2
    }) {
        this.pointLightMaxCount = pointLightMaxCount
        this.#velocityFade = 1 / pointLightFadeTime

        this.#uboArray = new Float32Array(8 * this.pointLightMaxCount)


        this.#pointLights = new Array(this.pointLightMaxCount)
        this.#pointLights.fill(new PointLight())
        this.#newPointLights = new Array(this.pointLightMaxCount)
    }

    initGl(gl) {
        this.#gl = gl
        this.#uboGlBuffer = gl.createBuffer()
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
            this.#gl.bindBufferBase(this.#gl.UNIFORM_BUFFER, UboPointLightsIndex, this.#uboGlBuffer)
        }
    }

    #getLight(index, dt) {
        const pointLight = this.#pointLights[index]
        const newPointLight = this.#newPointLights[index]

        if (pointLight === newPointLight) return pointLight

        if (pointLight && pointLight.transitionFade > 0.01) {

            pointLight.transitionFade -= this.#velocityFade * dt
            if (pointLight.transitionFade < 0) pointLight.transitionFade = 0
            return this.#pointLights[index]

        } else {

            if (!newPointLight) {
                this.#pointLights[index] = null
                return null
            }

            if (newPointLight.transitionFade < 1) {
                newPointLight.transitionFade += this.#velocityFade * dt
                if (newPointLight.transitionFade > 1) {
                    newPointLight.transitionFade = 1
                    this.#pointLights[index] = newPointLight
                }
            }

            return newPointLight
        }
    }

    #updatePointLightsUboArray(dt) {
        for (let i = 0; i < this.pointLightMaxCount; i++) {
            const light = this.#getLight(i, dt)
            if (light) {
                // if (light.needsUpdate) {
                //     light.needsUpdate = false

                this.#needsUboGlBufferUpdate = true

                if (light.visible === 1) {
                    light.position.toArray(this.#uboArray, i * 8)
                    this.#uboArray[i * 8 + 3] = 1
                    light.color.toArray(this.#uboArray, i * 8 + 4)
                    this.#uboArray[i * 8 + 7] = light.intensity * light.transitionFade
                } else {
                    this.#uboArray[i * 8 + 3] = 0
                }
                // }
            } else {
                this.#uboArray[i * 8 + 3] = 0
            }
        }
    }

    /** @param {PointLight} pointLight */
    #addToNewPointLights(pointLight) {
        for (let i = 0; i < this.pointLightMaxCount; i++) {
            if (!this.#newPointLights[i]) {
                this.#newPointLights[i] = pointLight
                break
            }
        }
    }

    /** @param {PointLight[]} pointLights */
    updatePointLights(pointLights) {
        this.#pointLights = this.#newPointLights
        this.#newPointLights.fill(null)

        const newPointLights = pointLights.slice(0, this.pointLightMaxCount)

        for (let i = 0; i < this.pointLightMaxCount; i++) {
            const pointLight = this.#pointLights[i]
            const index = newPointLights.indexOf(pointLight)
            if (index !== -1) {
                this.#newPointLights[index] = newPointLights[index]
                newPointLights[index] = null
            }
        }

        for (let i = 0; i < newPointLights.length; i++) {
            const newPointLight = newPointLights[i]
            if (newPointLight) {
                this.#addToNewPointLights(newPointLight)
            }
        }
    }

    update(dt) {
        this.#updatePointLightsUboArray(dt)
        this.#updateUboGlBuffer()
    }

    /** @returns {PointLight | undefined} */
    getPointLight() {
        for (let i = 0; i < this.pointLightMaxCount; i++) {
            if (this.#pointLights[i].visible === 0) {
                this.#pointLights[i].visible = 1
                return this.#pointLights[i]
            }
        }
    }

    getInfo() {
        const currentLights = []
        for (let i = 0; i < this.pointLightMaxCount; i++) {
            currentLights.push(this.#getLight(i, 0))
        }
        return {
            currentLights,
            uboArray: Array.from(this.#uboArray)
        }
    }

    vs_pars() {
        return `
        out vec3 v_surfaceToView;
        out vec4 v_worldPosition;
    `}

    vs_main() {
        return `
        v_surfaceToView = vec3( u_cameraPosition ) - v_worldPosition.xyz;
    `}

    /** @param {Object3D} object */
    fs_pars(object) {
        return `
        struct PointLight {
            vec3 position;
            float visible;
            vec3 diffuse;
            float intensity;
        };
        
        layout(std140) uniform ${UboPointLightsName} {
            PointLight pointLights[${this.pointLightMaxCount}];
        };
        
        in vec3 v_surfaceToView;
        in vec4 v_worldPosition;
        
        ${object.material.shininess ? 'uniform float u_shininess;' : ''}

        void calcPointLights(vec3 normal, out vec3 diffuse, out vec3 specular){
                
            vec3 surfaceToViewDirection = normalize(v_surfaceToView); // specular

            for (int i = 0; i < ${this.pointLightMaxCount}; i++) {

                if (pointLights[i].visible > 0.5) {
                            
                    vec3 surfaceToPointLight = pointLights[i].position - v_worldPosition.xyz;
        
                    float surfaceToPointLight_length = length(surfaceToPointLight);

                    // TODO skip if light too far
        
                    vec3 surfaceToPointLight_normalized = surfaceToPointLight / surfaceToPointLight_length;
        
                    float lightAttenuation = 1. / (surfaceToPointLight_length * surfaceToPointLight_length);

                    // diffuse
                    float light = max(dot(normal, surfaceToPointLight_normalized), 0.0);
                    diffuse += pointLights[i].intensity * pointLights[i].diffuse * light * lightAttenuation;
                    // diffuse *= 0.;

                    // specular
                    ${object.material.shininess ? `
                    vec3 halfVector = normalize(surfaceToPointLight_normalized + surfaceToViewDirection);
                    specular += pointLights[i].intensity * pointLights[i].diffuse * pow( max( dot(normal, halfVector), 0.0), u_shininess) * lightAttenuation;
                    `: ''}

                    // specular *= 0.;
                }
            }
        }
        `}

    fs_main() {
        return `
        vec3 pointDiffuse;
        vec3 pointSpecular;
        calcPointLights(normal, pointDiffuse, pointSpecular);
        `
    }
}





