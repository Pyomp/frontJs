import { createHTMLElement } from '../../../../lib/dom/htmlElement.js'
import { createSeparationBar } from '../../../../lib/dom/modules/separationBar.js'
import { Bag_View } from './bag/Bag_View.js'
import { Body_View } from './stuff/Body_View.js'




export class Inventory {
    constructor() {
        this.container = createHTMLElement('div', {
            height: '100%',
            width: '100%',
        })
        new Body_View(this.container)
        createSeparationBar(this.container).style.margin = '20px auto'
        new Bag_View(this.container)
    }
}


