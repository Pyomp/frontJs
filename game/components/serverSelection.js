import { button, div, option, select } from "../../dom/View.js"

function createView(serversState) {

    const statusView = button({
        style: { '--padding-button': '10px', width: '15px', height: '15px', borderRadius: '50%', background: 'green' }
    })

    const selectView = select(
        { style: { margin: '5px', height: '30px', } },
        serversState.map((state, index) => option({ i18n: state.name, attributes: { value: index } }))
    )

    const validateButtonView = button({
        i18n: 'Enter',
        style: { '--padding-button': '10px', padding: '5px 20px', backgroundColor: 'hsl(200, 80%, 60%)', width: 'auto' }
    })

    const container = div(
        {
            style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
            }
        },
        [div(
            {
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }
            },
            [
                statusView,
                selectView,
                validateButtonView
            ])
        ]
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