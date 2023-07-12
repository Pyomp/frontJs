import "../../../dom/styles/styles.js"
import { Renderer } from '../../renderer/Renderer.js'
import { OrbitControls } from '../../extras/OrbitControls.js'
import { FPSView } from "../../debug/components/FPSView.js"
import { RafLoop } from "../../extras/RafLoop.js"
import { Zone0 } from "./zone0/zone0.js"

const renderer = new Renderer({ camera: { far: 2000 } })

document.body.prepend(renderer.canvas)

renderer.camera.position.set(60, 60, 60)

const orbitControl = new OrbitControls(
    renderer.camera,
    renderer.canvas
)

function update() {
    orbitControl.update()
    renderer.draw(loop.dateNowS)
}

const loop = new RafLoop(update)

await Zone0.init()

new Zone0(renderer)

new FPSView()
