import { LoopRaf } from '../../models/LoopRaf.js'
import { Test } from '../../modules/test/Test.js'
import { PointLight } from '../renderer/modules/lightsManager/PointLights.js'
import { Renderer } from '../renderer/Renderer.js'

export default function pointLightsTest() {
    const test = new Test('Test Point Light displayed',
        `There is a maximum of point lights in a renderer.
    To simplify the game development, the renderer will select the right point lights.
    ex: The game dev can push 100 point lights in the scene,
        the renderer will chose to display the nearest 20 point lights (max point lights, can be set at renderer creation),
        note that there is a transition when lights change (in renderer).`
    )

    test.time.enableTestLoop()

    const renderer = new Renderer({
        pointLightMaxCount: 1,
        pointLightFadeTime: 0.2,
    })
    const pointLightsMock = renderer.lightsManager.pointLights = test.mock(renderer.lightsManager.pointLights)

    new LoopRaf(renderer.draw.bind(renderer))

    const pointLight1 = new PointLight()
    const pointLight2 = new PointLight()

    renderer.pointLights.add(pointLight1)
    renderer.pointLights.add(pointLight2)

    test.test(
        'Proximity',
        `Check if the correct light is selected in the renderer.`,
        () => {
            pointLight1.position.set(-5, 0, 0)
            pointLight2.position.set(0, 0, 0)
            renderer.camera.position.set(-10, 0, 0)

            test.time.nextTick(10)

            const info1 = renderer.lightsManager.pointLights.getInfo()
            if (info1.currentLights[0] === pointLight1) {
                return test.fail(renderer.lightsManager.pointLights)
            }

            test.time.nextTick(10, 20)

            const info2 = renderer.lightsManager.pointLights.getInfo()

            if (info2.currentLights[0] !== pointLight1) {
                return test.fail(renderer.lightsManager.pointLights)
            }

            return test.pass()
        }
    )

    test.test(
        'transition too soon',
        `Check the light transition before the switch done.`,
        () => {
            pointLightsMock.testMetadata.takeSnapshot()
            pointLight1.position.set(-5, 0, 0)
            pointLight2.position.set(0, 0, 0)
            renderer.camera.position.set(10, 0, 0)

            test.time.nextTick(10, 30)

            const info = renderer.lightsManager.pointLights.getInfo()

            if (info.currentLights[0] === pointLight2) {
                return test.pass()
            } else {
                pointLightsMock.testMetadata.takeSnapshot()
                return test.fail(pointLightsMock.testMetadata.snapshots)
            }


        }
    )

    test.test(
        'transition done',
        `Check the light transition after the switch done.`,
        () => {
            test.time.nextTick(10, 30)
            const info = renderer.lightsManager.pointLights.getInfo()
            if (info.currentLights[0] === pointLight2) {
                return test.pass()
            } else {
                return test.fail(info)
            }
        }
    )

    return test
}




