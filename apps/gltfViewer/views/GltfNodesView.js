export class GltfNodesView {
    container = document.createElement('div')

    constructor() {
        this.container.style.display = 'flex'
        this.container.style.flexDirection = 'column'

        const title = document.createElement('span')
        title.textContent = 'Node Mesh'
        title.style.margin = 'auto'
        this.container.appendChild(title)
    }

    addNode(name, onClickCallback) {
        const button = document.createElement('button')
        button.onclick = onClickCallback
        button.textContent = name

        this.container.appendChild(button)
    }

    reset() {
        for (let i = 1; i < this.container.childElementCount; i++) {
            this.container.children[i].remove()
        }
    }
}
