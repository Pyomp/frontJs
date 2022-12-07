import { button } from '../../dom/View.js'
import { serviceStyle } from './serviceStyle.js'

const buttonElement = button({
    parent: document.body, style: {
        background: serviceStyle.vars['--background1'],
        color: serviceStyle.vars['--color1'],
    }, i18n: 'Switch Pref'
}).element

buttonElement.addEventListener('click', () => {
    if (serviceStyle.isDark) {
        serviceStyle.setLight()
    } else {
        serviceStyle.setDark()
    }
})