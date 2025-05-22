import { delay } from './delay.js'

export const exit = async () => {

    for (let i = 0; i < 3; i++){
        console.clear()
        console.log("\n Saindo.")
        await delay(250)
        console.clear()
        console.log("\n Saindo..");
        await delay(250)
        console.clear()
        console.log("\n Saindo...");
        await delay(250)
    }
}