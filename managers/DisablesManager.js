
export class DisablesManager {
    disabled = false

    constructor() {
        super()
        const disable_map = new Map()

        const update = () => {
            this.disabled = false
            for (const bool of disable_map.values()) {
                if (bool === true){
                    this.disabled = true
                    break
                }
            }   
        }

        this.createDisabler = (object) => {
            disable_map.set(object, false)
            return (boolean) => {
                disable_map.set(object, boolean)
                update()
            }
        }
    }
}








