import { Vector3 } from '../../math/Vector3.js'
import { LoopRaf } from '../../models/LoopRaf.js' 
import { MoveHelper } from '../../webGlEngine/helpers/MoveHelper.js' 
import { Renderer } from '../../webGlEngine/renderer/Renderer.js'
import { OrbitControls } from '../../webGlEngine/utils/OrbitControls.js'

const renderer = new Renderer()
document.body.appendChild(renderer.canvas)
renderer.canvas.style.width = '100%'
renderer.canvas.style.height = '100%'

const loop = new LoopRaf(renderer.draw)

const orbitControls = new OrbitControls(
    renderer.camera,
    renderer.canvas,
    renderer.onBeforeRender
)

const vector3Test = new Vector3()

new MoveHelper(renderer.scene, vector3Test)

let age = 0
function update(dt) {
    age += dt
    vector3Test.set(Math.sin(age), Math.sin(age), Math.cos(age))
}

loop.updatesFrame.add(update)

