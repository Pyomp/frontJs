import { createHTMLElement } from '../../../../../lib/dom/htmlElement.js'
import { Slot_View } from '../Slot_View.js'







export class Body_View {
    constructor(parent) {
        this.container = createHTMLElement('div', {
            position: 'relative',
            background: `url(${new URL('./body.svg', import.meta.url).href})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center',
            margin: 'auto',
            // width: '250px',
            maxWidth: '100%',
            height: '50%',
        }, parent)

        this.head = new Slot_View(this.container, {
            position: 'absolute',
            top: '5%', left: '50%',
            transform: 'translate(-50%)',
            width: '20%', height: '20%',
        })
        this.head.set_border_color(0, 0, 1)

        this.body = new Slot_View(this.container, {
            position: 'absolute',
            top: '40%', left: '50%',
            transform: 'translate(-50%)',
            width: '20%', height: '20%',
        })
        this.body.set_border_color(0, 0, 1)

        this.foot = new Slot_View(this.container, {
            position: 'absolute',
            top: '80%', left: '50%',
            transform: 'translate(-50%)',
            width: '20%', height: '20%',
        })
        this.foot.set_border_color(0, 0, 1)

        this.hand_l = new Slot_View(this.container, {
            position: 'absolute',
            top: '35%', left: '30%',
            transform: 'translate(-50%)',
            width: '20%', height: '20%',
        })
        this.hand_l.set_border_color(0, 0, 1)

        this.hand_r = new Slot_View(this.container, {
            position: 'absolute',
            top: '35%', left: '70%',
            transform: 'translate(-50%)',
            width: '20%', height: '20%',
        })
        this.hand_r.set_border_color(0, 0, 1)
    }
}