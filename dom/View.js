

/** @param {CSSStyleDeclaration | {}} style */
export const setStyle = (element, style = {}) => {
    const s = element.style
    for (const key in style) {
        if (s[key] === undefined) {
            s.setProperty(key, style[key])
        } else {
            s[key] = style[key]
        }
    }
}

class Shadow extends HTMLElement {
    constructor(style) {
        super()
        this.shadow = this.attachShadow({ mode: "open" })
        this.shadowStyle = document.createElement('style')
        this.shadowStyle.textContent = style
        this.shadow.appendChild(this.shadowStyle)
    }
}
customElements.define('shadow-content', Shadow)

/** 
 * @typedef {{
 *      ref?: string,
 *      style?: CSSStyleDeclaration | {},
 *      parent?: Element,
 *      classList?: string[],
 *      shadowStyle?: string,
 *      i18n?: string,
 *      textContent?: string,
 *      attributes?: HTMLElement | HTMLInputElement | {}
 * }} ViewParam 
 */
export class View {

    static i18n = (element, text) => {
        element.textContent = text
    }


    /** @type {{[ref: string]: HTMLElement | HTMLInputElement }} */
    ref = {}
    element

    /**
     * @param {string} tag
     * @param {ViewParam} params
     */
    constructor(
        tag = 'div', {
            ref = '',
            style = {},
            parent,
            classList = [],
            shadowStyle = ``,
            i18n = '',
            textContent = '',
            attributes = {}
        }, children = []
    ) {
        // create element and handle shadow content if shadow style is set
        this.element = shadowStyle ? new Shadow(shadowStyle) : document.createElement(tag)
        const element = shadowStyle ? document.createElement(tag) : this.element
        if (shadowStyle) this.element.shadow.appendChild(element)

        // reference to the element to retrieve the element in a nested construction
        if (ref) this.ref[ref] = this.element

        if (parent) parent.appendChild(this.element)

        setStyle(element, style)

        this.#children = children
        for (const child of children) {
            if (child.constructor === String) {
                element.appendChild(span({ i18n: child }).element)
            } else {
                element.appendChild(child.element)
                for (const key in child.ref) {
                    if (this.ref[key]) throw new Error('view 2 sames ref')
                    this.ref[key] = child.ref[key]
                }
            }
        }
        for (const value of classList)
            element.classList.add(value)

        for (const key in attributes)
            if (this.element[key] !== undefined)
                element[key] = attributes[key]

        if (i18n) {
            this.#i18nUnregister = View.i18n(element, i18n)
        } else if (textContent) {
            element.textContent = textContent
        }
    }

    #i18nUnregister
    #children
    dispose() {
        if (this.#i18nUnregister) this.#i18nUnregister()
        this.element.remove()
        for (const child of this.#children) {
            child.dispose()
        }
    }

    isDisplayed() {
        return !!this.element.parentNode
    }
}

/**
 * @param {ViewParam} param0 
 * @param {View[]} children 
 * @returns 
 */
export function div({
    ref = '',
    style = {},
    parent,
    classList = [],
    shadowStyle = ``,
    i18n = '',
    textContent = '',
    attributes = {}
}, children = []) {
    return new View('div', arguments[0], children)
}

/**
 * @param {ViewParam} param0 
 * @param {View[]} children 
 * @returns 
 */
export function label({
    ref = '',
    style = {},
    parent,
    classList = [],
    shadowStyle = ``,
    i18n = '',
    textContent = '',
    attributes = {}
}, children = []) {
    return new View('label', arguments[0], children)
}

/**
 * @param {ViewParam} param0 
 * @param {View[]} children 
 * @returns 
 */
export function button({
    ref = '',
    style = {},
    parent,
    classList = [],
    shadowStyle = ``,
    i18n = '',
    textContent = '',
    attributes = {}
}, children = []) {
    return new View('button', arguments[0], children)
}

/**
 * @param {ViewParam} param0 
 * @param {View[]} children 
 * @returns 
 */
export function span({
    ref = '',
    style = {},
    parent,
    classList = [],
    shadowStyle = ``,
    i18n = '',
    textContent = '',
    attributes = {}
}, children = []) {
    return new View('span', arguments[0], children)
}

/**
 * @param {ViewParam} param0 
 * @param {View[]} children 
 * @returns 
 */
export function input({
    ref = '',
    style = {},
    parent,
    classList = [],
    shadowStyle = ``,
    i18n = '',
    textContent = '',
    attributes = {}
}, children = []) {
    return new View('input', arguments[0], children)
}

/**
 * @param {ViewParam} param0 
 * @param {View[]} children 
 * @returns 
 */
export function p({
    ref = '',
    style = {},
    parent,
    classList = [],
    shadowStyle = ``,
    i18n = '',
    textContent = '',
    attributes = {}
}, children = []) {
    return new View('p', arguments[0], children)
}

/**
 * @param {ViewParam} param0 
 * @param {View[]} children 
 * @returns 
 */
export function select({
    ref = '',
    style = {},
    parent,
    classList = [],
    shadowStyle = ``,
    i18n = '',
    textContent = '',
    attributes = {}
}, children = []) {
    return new View('select', arguments[0], children)
}

/**
 * @param {ViewParam} param0 
 * @param {View[]} children 
 * @returns 
 */
export function option({
    ref = '',
    style = {},
    parent,
    classList = [],
    shadowStyle = ``,
    i18n = '',
    textContent = '',
    attributes = {}
}, children = []) {
    return new View('option', arguments[0], children)
}
