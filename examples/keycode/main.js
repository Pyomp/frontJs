"use strict"

import { isMobile } from '../../modules/dom/browserInfo.js'
import { appData } from './global.js'
import { KeyCodeView } from './KeyCodeView.js'

if (!isMobile) { // if mobile inputManagerComputer will be undefined
    new KeyCodeView(document.body, appData.keybind)
}
