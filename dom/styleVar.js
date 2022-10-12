import { queueMicrotaskOnce } from './eventLoopOnce.js'


/**
 * Dictionary of css var, auto init a the loading.  
 * Its reactive: set or delete a value will update the style element.  
 */
export const styleVar = new Proxy({
    '--background1': 'hsl(0, 0%, 4%)',
    '--background2': 'hsl(0, 0%, 8%)',
    '--background3': 'hsl(0, 0%, 12%)',
    '--background-transparent': 'hsla(0, 0%, 0%, 0.5)',
    '--color1': 'hsl(0, 0%, 95%)',
    '--color2': 'hsl(0, 0%, 85%)',
    '--color3': 'hsl(0, 0%, 75%)',
}, {
    set(target, p, value, receiver) {
        target[p] = value
        queueMicrotaskOnce.add(update)
        return true
    },
    deleteProperty(target, p) {
        delete target[p]
        queueMicrotaskOnce.add(update)
        return true
    }
})

const styleElement = document.createElement('style')
document.head.appendChild(styleElement)
const update = () => {
    let str = ':root{\n'
    for (const key in styleVar) {
        styleVar[key]
        str += `${key}: ${styleVar[key]};\n`
    }
    str += '}'

    styleElement.innerHTML = ''
    styleElement.textContent = str
}
update()




