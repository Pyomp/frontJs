import { createHTMLElement } from '../../../../../../lib/dom/htmlElement.js'
import { set_language } from '../../../../../../lib/dom/i18n.js'


export class Languages_View {
    constructor(parent) {

        this.container = createHTMLElement('div', {
            display: 'flex', justifyContent: 'center', alignItems: 'center',
        }, parent)

        const flag_style = {
            padding: '5px',
            width: '60px',
            borderRadius: '5px',
        }

        const en = createHTMLElement('img', flag_style, this.container, undefined, {
            src: new URL('./flags/flagEN.svg', import.meta.url).href,
        }, ['button'])

        en.addEventListener('click', () => {
            set_language('en')
        })

        const fr = createHTMLElement('img', flag_style, this.container, undefined, {
            src: new URL('./flags/flagFR.svg', import.meta.url).href
        }, ['button'])

        fr.addEventListener('click', () => {
            set_language('fr')
        })
    }
}
