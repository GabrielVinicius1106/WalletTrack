export const delay = async (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms)
})

export const loading = async (message) => {
    for(let i = 0; i < 3; i++){
        console.clear()
        console.log(`\n ${message}.\n`);
        await delay(250)
        console.clear()
        console.log(`\n ${message}..\n`);
        await delay(250)
        console.clear()
        console.log(`\n ${message}...\n`);
        await delay(250)
    }
}