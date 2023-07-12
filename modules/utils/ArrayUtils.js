export const ArrayUtils = {
    
    /**
     * @param {*[]} array 
     * @param {*} element 
     * @returns {boolean}
     */
    delete(array, element) {
        const index = array.indexOf(element)
        if (index === -1) return false
        array.splice(index, 1)
        return true
    },

    /** @param {*[]} array */
    getRandom(array) {
        return array[Math.floor(array.length * Math.random())]
    }
}
