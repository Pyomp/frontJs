import { Color } from '../../../../math/Color.js'

export class Light {
    needsUpdate = true
    visible = 0
    intensity = 0    
    color = new Color(1, 1, 1)
}