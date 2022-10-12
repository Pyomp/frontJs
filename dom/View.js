

/** @param {CSSStyleDeclaration} style */
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
 * Help to construct view for javascript classes.  
 * - You can construct nested view with the parameter `children`  
 * - `View.i18n` can be set with a callback at the begin of the app to handle internationalization.  
 * - set `ref` to get the element from the root of the view ex:`this.#button = container.ref['myButton']`  
 * - If `shadowStyle` is set, `this.element` will be a `webcomponent` in shadow DOM (style while be scoped).  
 * 
 * See exemple at `/examples/view`.  
 * 
 * Note: `attributes` in `constructor` is an arbitrary object, `HTMLInputElement` in the doc is just for vscode autocompletion.
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
     * @param {{
     *      ref?: string,
     *      style?: CSSStyleDeclaration | {},
     *      parent?: Element,
     *      children?: View[],
     *      classList?: string[],
     *      shadowStyle?: string,
     *      i18n?: string,
     *      textContent?: string,
     *      attributes?: HTMLElement | HTMLInputElement | {}
     * }} params
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

        for (const child of children) {
            if (child.constructor === String) {
                element.appendChild(span({ i18n: child }).element)
            } else {
                element.appendChild(child.element)
                for (const key in child.ref) {
                    if (this.ref[key]) throw new Error('view 2 sames name')
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
            View.i18n(element, i18n)
        } else if (textContent) {
            element.textContent = textContent
        }

    }
    isDisplayed() {
        return !!this.element.parentNode
    }
}

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

