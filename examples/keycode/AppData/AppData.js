import { KeyCodeAppData } from './models/KeyCodeAppData.js'

export class AppData {

    keybind = new KeyCodeAppData()

    toArray() {
        return [
            this.keybind.toArray(),
        ]
    }

    fromArray(a) {
        if (a?.constructor !== Array) return
        this.keybind.fromArray(a[0])
    }
}