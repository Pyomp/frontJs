import { createHTMLElement, setStyle } from '../../../../lib/dom/htmlElement.js'
import { createSeparationBar } from '../../../../modules/dom/components/separationBar.js'
import { styles } from '../../../../modules/dom/styles/styles.js'
import { About_View } from './tab/about/About_View.js'
import { Account_View } from './tab/account/Account_View.js'
import { Controls_View } from './tab/controls/Controls_View.js'
import { Graphic_View } from './tab/graphic/Graphic_View.js'

export class Settings_View {
    constructor(
        parent,
    ) {
        this.container = createHTMLElement('div', {
            paddingTop: '15px',
        }, parent)

        const header = createHTMLElement('div', {
            margin: 'auto',
            width: 'fit-content',
        }, this.container)
        createSeparationBar(this.container)
        const content = createHTMLElement('div', {}, this.container)

        const tab_size = 60
        const tab_style = {
            padding: '10px',
            borderRadius: '5px',
            width: tab_size,
            height: tab_size,
            fill: styles.var.colorText,
            stroke: styles.var.colorText,
        }

        const tabs = []

        const update_tab = (tab_active) => {
            for (const tab of tabs) {
                if (tab === tab_active) {
                    tab.style.backgroundColor = styles.var.colorBackgroundSelected
                } else {
                    tab.style.backgroundColor = ''
                }
            }
        }


            ;
        (async () => {
            const Views_Class = [
                Account_View,
                Graphic_View,
                Controls_View,
                About_View,
            ]

            const result = await Promise.all([
                fetch(new URL('./account.svg', import.meta.url)).then((res) => res.text()),
                fetch(new URL('./graphic.svg', import.meta.url)).then((res) => res.text()),
                fetch(new URL('./keyboard.svg', import.meta.url)).then((res) => res.text()),
                fetch(new URL('./dread.svg', import.meta.url)).then((res) => res.text()),
            ])
            for (let i = 0; i < result.length; i++) {
                const str = result[i]

                const tab = toSVGElement(str)
                setStyle(tab, tab_style)

                header.appendChild(tab)

                tabs.push(tab)

                const view = new Views_Class[i](i === 0 ? content : undefined)
                if (i === 0) update_tab(tab)

                tab.addEventListener('click', () => {
                    update_tab(tab)
                    content.innerHTML = ''
                    content.appendChild(view.container)
                })
            }
        })()
    }
}
