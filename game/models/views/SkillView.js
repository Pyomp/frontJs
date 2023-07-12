class SkillView {
    element = document.createElement('div')

    constructor( /** @type {Skill} */ skill) {
        const image = new Image()
        image.src = skill.iconUrl.href
        this.element.appendChild(image)

        const rightContainer = document.createElement('div')
        this.element.appendChild(rightContainer)

        const name = document.createElement('span')
        name.textContent = skill.name
        rightContainer.appendChild(name)

        const description = document.createElement('span')
        description.textContent = skill.description
        rightContainer.appendChild(description)
    }
}
