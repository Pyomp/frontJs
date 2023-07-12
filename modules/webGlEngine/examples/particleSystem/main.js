import "../../../dom/styles/styles.js"
import { Renderer } from '../../renderer/Renderer.js'
import { OrbitControls } from '../../extras/OrbitControls.js'
import { initCaches, initServiceWorker } from "../../../dom/serviceWorkerInstall.js"

import { Vector3 } from "../../../math/Vector3.js"
import { FPSView } from "../../debug/components/FPSView.js"
import { ExampleParticleSystemDebugView } from "./debug.js"
import { RafLoop } from "../../extras/RafLoop.js"

await initCaches()
await initServiceWorker()

new FPSView()

const renderer = new Renderer({
    draw: { particlesEnabled: true },
    particles: { count: 50_000, frequency: 20 }
})

document.body.appendChild(renderer.canvas)
renderer.canvas.style.width = '100%'
renderer.canvas.style.height = '100%'

const debugView = new ExampleParticleSystemDebugView(renderer)

renderer.camera.position.set(60, 60, 60)

const orbitControls = new OrbitControls(
    renderer.camera,
    renderer.canvas
)

// const gltfNode = (await new GlbLoader().load(new URL('./cube.glb', import.meta.url)))['Cube']
// new StaticGltfNode({ gltfNode })

const loop = new RafLoop(tick)
function tick(now) {
    orbitControls.update()
    renderer.draw(loop.dtS)
}

const _vector3 = new Vector3()

function sendParticle() {
    const particleParams = [
        0, 0, 0,
        0, 0, 0,
        1,
        -1, 10,
        0, 0, 0, 1, 1, 5,
        10, 1, 0, 0, 0, 0
    ]

    _vector3
        .randomDirection()
        .multiplyScalar(Math.random() * 5)
        .toArray(particleParams)

    _vector3
        .randomDirection()
        .multiplyScalar(Math.random() * 50)
        .toArray(particleParams, 3)

    renderer.particleManager.setParticle(particleParams)
}

function update() {
    for (let i = 0; i < particleEveryRaf; i++)
        sendParticle()
    requestAnimationFrame(update)
}
requestAnimationFrame(update)

let particleEveryRaf = 50
const particleEveryRafDiv = document.createElement('div')
particleEveryRafDiv.innerHTML = `particle every raf: ${particleEveryRaf}`

addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp') particleEveryRaf++
    else if (event.code === 'ArrowDown') particleEveryRaf--
    particleEveryRafDiv.innerHTML = `particle every raf: ${particleEveryRaf}`
})

debugView.element.appendChild(particleEveryRafDiv)
