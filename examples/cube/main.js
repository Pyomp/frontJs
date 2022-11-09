import { LoopRaf } from '../../models/LoopRaf.js'
import { GlbLoader } from '../../webGlEngine/gltfLoader/GlbLoader.js'
import { StaticGltfNode } from '../../webGlEngine/nodes/StaticGltfNode.js'
import { Renderer } from '../../webGlEngine/renderer/Renderer.js'
import { OrbitControls } from '../../webGlEngine/utils/OrbitControls.js'

const renderer = new Renderer()
document.body.appendChild(renderer.canvas)
renderer.canvas.style.width = '100%'
renderer.canvas.style.height = '100%'

const loop = new LoopRaf(renderer.draw.bind(renderer))

const orbitControls = new OrbitControls(
    renderer.camera,
    renderer.canvas,
    renderer.onBeforeRender
)

const gltfNode = (await new GlbLoader().load(new URL('./cube.glb', import.meta.url)))['Cube']
const node = new StaticGltfNode(gltfNode, renderer.scene)
