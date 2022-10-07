import { Customization } from '../../../AppData/models/Player/models/Customization.js'
import { assets3D } from '../../../assets3D/assets3D.js'
import { appData, reconciliationMotion } from '../global.js'

/** @param {AppDataCustomization} customizationAppdata*/
export function initCustomizationManager(thirdControls) {
    let node

    async function onModelChange() {
        node?.dispose()
        node = await assets3D[appData.player.customization.model].create()
        thirdControls.target = node.position
        reconciliationMotion.addEntity(appData.player, node)
    }

    onModelChange()
    appData.player.customization.addEventListener(Customization.EventModel, onModelChange)
}