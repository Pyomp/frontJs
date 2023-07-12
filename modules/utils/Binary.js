export function updateBit(initial, shift, value) {
    if (value) {
        return initial | (1 << shift)
    } else {
        return initial & (~(1 << shift))
    }
}