import { serviceApi } from "../services/api.js"

export const serverSelection = {
    async init() {
        const serversState = await serviceApi.gameServersStatus()

        if (serversState.length < 0) return

        return serversState[0].host

        const { div, select, validate } = createView(serversState)

        document.body.appendChild(div)

        return new Promise((resolve) => {
            validate.addEventListener('click', () => {
                resolve(serversState[select.value].host)
                div.remove()
            })
        })
    }
}

function createView(serversState) {
    const validateButtonView = document.createElement('button')
    validateButtonView.style['--padding-button'] = '10px'
    validateButtonView.style.padding = '5px 20px'
    validateButtonView.style.backgroundColor = 'hsl(200, 80%, 60%)'
    validateButtonView.style.width = 'auto'
    validateButtonView.textContent = 'Enter'

    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.justifyContent = 'center'
    div.style.alignItems = 'center'
    div.style.height = '100%'

    const div2 = document.createElement('div')
    div2.style.display = 'flex'
    div2.style.justifyContent = 'center'
    div2.style.alignItems = 'center'

    div.appendChild(div2)

    const statusView = document.createElement('button')
    statusView.style['--padding-button'] = '10px'
    statusView.style.width = '15px'
    statusView.style.height = '15px'
    statusView.style.borderRadius = '50%'
    statusView.style.background = 'green'

    div2.appendChild(statusView)

    const selectView = document.createElement('select')
    selectView.style.margin = '5px'
    selectView.style.height = '30px'

    div2.appendChild(selectView)

    for (let i = 0; i < serversState.length; i++) {
        const state = serversState[i]
        const option = document.createElement('option')
        option.value = i.toString()
        option.textContent = state.name

        selectView.appendChild(option)
    }

    return { div, select: selectView, validate: validateButtonView }
}
