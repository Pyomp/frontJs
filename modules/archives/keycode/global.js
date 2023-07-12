import { InputManagerComputer } from '../../gameEngine/input/InputManagerComputer.js'
import { isMobile } from '../../modules/dom/browserInfo.js'
import { AppData } from './AppData/AppData.js'

export const appData = new AppData()
export const inputManagerComputer = isMobile ? undefined : new InputManagerComputer(document.body, appData.keybind)
