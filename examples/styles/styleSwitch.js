import { StyleVar } from "../../dom/styleVar.js"
import { EventSet } from '../../common/EventDispatcher.js'

const darkStyle = {
    '--background1': 'hsl(0, 0%, 4%)',
    '--background2': 'hsl(0, 0%, 8%)',
    '--background3': 'hsl(0, 0%, 12%)',
    '--background-transparent': 'hsla(0, 0%, 0%, 0.5)',
    '--color1': 'hsl(0, 0%, 95%)',
    '--color2': 'hsl(0, 0%, 85%)',
    '--color3': 'hsl(0, 0%, 75%)',
}

const lightStyle = {
    '--background1': 'hsl(0, 0%, 100%)',
    '--background2': 'hsl(0, 0%, 90%)',
    '--background3': 'hsl(0, 0%, 80%)',
    '--background-transparent': 'hsla(0, 0%, 0%, 0.5)',
    '--color1': 'hsl(0, 0%, 0%)',
    '--color2': 'hsl(0, 0%, 5%)',
    '--color3': 'hsl(0, 0%, 10%)',
}
const styleVar = new StyleVar(darkStyle)

let onChange = new EventSet()
let isDark = true

export const styleSwitch = {
    get onChange() { return onChange },
    get isDark() { return isDark },
    get vars() { return styleVar.varKeys },
    setDark() { styleVar.updateStyleVar(darkStyle); isDark = true; onChange.emit() },
    setLight() { styleVar.updateStyleVar(lightStyle); isDark = false; onChange.emit() }
}

const styleElement = document.createElement('style')
document.head.appendChild(styleElement)
styleElement.textContent = /*css*/`
body {
    background-color: ${styleSwitch.vars["--background1"]};
    color: ${styleSwitch.vars["--color1"]};
}
`