import { Attribute } from "../../modules/webGlEngine/renderer/models/Attribute.js"
import { Geometry } from "../../modules/webGlEngine/renderer/models/Geometry.js"
import { Object3D } from "../../modules/webGlEngine/renderer/models/Object3D.js"
import { Renderer } from "../../modules/webGlEngine/renderer/Renderer.js"
import { basicShader } from "../../modules/webGlEngine/shaders/basicShader.js"
import { OrbitControls } from "../../modules/webGlEngine/extras/OrbitControls.js"
import { RafLoop } from "../../modules/webGlEngine/extras/RafLoop.js"
import { GltfSelectionView } from "./views/GltfSelectionView.js"
import { GlbLoader } from "../../modules/webGlEngine/gltf/GlbLoader.js"
import { SkinnedNode } from "../../modules/webGlEngine/nodes/SkinnedNode.js"
import { GltfNodesView } from "./views/GltfNodesView.js"
import { addTexture } from "../../modules/webGlEngine/gltf/GltfNodes.js"
import { AnimationView } from "./views/AnimationView.js"
import { LeftMenuView } from "../../modules/dom/components/LeftMenuView.js"
import { ShapeKeysView } from "./views/ShapeKeysView.js"


export class GltfViewer {
    #menuView = new LeftMenuView()
    #selectionView = new GltfSelectionView()
    #shapeKeysView = new ShapeKeysView()
    #animationView = new AnimationView()
    #nodesView = new GltfNodesView()

    #loader = new GlbLoader()

    #renderer = new Renderer()

    #orbitControl = new OrbitControls(
        this.#renderer.camera,
        this.#renderer.canvas
    )

    #loop = new RafLoop(() => {
        this.#orbitControl.update()
        this.#renderer.draw(this.#loop.dtS)
    })

    #plane = new Object3D({
        geometry: new Geometry([new Attribute('position', new Float32Array([
            -1, 0, -1,
            1, 0, -1,
            -1, 0, 1,
            1, 0, 1,
        ]), 'VEC3')], undefined, new Uint8Array([1, 2, 3, 2, 4, 3])),
        shader: basicShader
    })

    constructor() {
        this.#renderer.camera.position.set(60, 60, 60)
        this.#selectionView.setOnLoadClickCallback(async (url) => { this.#onNewGltfLoaded(await this.#loader.load(url)) })
        this.#initView()
    }

    #initView() {
        const fileView = document.createElement('div')
        fileView.appendChild(this.#selectionView.container)
        fileView.appendChild(this.#nodesView.container)
        this.#menuView.addSection(new URL('../../assets/icons/delapouite/files.svg', import.meta.url), fileView)

        const controlsView = document.createElement('div')
        controlsView.appendChild(this.#animationView.container)
        controlsView.appendChild(this.#shapeKeysView.container)
        this.#menuView.addSection(new URL('../../assets/icons/delapouite/ringmaster.svg', import.meta.url), controlsView)
    }

    /**
     * @param {{[name: string]: GltfNode}} gltfNodes 
     */
    #onNewGltfLoaded(gltfNodes) {
        this.#reset()
        for (const nodeName in gltfNodes) {
            this.#nodesView.addNode(nodeName, () => this.#displayNode(gltfNodes[nodeName]))
        }
    }

    /**
     * @param {GltfNode} gltfNode
     */
    #displayNode(gltfNode, u_mapUrl) {
        this.#renderer.scene.traverse((node) => { node.dispose() })
        addTexture(gltfNode, 'u_map', new URL('../../3Dmodels/aurore/aurore.svg', import.meta.url)) // TODO
        console.log(gltfNode)
        const skinnedNode = new SkinnedNode({ gltfNode })
        skinnedNode.traverseObjects((object) => { object.shader = basicShader })
        this.#updateControlsView(gltfNode, skinnedNode)

    }

    #updateControlsView(
        /** @type {GltfNode} */ gltfNode,
        /** @type {SkinnedNode} */ skinnedNode
    ) {
        this.#animationView.reset()
        if (gltfNode.skin?.animations) {
            for (const animationName in gltfNode.skin.animations) {
                this.#animationView.addAnimation(animationName, () => { skinnedNode.animation.play(animationName) })
            }
        }
    }

    #reset() {
        this.#animationView.reset()
        this.#nodesView.reset()
    }

    dispose() {
        this.#menuView.dispose()
        this.#loop.dispose()
        this.#orbitControl.dispose()
        this.#renderer.dispose()
    }
}
