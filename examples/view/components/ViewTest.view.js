import { button, div, p, span } from '../../../dom/View.js'

function createHtml(parent) {
    return div({
        parent,
        style: {
            width: 'fit-content',
            background: 'hsla(0, 0%, 0%, 0.5)',
            padding: '10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
        },
        shadowStyle: `
            button {
                background: red;
                cursor: pointer;
            }
        `,
    }, [
        button({ ref: 'woowButton', i18n: 'Wooow' }),
        div({}, [
            button({ ref: 'minusButton', textContent: ' - ' }),
            span({ ref: 'infoSpan', textContent: '0' }),
            button({
                ref: 'plusButton',
                textContent: ' + ',
                style: {
                    fontSize: 'larger',
                }
            })
        ]),
        p({
            ref: 'woowP',
            style: {
                opacity: 0,
                transition: 'opacity 0.5s'
            },
            i18n: 'coucou world'
        })
    ])
}

export function createViewTest(parent) {
    const view = createHtml(parent)
    const { woowButton, minusButton, infoSpan, plusButton, woowP } = view.ref

    const create = () => { woowP.style.opacity ^= 1 }
    const minus = () => { infoSpan.textContent-- }
    const plus = () => { infoSpan.textContent++ }

    parent.appendChild(this.view.element)
    woowButton.addEventListener('click', create)
    minusButton.addEventListener('click', minus)
    plusButton.addEventListener('click', plus)

    return {
        dispose() {
            view.dispose()
        }
    }
}