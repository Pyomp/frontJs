import { repeatClick } from '../../../dom/eventUtils.js'
import { SkinView } from '../../debug/components/SkinView.js'
import { Blader3D } from './Blader3D.js'

export class InterfaceView {

    #createButton = document.createElement('button')
    #minusButton = document.createElement('button')
    #indexSpan = document.createElement('span')
    #plusButton = document.createElement('button')
    #toggleDebug = document.createElement('button')

    container = document.createElement('div')
    #initView() {
        this.#createButton.textContent = 'create'
        this.#minusButton.textContent = ' - '
        this.#indexSpan.textContent = '-1'
        this.#plusButton.textContent = ' + '
        this.#toggleDebug.textContent = 'Debug'

        const p = document.createElement('p')
        p.textContent = 'You can create Character and take control of one with "-" "+"'

        const buttonsDiv = document.createElement('div')
        buttonsDiv.appendChild(this.#createButton)
        buttonsDiv.appendChild(this.#minusButton)
        buttonsDiv.appendChild(this.#indexSpan)
        buttonsDiv.appendChild(this.#plusButton)

        const p2 = document.createElement('p')
        p2.textContent = 'Arrow Up / Down / Left / Right to move the selected Blader.'

        this.container.appendChild(p)
        this.container.appendChild(buttonsDiv)
        this.container.appendChild(p2)
        this.container.appendChild(this.#toggleDebug)
    }

    #skinningDebug = new SkinView()

    #bladers = []
    #keyboardInput
    #orbitControls
    #currentBladerIndex = -1

    get currentBladerIndex() { return this.#currentBladerIndex }
    set currentBladerIndex(a) {
        this.#currentBladerIndex = a
        this.#indexSpan.textContent = `controls on n°${this.#currentBladerIndex}`
    }

    constructor(parent, keyboardInput, orbitControls) {
        this.#initView()
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

        this.#toggleDebug.addEventListener('click', () => {
            if (this.#skinningDebug.element.offsetParent) {
                this.#skinningDebug.element.remove()
            } else {
                this.container.appendChild(this.#skinningDebug.element)
            }
        })

        this.#createBlader()
    }

    update = this.#update.bind(this)
    #update(dtS) {
        if (this.#skinningDebug.element.offsetParent) {
            const blader = this.#bladers[this.#currentBladerIndex]
            if (blader) {
                this.#skinningDebug.update(blader.node.skin)
            }
        }
        this.#bladers[this.currentBladerIndex].update(dtS)
    }

    #createBlader() {
        const index = this.#bladers.length
        this.#bladers.push(
            new Blader3D(
                this.#orbitControls,
                this.#keyboardInput
            )
        )
        this.currentBladerIndex = index
    }

    dispose() {
        this.container.remove()
    }

}

