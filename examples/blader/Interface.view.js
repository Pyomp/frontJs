import { EventDispatcher, EventSet } from '../../common/EventDispatcher.js'
import { repeatClick } from '../../dom/eventUtils.js'
import { View } from '../../dom/View.js'
import { SkinView } from '../../webGlEngine/debug/components/SkinView.js'
import { Blader3D } from './Blader3D.js'



export class InterfaceView extends EventDispatcher {
    #view = new View('div', {
        style: { padding: '10px' },
        children: [
            new View('p', { i18n: 'You can create Character and take control of one with "-" "+"' }),
            new View('div', {
                children: [
                    new View('button', { ref: 'createButton', i18n: 'create' }),
                    new View('button', { ref: 'minusButton', textContent: ' - ' }),
                    new View('span', { ref: 'currentBladerIndex', textContent: '-1' }),
                    new View('button', { ref: 'plusButton', textContent: ' + ' }),
                ]
            }),
            new View('p', {
                i18n: 'Arrow Up / Down / Left / Right to move the selectionned Blader.'
            }),
            new View('button', { ref: 'toggleDebug', i18n: 'Debug' })
        ]
    })

    container = this.#view.element
    #createButton = this.#view.ref['createButton']
    #minusButton = this.#view.ref['minusButton']
    #indexSpan = this.#view.ref['currentBladerIndex']
    #plusButton = this.#view.ref['plusButton']
    #toggleDebug = this.#view.ref['toggleDebug']

    #skinningDebug = new SkinView()

    #scene
    #updates
    #bladers = []
    #keyboardInput
    #orbitControls
    #currentBladerIndex = -1

    get currentBladerIndex() { return this.#currentBladerIndex }
    set currentBladerIndex(a) {
        this.#currentBladerIndex = a
        this.#indexSpan.textContent = this.#currentBladerIndex
    }

    constructor(parent, scene, updates, keyboardInput, orbitControls) {
        super()

        this.#scene = scene
        this.#updates = updates
        this.#keyboardInput = keyboardInput
        this.#orbitControls = orbitControls

        parent.appendChild(this.container)

        repeatClick(this.#createButton, this.#createBlader.bind(this))

        this.#minusButton.addEventListener('click', () => {
            if (this.#bladers[this.#currentBladerIndex - 1])
                this.currentBladerIndex -= 1
        })

        this.#plusButton.addEventListener('click', () => {
            if (this.#bladers[this.#currentBladerIndex + 1])
                this.currentBladerIndex += 1
        })

        updates.add(this.#updateDebugBound)

        this.#toggleDebug.addEventListener('click', () => {
            if (this.#skinningDebug.isDisplayed()) {
                this.#skinningDebug.element.remove()
            } else {
                this.container.appendChild(this.#skinningDebug.element)
            }
        })

        this.#createBlader()
    }

    #updateDebugBound = this.#updateDebug.bind(this)
    #updateDebug() {
        if (this.#skinningDebug.isDisplayed()) {
            const blader = this.#bladers[this.#currentBladerIndex]
            if (blader) {
                this.#skinningDebug.update(blader.node.skin)
            }
        }
    }

    #createBlader() {
        const index = this.#bladers.length
        this.#bladers.push(
            new Blader3D(
                index,
                this.#scene,
                this.#orbitControls,
                this.#keyboardInput,
                this,
                this.#updates
            )
        )
        this.currentBladerIndex = index
    }

    dispose() {
        this.#updates.delete(this.#updateDebugBound)
        this.container.remove()
    }

}

