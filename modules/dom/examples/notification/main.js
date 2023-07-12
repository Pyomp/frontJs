import { notification } from "../../components/notification.js"

setInterval(() => {
    notification.push(`wow incredible ${Math.random()}`, `hsl(${Math.random() * 360}, 100%, 60%)`)
}, 500)

notification.push(`wow incredible ${Math.random()}`, `hsl(${Math.random() * 360}, 100%, 60%)`)
