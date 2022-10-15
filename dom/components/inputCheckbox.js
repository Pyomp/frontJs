import { input, label, span } from "../View.js"

export function inputCheckbox(i18n) {
    const inputElement = input({ attributes: { type: "checkbox" } })
    const view = label({
        style: {
            display: 'flex',
            alignContent: 'center',
            gap: '5px',
            padding: '5px',
            cursor: 'pointer',
        }
    }, [
        inputElement,
        span({ i18n, style: { pointerEvents: 'none' } }),
    ])

    return {
        view,
        input: inputElement.element,
    }
} 