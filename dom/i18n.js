
// see the end
let urls = {}
const init = async (
    urlDictionaries = {
        en: '/languages/en.js',
        fr: '/languages/fr.js'
    },
    language = localStorage.getItem('language') || navigator.language
) => {
    urls = urlDictionaries
    const res = await setLanguage(language)
    if (res === false) setLanguage('en')
}

let dictionary = {}
const setLanguage = async (language = 'en') => {
    try {
        const url = urls[language]
        if (url === undefined) return false
        const module = await import(url)

        dictionary = module.default
        for (let i = 0; i < htmlElements.length; i++) {
            htmlElements[i].textContent = getStr(strs[i])
        }

        localStorage.setItem('language', language)
        return true
    } catch (e) {
        console.warn(e)
        return false
    }
}

const htmlElements = []
const strs = []
const notImplemented = []
const getStr = (str) => {
    const constructor = str?.constructor
    if (constructor === String) {
        if (str === '') return ''
        if (dictionary[str]) {
            return dictionary[str]
        } else {
            if (notImplemented.includes(str) === false) {
                notImplemented.push(str)
                const trad = (str[0]?.toUpperCase() + str.substring(1)).replaceAll('_', ' ')
                console.log(`'${str}': \`${trad}\`,`)
            }
            return str
        }
    } else if (constructor === Array) {
        return str.map(s => getStr(s)).join(' ')
    } else {
        console.warn('i18n wrong use')
    }
}

const register = (htmlElement, str) => {
    let id = htmlElements.indexOf(htmlElement)
    if (id === -1) {
        htmlElements.push(htmlElement)
        strs.push(str)
    } else {
        strs[id] = str
    }

    htmlElement.textContent = getStr(str)
}

const unregister = (element) => {
    const index = htmlElements.indexOf(element)
    if (index === -1) return
    htmlElements.splice(index, 1)
    strs.splice(index, 1)

    for (const child of element.children) {
        if (child.children.length > 0) {
            unregister(child)
        }
    }
}

/**
 * @example
 * ```js
 * await i18n.init()  
 * i18n.register(divElement, 'hello') // hello  
 * await i18n.setLanguage('fr') // salut  
 * ```
 * If the traduction is not set, display
 * ```js
 * console.log(`'${str}': \`${trad}\`,`)
 * ```
 * that can be copy-past from the console to the traduction file.  
*/
export const i18n = {
    init: init,
    setLanguage: setLanguage,
    register: register,
    unregister: unregister,
}





