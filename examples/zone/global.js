import { LoopRaf } from '../../modules/common/LoopRaf.js'
import { Renderer } from '../../webGlEngine/renderer/Renderer.js'
import { AppData } from './AppData/AppData.js'

export const appData = new AppData()
export const renderer = new Renderer()
export const loop = new LoopRaf(renderer.draw)
