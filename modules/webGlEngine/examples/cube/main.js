import { GlbLoader } from '../../gltf/GlbLoader.js'
import { StaticGltfNode } from '../../nodes/StaticGltfNode.js'
import { Renderer } from '../../renderer/Renderer.js'
import { OrbitControls } from '../../extras/OrbitControls.js'
import { RafLoop } from '../../extras/RafLoop.js'

const renderer = new Renderer()
document.body.appendChild(renderer.canvas)
renderer.canvas.style.width = '100%'
renderer.canvas.style.height = '100%'

const orbitControls = new OrbitControls(
    renderer.camera,
    renderer.canvas
)

const gltfNode = (await new GlbLoader().load(new URL('./cube.glb', import.meta.url)))['Cube']
new StaticGltfNode({ gltfNode, parent: renderer.scene })

const loop = new RafLoop(tick)

function tick() {
    orbitControls.update()
    renderer.draw(loop.dtS)
}
