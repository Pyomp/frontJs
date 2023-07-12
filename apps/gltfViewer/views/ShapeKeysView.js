export class ShapeKeysView {
    container = document.createElement('div')

    constructor() {
        this.container.style.display = 'flex'
        this.container.style.flexDirection = 'column'
        this.container.style.width = 'fit-content'

        const title = document.createElement('span')
        title.textContent = 'Morphs'
        title.style.margin = 'auto'
        this.container.appendChild(title)
    }

    addMorph(name, callback) {
        const div = document.createElement('div')

        const label = document.createElement('label')
        label.textContent = name
        div.appendChild(label)

        const input = document.createElement('input')
        input.type = 'range'
        input.min = '-2'
        input.max = '2'
        input.oninput = () => { callback(input.value) }

        this.container.appendChild(div)
    }
}
