import { EventChange } from '../../../modules/common/Events.js'
import {
    ACTION_INTERACT,
    ACTION_JUMP,
    ACTION_SKILL0,
    ACTION_SKILL1,
    ACTION_SKILL2,
    ACTION_SKILL3,
    ACTION_SKILL4,
    ACTION_SKILL5,
    ACTION_SKILL6,
} from '../actions.js'

function check(value) { return value?.constructor === String && value.length > 1 }

export class KeyCode extends EventTarget {
    #up = '0KeyW'
    get up() { return this.#up }
    set up(a) { if (this.#up !== a && check(a)) { this.#up = a; this.dispatchEvent(EventChange) } }

    #down = '0KeyS'
    get down() { return this.#down }
    set down(a) { if (this.#down !== a && check(a)) { this.#down = a; this.dispatchEvent(EventChange) } }

    #left = '0KeyA'
    get left() { return this.#left }
    set left(a) { if (this.#left !== a && check(a)) { this.#left = a; this.dispatchEvent(EventChange) } }

    #right = '0KeyD'
    get right() { return this.#right }
    set right(a) { if (this.#right !== a && check(a)) { this.#right = a; this.dispatchEvent(EventChange) } }

    #interact = '0KeyE'
    get [ACTION_INTERACT]() { return this.#interact }
    set [ACTION_INTERACT](a) { if (this.#interact !== a && check(a)) { this.#interact = a; this.dispatchEvent(EventChange) } }

    #jump = '0Space'
    get [ACTION_JUMP]() { return this.#jump }
    set [ACTION_JUMP](a) { if (this.#jump !== a && check(a)) { this.#jump = a; this.dispatchEvent(EventChange) } }

    #skill0 = '0Digit1'
    get [ACTION_SKILL0]() { return this.#skill0 }
    set [ACTION_SKILL0](a) { if (this.#skill0 !== a && check(a)) { this.#skill0 = a; this.dispatchEvent(EventChange) } }

    #skill1 = '0Digit2'
    get [ACTION_SKILL1]() { return this.#skill1 }
    set [ACTION_SKILL1](a) { if (this.#skill1 !== a && check(a)) { this.#skill1 = a; this.dispatchEvent(EventChange) } }

    #skill2 = '0Digit3'
    get [ACTION_SKILL2]() { return this.#skill2 }
    set [ACTION_SKILL2](a) { if (this.#skill2 !== a && check(a)) { this.#skill2 = a; this.dispatchEvent(EventChange) } }

    #skill3 = '0Digit4'
    get [ACTION_SKILL3]() { return this.#skill3 }
    set [ACTION_SKILL3](a) { if (this.#skill3 !== a && check(a)) { this.#skill3 = a; this.dispatchEvent(EventChange) } }

    #skill4 = '0Digit5'
    get [ACTION_SKILL4]() { return this.#skill4 }
    set [ACTION_SKILL4](a) { if (this.#skill4 !== a && check(a)) { this.#skill4 = a; this.dispatchEvent(EventChange) } }

    #skill5 = '0Digit6'
    get [ACTION_SKILL5]() { return this.#skill5 }
    set [ACTION_SKILL5](a) { if (this.#skill5 !== a && check(a)) { this.#skill5 = a; this.dispatchEvent(EventChange) } }

    #skill6 = '0Digit7'
    get [ACTION_SKILL6]() { return this.#skill6 }
    set [ACTION_SKILL6](a) { if (this.#skill6 !== a && check(a)) { this.#skill6 = a; this.dispatchEvent(EventChange) } }

    #menu = '0Tab'
    get menu() { return this.#menu }
    set menu(a) { if (this.#menu !== a && check(a)) { this.#menu = a; this.dispatchEvent(EventChange) } }

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
        this[ACTION_INTERACT] = array[i++]
        this[ACTION_JUMP] = array[i++]
        this[ACTION_SKILL0] = array[i++]
        this[ACTION_SKILL1] = array[i++]
        this[ACTION_SKILL2] = array[i++]
        this[ACTION_SKILL3] = array[i++]
        this[ACTION_SKILL4] = array[i++]
        this[ACTION_SKILL5] = array[i++]
        this[ACTION_SKILL6] = array[i++]
        this.menu = array[i++]
    }

    keys() {
        return [
            'up',
            'down',
            'left',
            'right',
            ACTION_INTERACT,
            ACTION_JUMP,
            ACTION_SKILL0,
            ACTION_SKILL1,
            ACTION_SKILL2,
            ACTION_SKILL3,
            ACTION_SKILL4,
            ACTION_SKILL5,
            ACTION_SKILL6,
            'menu',
        ]
    }

    getActionNameFromKeyCode(code) {
        if (this.#up === code) return 'up'
        if (this.#down === code) return 'down'
        if (this.#left === code) return 'left'
        if (this.#right === code) return 'right'
        if (this.#interact === code) return ACTION_INTERACT
        if (this.#jump === code) return ACTION_JUMP
        if (this.#skill0 === code) return ACTION_SKILL0
        if (this.#skill1 === code) return ACTION_SKILL1
        if (this.#skill2 === code) return ACTION_SKILL2
        if (this.#skill3 === code) return ACTION_SKILL3
        if (this.#skill4 === code) return ACTION_SKILL4
        if (this.#skill5 === code) return ACTION_SKILL5
        if (this.#skill6 === code) return ACTION_SKILL6
        if (this.#menu === code) return 'menu'
    }
}



