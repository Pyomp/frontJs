export const testServiceTest = {
    function1() {
        throw new Error('This function should be mocked!')
    },
    functionWith2Args(arg1, arg2) {
        throw new Error('This function should be mocked!')
    }
}
export default testServiceTest
