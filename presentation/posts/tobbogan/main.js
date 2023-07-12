import { i18n } from "../../../modules/dom/i18n.js"

const container = document.createElement('div')

const postData = await (await fetch(new URL('./post.json', import.meta.url))).json()

const titleSpan = document.createElement('h1')
i18n.register(titleSpan, postData.title)

const authorSpan = document.createElement('span')
author.textContent = postData.author

const dateSpan = document.createElement('span')
author.textContent = new Date(postData.data).toLocaleDateString()

const paragraphe1 = `
First, I have defined title using the i18n module.
One problem is I want multiple internationalization file.
As i18n is global, it will be shared between this post and other part of the app (other posts and main app).
So I want to be able to register and unregister dictionaries in my i18n module.
`

function dispose() {
    i18n.unregisterDeep(container)
}

export default {
    container,
    dispose
}
