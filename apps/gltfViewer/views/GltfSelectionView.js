export class GltfSelectionView {
    container = document.createElement('div')
    #input = document.createElement('input')
    #load = document.createElement('button')

    constructor() {
        this.#input.style.width = '100%'
        this.#input.type = 'text'
        this.#input.value = localStorage.getItem('inputGltfUrl') ?? './assets/3Dmodels/aurore/aurore.glb'
        this.#input.oninput = () => {
            localStorage.setItem('inputGltfUrl', this.#input.value)
        }
        this.#load.textContent = 'Load'
        this.container.appendChild(this.#input)
        this.container.appendChild(this.#load)
    }

    /**
     * @param {(url: URL)=> void} onClickCallback
     */
    setOnLoadClickCallback(onClickCallback) {
        this.#load.onclick = () => { onClickCallback(new URL('../../../' + this.#input.value, import.meta.url)) }
    }
}
