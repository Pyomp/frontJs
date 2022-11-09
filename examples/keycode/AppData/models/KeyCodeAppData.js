export class KeyCodeAppData {
    #up = '0KeyW'
    get up() { return this.#up }
    set up(a) { if (this.#up !== a && a?.constructor === String && a.length > 1) { this.#up = a; this.emit('up') } }

    #down = '0KeyS'
    get down() { return this.#down }
    set down(a) { if (this.#down !== a && a?.constructor === String && a.length > 1) { this.#down = a; this.emit('down') } }

    #left = '0KeyA'
    get left() { return this.#left }
    set left(a) { if (this.#left !== a && a?.constructor === String && a.length > 1) { this.#left = a; this.emit('left') } }

    #right = '0KeyD'
    get right() { return this.#right }
    set right(a) { if (this.#right !== a && a?.constructor === String && a.length > 1) { this.#right = a; this.emit('right') } }

    #interact = '0KeyE'
    get interact() { return this.#interact }
    set interact(a) { if (this.#interact !== a && a?.constructor === String && a.length > 1) { this.#interact = a; this.emit('interact') } }

    #jump = '0Space'
    get jump() { return this.#jump }
    set jump(a) { if (this.#jump !== a && a?.constructor === String && a.length > 1) { this.#jump = a; this.emit('jump') } }

    #skill0 = '0Digit1'
    get skill0() { return this.#skill0 }
    set skill0(a) { if (this.#skill0 !== a && a?.constructor === String && a.length > 1) { this.#skill0 = a; this.emit('skill0') } }

    #skill1 = '0Digit2'
    get skill1() { return this.#skill1 }
    set skill1(a) { if (this.#skill1 !== a && a?.constructor === String && a.length > 1) { this.#skill1 = a; this.emit('skill1') } }

    #skill2 = '0Digit3'
    get skill2() { return this.#skill2 }
    set skill2(a) { if (this.#skill2 !== a && a?.constructor === String && a.length > 1) { this.#skill2 = a; this.emit('skill2') } }

    #skill3 = '0Digit4'
    get skill3() { return this.#skill3 }
    set skill3(a) { if (this.#skill3 !== a && a?.constructor === String && a.length > 1) { this.#skill3 = a; this.emit('skill3') } }

    #skill4 = '0Digit5'
    get skill4() { return this.#skill4 }
    set skill4(a) { if (this.#skill4 !== a && a?.constructor === String && a.length > 1) { this.#skill4 = a; this.emit('skill4') } }

    #skill5 = '0Digit6'
    get skill5() { return this.#skill5 }
    set skill5(a) { if (this.#skill5 !== a && a?.constructor === String && a.length > 1) { this.#skill5 = a; this.emit('skill5') } }

    #skill6 = '0Digit7'
    get skill6() { return this.#skill6 }
    set skill6(a) { if (this.#skill6 !== a && a?.constructor === String && a.length > 1) { this.#skill6 = a; this.emit('skill6') } }

    #menu = '0Tab'
    get menu() { return this.#menu }
    set menu(a) { if (this.#menu !== a && a?.constructor === String && a.length > 1) { this.#menu = a; this.emit('menu') } }

    toArray() {
        return [
            this.#up,
            this.#down,
            this.#left,
            this.#right,
            this.#interact,
            this.#jump,
            this.#skill0,
            this.#skill1,
            this.#skill2,
            this.#skill3,
            this.#skill4,
            this.#skill5,
            this.#skill6,
            this.#menu,
        ]
    }

    fromArray(array) {
        if (array?.constructor !== Array) return
        let i = 0
        this.up = array[i++]
        this.down = array[i++]
        this.left = array[i++]
        this.right = array[i++]
        this.interact = array[i++]
        this.jump = array[i++]
        this.skill0 = array[i++]
        this.skill1 = array[i++]
        this.skill2 = array[i++]
        this.skill3 = array[i++]
        this.skill4 = array[i++]
        this.skill5 = array[i++]
        this.skill6 = array[i++]
        this.menu = array[i++]
    }

    keys() {
        return [
            'up',
            'down',
            'left',
            'right',
            'interact',
            'jump',
            'skill0',
            'skill1',
            'skill2',
            'skill3',
            'skill4',
            'skill5',
            'skill6',
            'menu',
        ]
    }

    getActionNameFromKeyCode(code) {
        if (this.#up === code) return 'up'
        if (this.#down === code) return 'down'
        if (this.#left === code) return 'left'
        if (this.#right === code) return 'right'
        if (this.#interact === code) return 'interact'
        if (this.#jump === code) return 'jump'
        if (this.#skill0 === code) return 'skill0'
        if (this.#skill1 === code) return 'skill1'
        if (this.#skill2 === code) return 'skill2'
        if (this.#skill3 === code) return 'skill3'
        if (this.#skill4 === code) return 'skill4'
        if (this.#skill5 === code) return 'skill5'
        if (this.#skill6 === code) return 'skill6'
        if (this.#menu === code) return 'menu'
    }
}



