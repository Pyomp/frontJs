/** @type {{[language: string]: (URL | string)[]}} */
let _urls = {}
let _language
const _notImplemented = new Set()
/** @type {Map<Element, string>} */
const _elementMap = new Map()

async function registerDictionary(language, url) {
    if (!_urls[language]) _urls[language] = []
    _urls[language].push(url)
    await updateAllElement(_urls[_language])
}

async function unregisterDictionary(url) {
    for (const key in _urls) {
        const index = _urls[key].findIndex((value) => value === url)
        if (index !== -1) {
            _urls[key].splice(index, 1)
            break
        }
    }
    await updateAllElement(_urls[_language])
}

function getDictionaries(language) {
    if (!_urls[language]) return []
    return Promise.all(_urls[language].map(
        async (url) => (await fetch(url)).json()
    ))
}

async function init() {
    const res = await setLanguage(localStorage.getItem('language') || navigator.language)
}

async function updateAllElement(dictionaries) {
    for (const [element, i18nKey] of _elementMap.entries()) {
        element.textContent = await getTraduction(i18nKey, dictionaries)
    }
}


async function setLanguage(language) {
    const dictionaries = await getDictionaries(language)
    await updateAllElement(dictionaries)
    localStorage.setItem('language', language)
    _language = language
}


function warningForNotImplementedKeys(i18nKey) {
    if (_notImplemented.has(i18nKey) === false) {
        _notImplemented.add(i18nKey)
        const trad = (i18nKey[0]?.toUpperCase() + i18nKey.substring(1)).replaceAll('_', ' ')
        console.warn(`'${i18nKey}': \`${trad}\`,`)
    }
}

async function getTraduction(i18nKey, dictionaries) {
    const _dictionaries = dictionaries ?? await getDictionaries(_language)
    const constructor = i18nKey?.constructor
    if (constructor === String) {
        for (const dictionary of _dictionaries) {
            if (dictionary[i18nKey]) return dictionary[i18nKey]
        }
        warningForNotImplementedKeys(i18nKey)
        return i18nKey
    } else if (constructor === Array) {
        return (await Promise.all(i18nKey.map(s => getTraduction(s, _dictionaries)))).join(' ')
    } else {
        console.warn('i18n wrong use')
    }
}

async function register(htmlElement, str) {
    _elementMap.set(htmlElement, str)
    htmlElement.textContent = await getTraduction(str)
    return () => { unregisterDeep(htmlElement) }
}

function updateElement(element) {
    element.textContent = getTraduction(_elementMap.get(element))
}

function unregisterDeep(element) {
    _elementMap.delete(element)
    for (const child of element.children) {
        unregisterDeep(child)
    }
}

async function reset() {
    for (const key in _urls) delete _urls[key]
    _language = undefined
    _notImplemented.clear()
    _elementMap.clear()

    await init()
}
await init()

/**
 * @example
 * ```js
 * await i18n.init()  
 * i18n.register(divElement, 'hello') // hello  
 * await i18n.setLanguage('fr') // salut  
*/
export const i18n = {
    reset,
    registerDictionary,
    unregisterDictionary,
    setLanguage,
    register,
    unregisterDeep,
    updateElement
}
