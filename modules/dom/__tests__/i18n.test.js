import { i18n } from '../i18n.js'

describe('dictionary registry', () => {
    it('should add a dictionary to a specific language', async () => {
        await i18n.registerDictionary('en', new URL('./dictionaryEn1.json', import.meta.url))
        await i18n.registerDictionary('en', new URL('./dictionaryEn2.json', import.meta.url))
        await i18n.setLanguage('en')

        const span = document.createElement('span')
        
        await i18n.register(span, 'test2')

        expect(span.textContent).toBe('test2_traduction')
    })

    it('should remove a dictionary to a specific language', async () => {
        await i18n.reset()

        await i18n.registerDictionary('en', new URL('./dictionaryEn1.json', import.meta.url))

        const urlEn2 = new URL('./dictionaryEn2.json', import.meta.url)
        await i18n.registerDictionary('en', urlEn2)

        const span = document.createElement('span')

        await i18n.unregisterDictionary(urlEn2)

        await i18n.register(span, 'test2')

        expect(span.textContent).toBe('test2')
    })
})

describe('element registry', () => {
    it('should register an element and display traduction', async () => {
        await i18n.reset()

        await i18n.registerDictionary('en', new URL('./dictionaryEn1.json', import.meta.url))
        await i18n.setLanguage('en')


        const span = document.createElement('span')

        await i18n.register(span, 'test')
 
        expect(span.textContent).toBe('test_traduction')
    })
})

describe('language switch', () => {
    it('should update element text when language has been changed', async () => {
        await i18n.reset()
    
        await i18n.registerDictionary('en', new URL('./dictionaryEn1.json', import.meta.url))
        await i18n.registerDictionary('fr', new URL('./dictionaryFr.json', import.meta.url))

        await i18n.setLanguage('en')

        const span = document.createElement('span')

        await i18n.register(span, 'test')

        expect(span.textContent).toBe('test_traduction')

        await i18n.setLanguage('fr')

        expect(span.textContent).toBe('test_traduction_fr')
    })
})
