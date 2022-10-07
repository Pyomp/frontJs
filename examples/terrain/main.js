import { Renderer } from '../../webGlEngine/renderer/Renderer.js'
import { OrbitControls } from '../../webGlEngine/utils/OrbitControls.js'
import { SplattingMesh } from '../../webGlEngine/nodes/objects/SplattingMesh.js'
import { LoopRaf } from '../../modules/common/LoopRaf.js'
import { MainDebugView } from '../../webGlEngine/debug/CommonDebugView.js'
import { Terrain3D } from './TerrainNode.js'
import { MoveHelper } from '../../webGlEngine/helpers/MoveHelper.js'

await Terrain3D.init()
function init() {
    const renderer = new Renderer()
    const loop = new LoopRaf(renderer.draw)

    const orbitControls = new OrbitControls(
        renderer.camera,
        renderer.canvas,
        renderer.onBeforeRender
    )

    const container = document.createElement('div')
    { // interface style
        const s = container.style
        s.position = 'fixed'
        s.top = '0'
        s.left = '0'
    }

    const directionalLight = renderer.lights.getDirectionalLight()
    directionalLight.direction.set(1, 1, 1).normalize()
    renderer.lights.needsUpdate = true

    document.body.appendChild(container)
    new MainDebugView({
        renderer: renderer,
        parent: container,
    })

    const terrain = new Terrain3D(renderer.scene)
    const point = terrain.getHeight(52, -10)
    console.log(point)
    new MoveHelper(renderer.scene, point)
}

init()





