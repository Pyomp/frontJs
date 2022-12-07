import { createHTMLElement } from '../../../../../../lib/dom/htmlElement.js'
import { PWA_Install_View } from './PWA_Install_View.js'
import { providers_info } from '../../../../../appAPI/auth/Provider_Info.js'
import { Link_Account } from './Link_Account_View.js'
import { Languages_View } from './Languages_View.js'






export class Account_View {
    constructor(parent) {
        this.container = createHTMLElement('div', {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '5px 20px',
        }, parent)

        new Languages_View(this.container)

        new PWA_Install_View(this.container)

        {
            const c = createHTMLElement('div', {
                display: 'flex', justifyContent: 'center', alignItems: 'center',
            }, this.container)

            const log_out_button = createHTMLElement('button', {
                backgroundColor: 'hsl(0, 100%, 70%)',
            }, c, 'log_out')
            log_out_button.addEventListener('click', () => {
                for (const key in providers_info) {
                    const provider = providers_info[key]
                    localStorage.removeItem(`${provider.name}_token`)
                }
                location.reload()
            })

            const clear_cache_button = createHTMLElement('button', {
                backgroundColor: 'hsl(20, 100%, 70%)',
            }, c, 'clear_cache')
            clear_cache_button.addEventListener('click', async () => {
                const keys = await caches.keys()
                await Promise.all(keys.map((key) => {
                    caches.delete(key)
                }))
                localStorage.clear()
                location.reload()
            })
        }
        new Link_Account(this.container)

    }
}



