import { EventSet } from '../models/Events.js'

export const ACTION_UP = 0
export const ACTION_DOWN = 1
export const ACTION_LEFT = 2
export const ACTION_RIGHT = 3
export const ACTION_INTERACT = 4
export const ACTION_JUMP = 5
export const ACTION_0 = 6
export const ACTION_1 = 7
export const ACTION_2 = 8
export const ACTION_3 = 9
export const ACTION_4 = 10
export const ACTION_5 = 11
export const ACTION_6 = 12
export const ACTION_MENU = 13

function check(value) { return value?.constructor === String && value.length > 1 }

let up = '0KeyZ'
let down = '0KeyS'
let left = '0KeyQ'
let right = '0KeyD'
let interact = '0KeyF'
let jump = '0Space'
let action0 = '0Digit1'
let action1 = '0Digit2'
let action2 = '0Digit3'
let action3 = '0Digit4'
let action4 = '0Digit5'
let action5 = '0Digit6'
let action6 = '0Digit7'
let menu = '0Tab'

const onChange = new EventSet()

const keycodeToAction = {}
function updateKeycodeToAction() {
    for (const key in keycodeToAction) delete keycodeToAction[key]
    
    keycodeToAction[up] = ACTION_UP
    keycodeToAction[down] = ACTION_DOWN
    keycodeToAction[left] = ACTION_LEFT
    keycodeToAction[right] = ACTION_RIGHT

    keycodeToAction[interact] = ACTION_INTERACT
    keycodeToAction[jump] = ACTION_JUMP
    keycodeToAction[menu] = ACTION_MENU

    keycodeToAction[action0] = ACTION_0
    keycodeToAction[action1] = ACTION_1
    keycodeToAction[action2] = ACTION_2
    keycodeToAction[action3] = ACTION_3
    keycodeToAction[action4] = ACTION_4
    keycodeToAction[action5] = ACTION_5
    keycodeToAction[action6] = ACTION_6
}

onChange.add(updateKeycodeToAction)

export const storeKeyCode = {
    onChange,

    get keycodeToAction() { return keycodeToAction },

    get [ACTION_UP]() { return up },
    set [ACTION_UP](a) { if (up !== a && check(a)) { up = a; onChange.emit() } },

    get [ACTION_DOWN]() { return down },
    set [ACTION_DOWN](a) { if (down !== a && check(a)) { down = a; onChange.emit() } },

    get [ACTION_LEFT]() { return left },
    set [ACTION_LEFT](a) { if (left !== a && check(a)) { left = a; onChange.emit() } },

    get [ACTION_RIGHT]() { return right },
    set [ACTION_RIGHT](a) { if (right !== a && check(a)) { right = a; onChange.emit() } },

    get [ACTION_INTERACT]() { return interact },
    set [ACTION_INTERACT](a) { if (interact !== a && check(a)) { interact = a; onChange.emit() } },

    get [ACTION_JUMP]() { return jump },
    set [ACTION_JUMP](a) { if (jump !== a && check(a)) { jump = a; onChange.emit() } },

    get [ACTION_0]() { return action0 },
    set [ACTION_0](a) { if (action0 !== a && check(a)) { action0 = a; onChange.emit() } },

    get [ACTION_1]() { return action1 },
    set [ACTION_1](a) { if (action1 !== a && check(a)) { action1 = a; onChange.emit() } },

    get [ACTION_2]() { return action2 },
    set [ACTION_2](a) { if (action2 !== a && check(a)) { action2 = a; onChange.emit() } },

    get [ACTION_3]() { return action3 },
    set [ACTION_3](a) { if (action3 !== a && check(a)) { action3 = a; onChange.emit() } },

    get [ACTION_4]() { return action4 },
    set [ACTION_4](a) { if (action4 !== a && check(a)) { action4 = a; onChange.emit() } },

    get [ACTION_5]() { return action5 },
    set [ACTION_5](a) { if (action5 !== a && check(a)) { action5 = a; onChange.emit() } },

    get [ACTION_6]() { return action6 },
    set [ACTION_6](a) { if (action6 !== a && check(a)) { action6 = a; onChange.emit() } },

    get [ACTION_MENU]() { return menu },
    set [ACTION_MENU](a) { if (menu !== a && check(a)) { menu = a; onChange.emit() } },

    toArray() {
        return [
            up, down, left, right,
            interact, jump,
            action0,
            action1,
            action2,
            action3,
            action4,
            action5,
            action6,
            menu,
        ]
    },

    fromArray(array) {
        if (array?.constructor !== Array) return
        let i = 0
        this[ACTION_UP] = array[i++]
        this[ACTION_DOWN] = array[i++]
        this[ACTION_LEFT] = array[i++]
        this[ACTION_RIGHT] = array[i++]
        this[ACTION_INTERACT] = array[i++]
        this[ACTION_JUMP] = array[i++]
        this[ACTION_0] = array[i++]
        this[ACTION_1] = array[i++]
        this[ACTION_2] = array[i++]
        this[ACTION_3] = array[i++]
        this[ACTION_4] = array[i++]
        this[ACTION_5] = array[i++]
        this[ACTION_6] = array[i++]
        this[ACTION_MENU] = array[i++]
    },

    keys: [
        ACTION_UP,
        ACTION_DOWN,
        ACTION_LEFT,
        ACTION_RIGHT,
        ACTION_INTERACT,
        ACTION_JUMP,
        ACTION_0,
        ACTION_1,
        ACTION_2,
        ACTION_3,
        ACTION_4,
        ACTION_5,
        ACTION_6,
        ACTION_MENU,
    ],
}



