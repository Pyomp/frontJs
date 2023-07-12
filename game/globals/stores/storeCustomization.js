import { EventSet } from "../../../modules/utils/EventSet.js"

let model = 'blader'
const onModel = new EventSet()

let color1 = 0x000000
let color2 = 0x000000
let color3 = 0x000000
const onColor = new EventSet()

let pseudo = `unknown`
const onPseudo = new EventSet()

export const storeCustomization = {
    onModel,
    get model() { return model },
    set model(a) { if (model !== a && a?.constructor === String && a.length > 2 && a.length < 30) { model = a; onModel.emit() } },

    onColor,
    get color1() { return color1 },
    set color1(a) { if (a !== color1 && Number.isFinite(a) && a >= 0 && a <= 0xffffff) { color1 = a; onColor.emit() } },
    get color2() { return color2 },
    set color2(a) { if (a !== color2 && Number.isFinite(a) && a >= 0 && a <= 0xffffff) { color2 = a; onColor.emit() } },
    get color3() { return color3 },
    set color3(a) { if (a !== color3 && Number.isFinite(a) && a >= 0 && a <= 0xffffff) { color3 = a; onColor.emit() } },

    onPseudo,
    get pseudo() { return pseudo },
    set pseudo(a) { if (a?.constructor === String && a.length > 2 && a.length < 30) { pseudo = a; onPseudo.emit() } },

    toArray() {
        return [
            model,
            color1,
            color2,
            color3,
            pseudo,
        ]
    },

    fromArray(a) {
        if (a?.constructor !== Array) return
        this.model = a[0]
        this.color1 = a[1]
        this.color2 = a[2]
        this.color3 = a[3]
        this.pseudo = a[4]
    },
}
