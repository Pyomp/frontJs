
import { i18n } from '../../dom/i18n.js'
import { styleVar } from '../../dom/styleVar.js'
import { View } from '../../dom/View.js'
import { createViewTest, ViewTest } from './components/ViewTest.view.js'

// init
await i18n.init({
    en: new URL('./english.js', import.meta.url)
})
View.i18n = i18n.register

delete styleVar['--background-transparent']

// app
createViewTest(document.body)
