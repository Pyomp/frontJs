export const geometryScale = (array, x, y, z) => {
    const l = array.length / 3
    for (let i = 0; i < l; i++) {
        array[i * 3] *= x
        array[i * 3 + 1] *= y
        array[i * 3 + 2] *= z
    }
}
