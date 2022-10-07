
import { i18n } from '../../modules/dom/i18n.js'
import { styleVar } from '../../modules/dom/styleVar.js'
import { View } from '../../modules/dom/View.js'
import { ViewTest } from './components/ViewTest.view.js'

// init
await i18n.init({
    en: new URL('./english.js', import.meta.url)
})
View.i18n = i18n.register

delete styleVar['--background-transparent']
// app
new ViewTest(document.body)
