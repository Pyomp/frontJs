




import { createHTMLElement } from '../../../../../../lib/dom/htmlElement.js'
import { createSeparationBar } from '../../../../../../lib/dom/modules/separationBar.js'


export class About_View {
    constructor(parent) {
        this.container = createHTMLElement('div', {
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            flexDirection: 'column',
            padding: '5px',
            maxWidth: '400px',
            margin: 'auto'
        }, parent)

        /*******************************/
        /*     👫 social links 👫     */
        /*******************************/
        {
            const div = createHTMLElement('div', {
                padding: '5px',
            }, this.container)
            {
                createHTMLElement('div', { marginBottom: '10px', textAlign: 'center' }, div, 'you_can_help_me_in_various_way')
            }
            {
                createHTMLElement('div', {}, div, 'by_reporting_bugs_on_discord')
                // discord
                const button = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
                button.setAttributeNS(null, 'viewBox', '0 0 71 80')

                button.style.height = '40px'
                button.style.padding = '5px'
                button.style.borderRadius = '5px'
                button.classList.add('button')

                button.innerHTML = `<path
            d="M60.1045 13.8978C55.5792 11.8214 50.7265 10.2916 45.6527 9.41542C45.5603 9.39851 45.468 9.44077 45.4204 9.52529C44.7963 10.6353 44.105 12.0834 43.6209 13.2216C38.1637 12.4046 32.7345 12.4046 27.3892 13.2216C26.905 12.0581 26.1886 10.6353 25.5617 9.52529C25.5141 9.44359 25.4218 9.40133 25.3294 9.41542C20.2584 10.2888 15.4057 11.8186 10.8776 13.8978C10.8384 13.9147 10.8048 13.9429 10.7825 13.9795C1.57795 27.7309 -0.943561 41.1443 0.293408 54.3914C0.299005 54.4562 0.335386 54.5182 0.385761 54.5576C6.45866 59.0174 12.3413 61.7249 18.1147 63.5195C18.2071 63.5477 18.305 63.5139 18.3638 63.4378C19.7295 61.5728 20.9469 59.6063 21.9907 57.5383C22.0523 57.4172 21.9935 57.2735 21.8676 57.2256C19.9366 56.4931 18.0979 55.6 16.3292 54.5858C16.1893 54.5041 16.1781 54.304 16.3068 54.2082C16.679 53.9293 17.0513 53.6391 17.4067 53.3461C17.471 53.2926 17.5606 53.2813 17.6362 53.3151C29.2558 58.6202 41.8354 58.6202 53.3179 53.3151C53.3935 53.2785 53.4831 53.2898 53.5502 53.3433C53.9057 53.6363 54.2779 53.9293 54.6529 54.2082C54.7816 54.304 54.7732 54.5041 54.6333 54.5858C52.8646 55.6197 51.0259 56.4931 49.0921 57.2228C48.9662 57.2707 48.9102 57.4172 48.9718 57.5383C50.038 59.6034 51.2554 61.5699 52.5959 63.435C52.6519 63.5139 52.7526 63.5477 52.845 63.5195C58.6464 61.7249 64.529 59.0174 70.6019 54.5576C70.6551 54.5182 70.6887 54.459 70.6943 54.3942C72.1747 39.0791 68.2147 25.7757 60.1968 13.9823C60.1772 13.9429 60.1437 13.9147 60.1045 13.8978ZM23.7259 46.3253C20.2276 46.3253 17.3451 43.1136 17.3451 39.1693C17.3451 35.225 20.1717 32.0133 23.7259 32.0133C27.308 32.0133 30.1626 35.2532 30.1066 39.1693C30.1066 43.1136 27.28 46.3253 23.7259 46.3253ZM47.3178 46.3253C43.8196 46.3253 40.9371 43.1136 40.9371 39.1693C40.9371 35.225 43.7636 32.0133 47.3178 32.0133C50.9 32.0133 53.7545 35.2532 53.6986 39.1693C53.6986 43.1136 50.9 46.3253 47.3178 46.3253Z"
            fill="#5865F2" />`
                div.appendChild(button)
                const onDiscord = () => { window.open('https://discord.gg/gWNe2bWKQv') }
                button.addEventListener('click', onDiscord)
            }

            createHTMLElement('div', {}, div, 'by_following_me_on_twitter_twitch_and_co')
            {// twitch
                const button = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
                button.setAttributeNS(null, 'viewBox', '0 0 2400 2800')
                button.style.height = '40px'
                button.style.padding = '5px'
                button.style.borderRadius = '5px'
                button.classList.add('button')
                button.innerHTML = `<polygon fill="#FFFFFF"
            points="2200,1300 1800,1700 1400,1700 1050,2050 1050,1700 600,1700 600,200 2200,200" />
            <path fill="#9146FF" d="M500,0L0,500v1800h600v500l500-500h400l900-900V0H500z M2200,1300l-400,400h-400l-350,350v-350H600V200h1600
                        V1300z" />
            <rect x="1700" y="550" fill="#9146FF" width="200" height="600" />
            <rect x="1150" y="550" fill="#9146FF" width="200" height="600" />`
                div.appendChild(button)
                const onTwitch = () => { window.open('https://www.twitch.com/pyompy/') }
                button.addEventListener('click', onTwitch)
            }
            createHTMLElement('div', {}, div, 'by_buying_me_a_coffee_on_tipeee')
            { // tipeee
                const button = document.createElement('img')
                button.src = new URL('./tipeeeLogo.svg', import.meta.url).href
                button.style.height = '40px'
                button.style.padding = '5px'
                button.style.borderRadius = '5px'
                button.classList.add('button')
                div.appendChild(button)
                const onTipeee = () => { window.open('https://tipeee.com/pyompy') }
                button.addEventListener('click', onTipeee)
            }
        }

        createSeparationBar(this.container)


        createHTMLElement('span', {}, this.container).innerHTML = `Nicolas Gayet © COPYRIGHT 2022`
        createHTMLElement('span', {}, this.container).innerHTML = `All Rights Reserved - Tous Droits Réservés`

    }
}



