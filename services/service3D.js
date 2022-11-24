import { Node3D } from "../webGlEngine/core/Node3D.js"
import { Renderer } from "../webGlEngine/renderer/Renderer.js"
import { OrbitControls } from "../webGlEngine/utils/OrbitControls.js"
import { serviceLoop } from "./serviceLoop.js"

function init() {
    delete service3D.init
    
    const renderer = new Renderer()
    const orbitControls = new OrbitControls(
        renderer.camera,
        renderer.canvas,
        renderer.onBeforeRender
    )

    serviceLoop.addUpdate(renderer.draw)

    service3D.renderer = renderer
    service3D.orbitControls = orbitControls

    Node3D.defaultScene = renderer.scene
}

export const service3D = {
    init,
    /** @type {Renderer} */ renderer: undefined,
    /** @type {OrbitControls} */ orbitControls: undefined
}