import { Controls } from './models/Controls.js'
import { KeyCode } from './keyCode.js'
import { Player } from './models/Player/Player.js'
import { Progress } from './models/Progress.js'
import { Settings } from './models/Settings.js'
import { SkillsCd } from './models/SkillsCD.js.js'

export class AppData {

    player = new Player()
    controls = new Controls()
    keycode = new KeyCode()
    settings = new Settings()
    progress = new Progress()
    skillsCd = new SkillsCd()

    constructor(id) {
        this.player.id = id
    }

    toArray() {
        return [
            this.player.toArray(),
            this.keycode.toArray(),
            this.progress.toArray(),
            this.skillsCd.toObject(),
        ]
    }

    fromArray(a) {
        if (a?.constructor !== Array) return
        this.player.fromArray(a[0])
        this.keycode.fromArray(a[2])
        this.progress.fromArray(a[3])
        this.skillsCd.fromObject(a[4])
    }
}