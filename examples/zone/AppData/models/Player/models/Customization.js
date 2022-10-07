import { EventDispatcher } from '../../../../../../modules/common/EventDispatcher.js'

export class Customization extends EventDispatcher {
    #model = `blader`
    get model() { return this.#model }
    set model(a) {
        if (this.#model !== a
            && a?.constructor === String
            && a.length > 2 && a.length < 30
        ) {
            this.#model = a
            this.emit('model')
        }
    }

    #color1 = 0x000000
    #color2 = 0x000000
    #color3 = 0x000000
    get color1() { return this.#color1 }
    set color1(a) {
        if (a !== this.#color1
            && Number.isFinite(a)
            && a >= 0 && a <= 0xffffff
        ) {
            this.#color1 = a
            this.emit('color')
        }
    }
    get color2() { return this.#color2 }
    set color2(a) {
        if (a !== this.#color2
            && Number.isFinite(a)
            && a >= 0 && a <= 0xffffff
        ) {
            this.#color2 = a
            this.emit('color')
        }
    }
    get color3() { return this.#color3 }
    set color3(a) {
        if (
            a !== this.#color3
            && Number.isFinite(a)
            && a >= 0 && a <= 0xffffff
        ) {
            this.#color3 = a
            this.emit('color')
        }
    }

    #pseudo = `unknown`
    get pseudo() { return this.#pseudo }
    set pseudo(a) {
        if (
            a?.constructor === String && a.length > 2 && a.length < 30
        ) {
            this.#pseudo = a
            this.emit('pseudo')
        }
    }
    toArray = () => [
        this.#model,
        this.#color1,
        this.#color2,
        this.#color3,
        this.#pseudo,
    ]
    fromArray = (a) => {
        if (a?.constructor !== Array) return
        this.model = a[0]
        this.color1 = a[1]
        this.color2 = a[2]
        this.color3 = a[3]
        this.pseudo = a[4]
    }

}