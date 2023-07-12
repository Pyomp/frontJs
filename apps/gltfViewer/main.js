import "../../modules/dom/styles/styles.js"
import { FPSView } from "../../modules/webGlEngine/debug/components/FPSView.js"
import { GltfViewer } from "./GltfViewer.js"

document.body.style.background = 'gray'

new FPSView()

const gltfViewer = new GltfViewer()
