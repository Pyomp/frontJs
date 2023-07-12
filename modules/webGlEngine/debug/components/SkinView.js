export class SkinView{
    element = document.createElement('div')

    constructor(parent) {
        parent.appendChild(this.element)
    }

    #writeBoneInfo(bone) {
        this.element.innerHTML += `<br>
            ${bone.name} |
            ${bone.position.x.toFixed(1)} ${bone.position.y.toFixed(1)} ${bone.position.z.toFixed(1)} |
            ${bone.quaternion.x.toFixed(1)} ${bone.quaternion.y.toFixed(1)} ${bone.quaternion.z.toFixed(1)} ${bone.quaternion.w.toFixed(1)} |
            ${bone.scale.x.toFixed(1)} ${bone.scale.y.toFixed(1)} ${bone.scale.z.toFixed(1)}
            `
    }

    #writeBoneInfoBound = this.#writeBoneInfo.bind(this)
    update(skin) {
        if (!skin) return
        this.element.innerHTML = ''
        skin.root.traverse(this.#writeBoneInfoBound)
    }

    dispose() {
        this.element.remove()
    }
}








