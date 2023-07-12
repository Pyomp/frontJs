"use strict"

import { Renderer } from '../../renderer/Renderer.js'
import { OrbitControls } from '../../extras/OrbitControls.js'
import { Blader3D } from './Blader3D.js'
import { KeyboardInput } from './KeyboardInput.js'
import { InterfaceView } from './InterfaceView.js'
import { Points } from './Points.js'

import { MainDebugView } from '../../debug/CommonDebugView.js'
import { LightComponent } from './LightComponent.js'
import { RafLoop } from '../../extras/RafLoop.js'

await Promise.all([
    Blader3D.assetInit(),
    Points.assetInit(),
])

function init() {
    const renderer = new Renderer({ lights: { pointLightMaxCount: 20 } })
    const lightComponent = new LightComponent(renderer)

    const directionalLight = renderer.lightsManager.directionalLights[0]
    directionalLight.direction.set(1, 1, 1).normalize()
    directionalLight.intensity = 0.2

    const orbitControls = new OrbitControls(renderer.camera, renderer.canvas)

    const keyboardInput = new KeyboardInput()
    const view = new InterfaceView(document.body, keyboardInput, orbitControls)

    function update() {
        view.update(loop.dtS)
        lightComponent.update(loop.dtS)
        orbitControls.update()
        renderer.draw(loop.dtS)
    }
    const loop = new RafLoop(update)

    new MainDebugView({ renderer: renderer })
}

init()
