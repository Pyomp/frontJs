import { createHTMLElement } from '../../../../../lib/dom/htmlElement.js'





export class Stuff_View {
    constructor(parent) {
        this.container = createHTMLElement('div', {
            height: '50%',
        }, parent)

        const body = new Body_View(this.container)
        const loadout = new Loadout_View(this.container)

    }
}






