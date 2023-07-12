export function inputCheckbox(i18n) {
    const input = document.createElement('input')

    const label = document.createElement('label')
    label.style.display = 'flex'
    label.style.alignContent = 'center'
    label.style.gap = '5px'
    label.style.padding = '5px'
    label.style.cursor = 'pointer'

    const title = document.createElement('title')
    title.style.pointerEvents = 'none'

    input.type = 'checkbox'

    label.appendChild(input)
    label.appendChild(title)

    return {
        label,
        input,
        title
    }
} 
