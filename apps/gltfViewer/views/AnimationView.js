export class AnimationView {
    container = document.createElement('div')


    constructor() {
        this.container.style.display = 'flex'
        this.container.style.flexDirection = 'column'
        this.container.style.width = 'fit-content'

        const title = document.createElement('span')
        title.textContent = 'Animations'
        title.style.margin = 'auto'
        this.container.appendChild(title)
    }

    addAnimation(name, callback) {
        const button = document.createElement('button')
        button.style.width = 'fit-content'
        button.textContent = name
        this.container.appendChild(button)
        button.onclick = callback
    }

    reset() {
        for (let i = 1; i < this.container.childElementCount; i++) {
            this.container.children[i].remove()
        }
    }
}
