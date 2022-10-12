import { button } from '../../dom/View.js'
import { styleSwitch } from './styleSwitch.js'

const buttonElement = button({
    parent: document.body, style: {
        background: styleSwitch.vars['--background1'],
        color: styleSwitch.vars['--color1'],
    }, i18n: 'Switch Pref'
}).element

buttonElement.addEventListener('click', () => {
    if (styleSwitch.isDark) {
        styleSwitch.setLight()
    } else {
        styleSwitch.setDark()
    }
})