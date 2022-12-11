



import { Loader_Manager } from '../../../../modules/Loader_Manager.js'

let texture
/**
 * 
 * @param {Loader_Manager} loader_manager 
 */
const init = async (loader_manager) => {
    texture = await loader_manager.texture_cube_load_async([
        new URL('./dark-s_px.jpg', import.meta.url).href,
        new URL('./dark-s_nx.jpg', import.meta.url).href,
        new URL('./dark-s_py.jpg', import.meta.url).href,
        new URL('./dark-s_ny.jpg', import.meta.url).href,
        new URL('./dark-s_pz.jpg', import.meta.url).href,
        new URL('./dark-s_nz.jpg', import.meta.url).href,
    ])
}

export class Milky_Way_Background {
    static init = init
    static destroy = () => {
        texture = undefined
    }
    constructor(scene) {
        scene.background = texture
    }
}











