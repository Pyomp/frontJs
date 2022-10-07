import { Controls } from './models/Controls.js'
import { KeyBind } from './models/KeyBind.js'
import { Player } from './models/Player/Player.js'
import { Progress } from './models/Progress.js'
import { Settings } from './models/Settings.js'
import { SkillsCd } from './models/SkillsCD.js'

export class AppData {

    player = new Player()
    controls = new Controls()
    keybind = new KeyBind()
    settings = new Settings()
    progress = new Progress()
    skills_cd = new SkillsCd()

    constructor(id) {
        this.player = new Player(id)
    }

    dispose = () => {
        this.player.dispose()
    }

    toArray = () => [
        this.player.toArray(),
        this.skills.toArray(),
        this.keybind.toArray(),
        this.progress.toArray(),
        this.skills_cd.toObject(),
    ]

    fromArray = (a) => {
        if (a?.constructor !== Array) return
        this.player.fromArray(a[0])
        this.skills.fromArray(a[1])
        this.keybind.fromArray(a[2])
        this.progress.fromArray(a[3])
        this.skills_cd.fromObject(a[4])
    }
}