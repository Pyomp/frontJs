import { Node3D } from "../../webGlEngine/core/Node3D.js"
import { GlbLoader } from "../../webGlEngine/gltfLoader/GlbLoader.js"
import { Renderer } from "../../webGlEngine/renderer/Renderer.js"
import { ThirdControls } from "../../webGlEngine/utils/ThirdControls.js"
import { serviceLoop } from "./serviceLoop.js"

function init() {
    delete service3D.init
    
    const renderer = new Renderer()
    const controls = new ThirdControls(
        renderer.camera,
        renderer.canvas,
        renderer.onBeforeRender
    )

    serviceLoop.addUpdate(renderer.draw)

    service3D.renderer = renderer
    service3D.controls = controls

    Node3D.defaultScene = renderer.scene
}

export const service3D = {
    init,
    /** @type {Renderer} */ renderer: undefined,
    /** @type {ThirdControls} */ controls: undefined,
    glbLoader: new GlbLoader()
}