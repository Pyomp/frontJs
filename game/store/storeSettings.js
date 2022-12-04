import { EventSet } from "../../models/Events.js"

const onId = new EventSet()
let id = 0

export const storeSettings = {
    onId,
    get id() { return id },
    set id(a) { if (id !== a && Number.isInteger(a) && a > 0) { id = a; onId.emit() } },
}





