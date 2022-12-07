







import { createHTMLElement } from '../../../../../../lib/dom/htmlElement.js'
import { providers_info } from '../../../../../appAPI/auth/Provider_Info.js'
import { app_data, ws } from '../../../../../global.js'
import { Async_Button } from '../../../../../../lib/models/Async_Button.js'
import { API_ERROR_SETTINGS_ALREADY_LINKED, API_ERROR_SETTINGS_ALREADY_LINKED_TO_AN_OTHER_ACCOUNT, API_ERROR_SETTINGS_FAIL } from '../../../../../../api/fault_codes/settings.js'
import { nokIMG } from '../../../../../../lib/dom/icons/icons.js'
import { i18nH } from '../../../../../../lib/dom/i18n.js'

export class Auth_Button_View {

    /**
     * @param {Element} parent 
     */
    constructor(
        parent,
        provider_info
    ) {
        const container = createHTMLElement('div', {
            display: 'flex', alignItems: 'center',
        }, parent)

        const button = new Async_Button(provider_info.name, {
            backgroundColor: provider_info.color,
            width: '150px',
            padding: '5px',
            '--padding-button': '2px',
        }, container)

        let disabled = false

        const error_string = {
            [API_ERROR_SETTINGS_ALREADY_LINKED]: `already_linked`,
            [API_ERROR_SETTINGS_ALREADY_LINKED_TO_AN_OTHER_ACCOUNT]: 'already_linked_to_an_other_account_log_out_before',
            [API_ERROR_SETTINGS_FAIL]: 'fail',
        }

        button.container.addEventListener('click', async () => {
            if (disabled === true) return
            disabled = true

            button.display_progress()

            const token = await provider_info.get_token()
            if (token) {
                const res = await ws.settings.link_provider(provider_info.name, token)
                if (res === 0) {
                    button.display_ok()
                } else {
                    button.display_nok()
                    button.error(error_string[res] || `server_error`)
                }
            } else {
                button.display_nok()
                button.error(`${provider_info.name}_not_available`)
            }
            disabled = false
        })
        //// Link span ////
        this.linked_span = createHTMLElement('span', {
            width: '60px',
            color: 'hsl(120, 100%, 70%)',
            marginLeft: '30px',
        }, container)

        //// Unlink ////
        const unlink_button = nokIMG(20, 20)
        container.appendChild(unlink_button)
        unlink_button.classList.add('button')

        unlink_button.addEventListener('click', async () => {

            if (unlink_button.style.pointerEvents === 'none'
                || (app_data.settings.account_linked & provider_info.id) === 0) return

            unlink_button.style.pointerEvents = 'none'

            button.display_progress()

            const res = await ws.settings.unlink_provider(provider_info.name)
            if (res === 0) {
                button.display_ok()
            } else {
                button.display_nok()
                button.error(`server_error`)
            }

            unlink_button.style.pointerEvents = ''
        })

        const update_link_span = () => {
            if ((app_data.settings.account_linked & provider_info.id)
                === 0) {
                i18nH(this.linked_span, '')
                unlink_button.remove()
            } else {
                i18nH(this.linked_span, 'linked')
                container.appendChild(unlink_button)

            }
        }
        update_link_span()
        app_data.settings.addEventListener('account_linked', update_link_span)
    }
}

export class Link_Account {

    constructor(parent) {
        this.container = createHTMLElement('div', {}, parent)

        createHTMLElement('h1', {}, this.container, `account_link`)

        const twitch = new Auth_Button_View(
            this.container, providers_info.twitch)
        const discord = new Auth_Button_View(
            this.container, providers_info.discord)
        const google = new Auth_Button_View(
            this.container, providers_info.google)

        ws.settings.update_account_linked()

    }
}










