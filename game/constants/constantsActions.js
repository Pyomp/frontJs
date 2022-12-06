export const ACTION_INTERACT = 0
export const ACTION_JUMP = 1
export const ACTION_0 = 2
export const ACTION_1 = 3
export const ACTION_2 = 4
export const ACTION_3 = 5
export const ACTION_4 = 6
export const ACTION_5 = 7
export const ACTION_6 = 8

export const ACTION_UP = 1000
export const ACTION_DOWN = 1001
export const ACTION_LEFT = 1002
export const ACTION_RIGHT = 1003
export const ACTION_MENU = 1004

export const ActionToBinary = {
    [ACTION_INTERACT]: 1 << 0,
    [ACTION_JUMP]: 1 << 1,
    [ACTION_0]: 1 << 2,
    [ACTION_1]: 1 << 3,
    [ACTION_2]: 1 << 4,
    [ACTION_3]: 1 << 5,
    [ACTION_4]: 1 << 6,
    [ACTION_5]: 1 << 7,
    [ACTION_6]: 1 << 8,
}