import { EventSet } from "../../../modules/utils/EventSet.js"

const onId = new EventSet()
let id = 0n

export const storeSettings = {
    onId,
    get id() { return id },
    set id(a) { if (id !== a && a > 0) { id = a; onId.emit() } },
}





