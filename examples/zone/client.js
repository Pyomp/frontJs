import { OrbitControls } from '../../webGlEngine/utils/OrbitControls.js'
import { Terrain3D } from '../terrain/TerrainNode.js'
import { renderer } from './global.js'

const orbitControls = new OrbitControls(
    renderer.camera,
    renderer.canvas,
    renderer.onBeforeRender
)


const directionalLight = renderer.lights.getDirectionalLight()
directionalLight.direction.set(1, 1, 1).normalize()
renderer.lights.needsUpdate = true

const terrain = new Terrain3D(renderer.scene)


