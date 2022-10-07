







export class FPSView {
    constructor(parent, updateFrame) {
        const container = document.createElement('div')

        const data = new Array(100)
        const update = (dt)=>{
            data.unshift(1/dt)
            data.length = 100
            container.innerHTML = `${(data.reduce((a,b)=>a+b) / 100).toFixed()}fps`
        }

        updateFrame.add(update)
        this.dispose = () => {
            updateFrame.delete(update)
            container.remove()
        }

        parent.appendChild(container)
    }
}











