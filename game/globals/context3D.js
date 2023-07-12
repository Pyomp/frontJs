import { GlbLoader } from "../../modules/webGlEngine/gltf/GlbLoader.js"
// import { Animation } from "../../webGlEngine/renderer/animation/Animation.js"
import { Renderer } from "../../modules/webGlEngine/renderer/Renderer.js"
// import { Atmosphere } from "../../webGlEngine/utils/Atmosphere.js"
import { ThirdControls } from "../../modules/webGlEngine/extras/ThirdControls.js"
import { env } from "../env.js"

// renderer.onBeforeRender.add(Animation.update)

// const atmosphere = new Atmosphere()
// renderer.onBeforeRender.add(() => { atmosphere.update() })

export const context3D = {
    init() {
        delete this.init
        this.renderer = new Renderer(env.rendererOptions)
        this.camera = this.renderer.camera
        this.controls = new ThirdControls(
            this.renderer.camera,
            this.renderer.canvas
        )
        document.body.prepend(this.renderer.canvas)
    },
    /** @type {Renderer} */ renderer: undefined,
    /** @type {Camera} */ camera: undefined,
    /** @type {ThirdControls} */ controls: undefined,
    // atmosphere,
    glbLoader: new GlbLoader(),
}
