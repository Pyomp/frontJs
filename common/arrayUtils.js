export class ArrayUtils {
    /**
     * @param {*[]} array 
     * @param {*} element 
     * @returns {boolean}
     */
    static delete(array, element) {
        const index = array.indexOf(element)
        if (index === -1) return false
        array.splice(index, 1)
        return true
    }
}