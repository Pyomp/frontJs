import { createHTMLElement } from '../../../../../../lib/dom/htmlElement.js'
import { Theme_View } from './Theme_View.js'


export class Graphic_View {
    constructor(parent) {

        this.container = createHTMLElement('div', {
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            gap: '10px',
            padding: '10px',
            borderCollapse: 'collapse',
        }, parent)

        new Theme_View(this.container)
        

    }
}



