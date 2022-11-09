import { repeatClick } from '../../dom/eventUtils.js'
import { button, div, p, span } from '../../dom/View.js'
import { SkinView } from '../../webGlEngine/debug/components/SkinView.js'
import { Blader3D } from './Blader3D.js'

export class InterfaceView {

    #createButton = button({ ref: 'createButton', i18n: 'create' })
    #minusButton = button({ ref: 'minusButton', textContent: ' - ' })
    #indexSpan = span({ ref: 'currentBladerIndex', textContent: '-1' })
    #plusButton = button({ ref: 'plusButton', textContent: ' + ' })
    #toggleDebug = button({ ref: 'toggleDebug', i18n: 'Debug' })

    #view = div({
        style: { padding: '10px' },
    }, [
        p({ i18n: 'You can create Character and take control of one with "-" "+"' }),
        div({}, [
            this.#createButton, this.#minusButton, this.#indexSpan, this.#plusButton,
        ]),
        p({ i18n: 'Arrow Up / Down / Left / Right to move the selectionned Blader.' }),
        this. #toggleDebug
    ])

    container = this.#view.element

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
        this.#scene = scene
        this.#updates = updates
        this.#keyboardInput = keyboardInput
        this.#orbitControls = orbitControls

        parent.appendChild(this.container)

        repeatClick(this.#createButton.element, this.#createBlader.bind(this))

        this.#minusButton.element.addEventListener('click', () => {
            if (this.#bladers[this.#currentBladerIndex - 1])
                this.currentBladerIndex -= 1
        })

        this.#plusButton.element.addEventListener('click', () => {
            if (this.#bladers[this.#currentBladerIndex + 1])
                this.currentBladerIndex += 1
        })

        updates.add(this.#updateDebugBound)

        this.#toggleDebug.element.addEventListener('click', () => {
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

