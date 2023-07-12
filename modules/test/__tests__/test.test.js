describe('Basic tests', () => {
    it('should fail when an error is thrown', () => { throw new Error('meh') })
})

describe('Object Value expect', () => {
    it('should pass the test when tested result is deeply equal to expected with only string (not only reference)', () => {
        expect({ string: 'string' }).toEqual({ string: 'string' })
    })
    it('should pass the test when tested result is deeply equal to expected with only null (not only reference)', () => {
        expect({ null: null }).toEqual({ null: null })
    })
    it('should pass the test when tested result is deeply equal to expected with only undefined (not only reference)', () => {
        expect({ undefined: undefined }).toEqual({ undefined: undefined })
    })
    it('should pass the test when tested result is deeply equal to expected with only object (not only reference)', () => {
        expect({ object: {} }).toEqual({ object: {} })
    })
    it('should pass the test when tested result is deeply equal to expected (not only reference)', () => {
        expect({ string: 'string', object: { null: null, undefined: undefined } })
            .toEqual({ string: 'string', object: { null: null, undefined: undefined } })
    })
})

describe('Promise function expect', () => {
    it('should pass the test when function to test is a Promise and reject a wanted error', async () => {
        const error = new Error('promise rejected')

        const functionToTest = () => Promise.reject(error)

        await expect(functionToTest).toBe(error)
    })
    
    
    it('should pass the test when function to test is a Promise and resolve a wanted object', async () => {
        const result = {}

        const functionToTest = () => Promise.resolve(result)
        
        await expect(functionToTest).toBe(result)
    })
})
