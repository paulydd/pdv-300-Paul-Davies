let inputArray = [12,2,3,4,5,6]

function RollTheDice(inputArray: number[]): number[] {
    const DiceOut: number[] = []
    for (let i = 0; i < inputArray.length; i++) {
        let randomNumber = Math.ceil(Math.random() * inputArray[i])
        DiceOut.push(randomNumber)
    }

    return DiceOut
}
const DiceOutput = RollTheDice(inputArray)
console.log(DiceOutput)
