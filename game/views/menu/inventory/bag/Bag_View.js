import { createHTMLElement } from '../../../../../lib/dom/htmlElement.js'
import { Slot_View } from '../Slot_View.js'





export class Bag_View {
    constructor(parent) {
        this.container = createHTMLElement('div', {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            height: '50%',
            width: '100%',
            overflowY: 'auto',
        }, parent)

        const slots = []

        for (let i = 0; i < 50; i++) {
            const slot = new Slot_View(
                this.container, {
                width: 'auto', height: '20%',
            })
            slots.push(slot)
            slot.set_border_color(0.7, 1, 0.8)
        }
        
    }
}













