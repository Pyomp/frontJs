"use strict"

import { PI2 } from '../../math/MathUtils.js'
import { Spherical } from '../../math/Spherical.js'
import { Renderer } from '../../webGlEngine/renderer/Renderer.js'
import { Node3D } from '../../webGlEngine/core/Node3D.js'
import { OrbitControls } from '../../webGlEngine/utils/OrbitControls.js'
import { Blader3D } from './Blader3D.js'
import { Input } from './Input.js'
import { InterfaceView } from './Interface.view.js'
import { Points } from './Points.js'
import { LoopRaf } from '../../modules/common/LoopRaf.js'
import { MainDebugView } from '../../webGlEngine/debug/CommonDebugView.js'
import { SkinView } from '../../webGlEngine/debug/components/SkinView.js'
import { PointLight } from '../../webGlEngine/renderer/modules/PointLights.js'

/** asset init */
await Promise.all([
    Blader3D.init(),
    Points.init(),
])

function init() {
    const renderer = new Renderer()
    initLights(renderer)

    document.body.appendChild(renderer.canvas)
    {
        const s = renderer.canvas.style
        s.width = '100%'
        s.height = '100%'
    }


    const directionalLight = renderer.lights.directionalLights[0]
    directionalLight.direction.set(1, 1, 1).normalize()
    directionalLight.intensity = 0.2

    const loop = new LoopRaf(renderer.draw.bind(renderer))

    const orbitControls = new OrbitControls(
        renderer.camera,
        renderer.canvas,
        renderer.onBeforeRender
    )
    const input = new Input()
    const container = document.createElement('div')
    { // interface style
        const s = container.style
        s.position = 'fixed'
        s.top = '0'
        s.left = '0'
    }
    document.body.appendChild(container)
    const view = new InterfaceView(
        container,
        renderer.scene,
        renderer.onBeforeRender,
        input,
        orbitControls
    )

    new MainDebugView({
        renderer: renderer,
        parent: container,
    })
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'a':
                new Node3D({ objects: [new Points(1)] })
                break
            case 'p':
                
                break
        }
    })
}



const initLights = (/**@type {Renderer}*/ renderer) => {
    const lights = renderer.lights

    const POINT_LIGHT_COUNT = 20
    const updates = []

    const points = new Points(POINT_LIGHT_COUNT)
    const node = new Node3D({ objects: [points] })

    for (let i = 0; i < POINT_LIGHT_COUNT; i++) {
        const light = new PointLight()
        light.visible = 1
        renderer.pointLights.add(light)
        const spherical = new Spherical(1.2, Math.random() * PI2, Math.random() * PI2)
        light.color.set(1, 1, 1)
        light.intensity = 100

        let age = Math.random() * Math.PI * 2

        const update = (dt) => {
            age += dt

            light.position.x = Math.cos(age) * 10 * Math.sin(age) ** 2
            light.position.z = Math.sin(age) * 10 * Math.cos(age) ** 2
            light.position.y = 2.5 + Math.cos(age) ** 3

            light.position.toArray(points.positions, i * 3)

        }
        // update(1)
        updates.push(update)
    }
    const update = (dt) => {
        for (const cb of updates) {
            cb(dt)
        }
    }
    renderer.onBeforeRender.add(update)
}
init()





