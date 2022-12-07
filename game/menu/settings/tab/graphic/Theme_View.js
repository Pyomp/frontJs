








import { STYLE } from '../../../../../../lib/dom/style/Style.js'
import { createHTMLElement } from '../../../../../../lib/dom/htmlElement.js'

export class Theme_View {

    /**
     * @param {Element} parent
     *  @param {string[]} theme_list
     */
    constructor(
        parent_grid,
        theme_list = [
            'dark',
            'light'
        ]
    ) {
        createHTMLElement('span', {
            borderBottom: 'solid 1px hsla(0, 0%, 50%, .5)',
        }, parent_grid, `theme`)
        const select = createHTMLElement('select', {
            borderBottom: 'solid 1px hsla(0, 0%, 50%, .5)',
        }, parent_grid)

        for (const theme of theme_list) {
            createHTMLElement('option', {}, select, theme, {
                value: theme,
            })

        }

        select.addEventListener('change', (e) => {
            const t = STYLE.themes[select.value]
            if (t) {
                STYLE.update(t)
            } else {
                console.warn(`theme unknown`)
            }
        })
    }
}








