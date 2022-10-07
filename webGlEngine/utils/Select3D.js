
        const obj3D_to_check = []
        const on_canvas_cb = []
        this.obj3D_delete_click = (obj3D) => {
            const index = obj3D_to_check.indexOf(obj3D)
            if (index === -1) return
            obj3D_to_check.splice(index, 1)
            on_canvas_cb.splice(index, 1)
        }
        this.obj3D_add_click = (obj3D, cb) => {
            if (obj3D_to_check.includes(obj3D) === true) return
            obj3D_to_check.push(obj3D)
            on_canvas_cb.push(cb)
        }

        const raycaster = new Raycaster()
        const pointer = new Vector2()

        const on_obj3D_click = (event) => {
            pointer.x = (event.clientX / innerWidth) * 2 - 1
            pointer.y = - (event.clientY / innerHeight) * 2 + 1
            raycaster.setFromCamera(pointer, camera)
            const intersects = raycaster.intersectObjects(obj3D_to_check, false)
            if (intersects?.[0]) {
                const index = obj3D_to_check.indexOf(intersects[0].object)
                on_canvas_cb[index]()
                return true
            }
        }