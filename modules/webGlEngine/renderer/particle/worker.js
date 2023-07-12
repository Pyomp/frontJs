import { ParticleSystem } from "./ParticleSystem.js"

onmessage = (event) => {
    const system = new ParticleSystem({
        deltaTimeSecond: event.data.deltaTimeSecond,
        data: new Float32Array(event.data.data),
        velocity: new Float32Array(event.data.velocity),
        position: new Float32Array(event.data.position),
        color: new Float32Array(event.data.color)
    })

    onmessage = event => { system.setParticle(new Float32Array(event.data)) }
}
