import { button, div, option, select } from "../../../dom/View.js"

function createView(serversState) {

    const selectView = select(
        {},
        serversState.map((state, index) => option({ i18n: state.name, attributes: { value: index } }))
    )

    const validateButtonView = button({ i18n: 'Enter' })

    const container = div(
        {},
        [selectView, validateButtonView]
    )
    return { container, select: selectView.element, validate: validateButtonView.element }
}

export async function initServerSelection(serversState) {
    const { container, select, validate } = createView(serversState)
    
    document.body.appendChild(container.element)

    return new Promise((resolve) => {
        validate.addEventListener('click', () => {
            resolve(serversState[select.value].host)
            container.dispose()
        })
    })
}