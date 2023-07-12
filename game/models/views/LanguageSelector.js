import { SelectImage } from "../../../modules/dom/components/SelectImage.js"

export class LanguageSelector {
    #selectImage = new SelectImage({
        imageOptions: [
            { url: new URL('../../../assets/images/flagEN.svg', import.meta.url).href, callback: () => { } },
            { url: new URL('../../../assets/images/flagFR.svg', import.meta.url).href, callback: () => { } }
        ]
    })

    constructor({
        parent,
    }) {
        parent?.appendChild(this.#selectImage.container)
    }
}
