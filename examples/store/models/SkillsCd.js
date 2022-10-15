export class SkillsCd {
    data = {}
    // update = (dt) => {
    //     for (const key in this.data) {
    //         data[key] -= dt
    //         if (data[key] <= 0) delete data[key]
    //     }
    // }

    toObject() { return this.data }

    fromObject(a) {
        if (a?.constructor !== Object) return
        for (const key in a) {
            const cd = a[key]
            if (Number.isInteger(+key) === true && Number.isFinite(cd)) {
                this.data[key] = cd
            }
        }
    }
}

