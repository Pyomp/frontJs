import { testUtils } from "../testUtils.js"
import testServiceTest from "./service.js"

describe('Mock utils', () => {
    it('should test the callCount of the mock', () => {
        const mockedTestServiceTest = testUtils.mock(testServiceTest)
        testServiceTest.function1()
        expect(mockedTestServiceTest.function1.callCount).toBe(1)
    })

    it('should test the callArgs of the mock', () => {
        const mockedTestServiceTest = testUtils.mock(testServiceTest)
        testServiceTest.functionWith2Args('yep', 1234)
        expect(mockedTestServiceTest.functionWith2Args.callArgs[0]).toBe(['yep', 1234])
    })
})
