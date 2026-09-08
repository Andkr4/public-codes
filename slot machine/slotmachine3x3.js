const creditsText = document.getElementById("player-el")
const placedBet = document.getElementById("placed-bet")
const startBtn = document.getElementById("start-btn")

const startScreen = document.getElementById("start-screen")
const gameScreen = document.getElementById("game-screen")
const gameOverScreen = document.getElementById("game-over-screen")
const newSpinBtn = document.getElementById("new-spin");
const changeBetBtn = document.getElementById("change-bet")
const betScreen = document.getElementById("bet-screen")
const currentBetText = document.getElementById("current-bet")
const bettingCreditsText = document.getElementById("betting-credits")
const betButton = document.getElementById("place-bet")
const clearBetBtn = document.getElementById("clear-bet")
const gameMessage = document.getElementById("message2-el")
const spinBtn = document.getElementById("spin-btn")
const reel1 = document.getElementById("reel-1")
const reel2 = document.getElementById("reel-2")
const reel3 = document.getElementById("reel-3")

const ORANGE = "\u{1F34A}"
const CHERRY = "\u{1F352}"
const LEMON = "\u{1F34B}"
const BELL = "\u{1F514}"
const SLOT = "\u{1F3B0}"

const symbols = [
    {symbol: ORANGE, weight: 30},
    {symbol: CHERRY, weight: 25},
    {symbol: LEMON, weight: 20},
    {symbol: BELL, weight: 15},
    {symbol: SLOT, weight: 10}
]
const payOutMultiplier = {
    [ORANGE]: {
        3:1
    },
    [CHERRY]: {
        3: 2
    },

    [LEMON]: {
        3: 4
    },

    [BELL]: {
        3: 8
    },

    [SLOT]: {
        3: 16
    }
}
const JackPotMultiplier = 100

let playerCredits = {credits:200}
let currentBet = 0
let message = " "
creditsText.textContent = "Credits: $" + playerCredits.credits
let isSpinning = false
let isAlive = false
let roundOver = false
let gameover = false

startScreen.style.display = "block"
gameScreen.style.display = "none"
betScreen.style.display = "none"
newSpinBtn.style.display = "none"
spinBtn.style.display = "none"
changeBetBtn.style.display = "none"
gameOverScreen.style.display = "none"
function pause(ms) {
    return new Promise (resolve => setTimeout(resolve, ms));
}

function startGame() {
    currentBet = 0

    startScreen.style.display = "none"
    gameScreen.style.display = "none"
    betScreen.style.display = "block"
    gameOverScreen.style.display = "none"

    renderBet()
}


function renderBet() {
    currentBetText.textContent = "Current Bet: $" + currentBet
    bettingCreditsText.textContent = "Your Credits: $" + playerCredits.credits
    if (currentBet < 5) {
        betButton.style.display = "none"
        clearBetBtn.style.display = "none"
    } else {
        betButton.style.display = "block"
        clearBetBtn.style.display = "block"
    }
}


function addBet(amount) {
    if (currentBet + amount > playerCredits.credits) {
        return
    }

    currentBet += amount
    renderBet()
}


function clearBet() {
    currentBet = 0
    renderBet()
}


function betPlaced() {
    if (currentBet < 5 || currentBet > playerCredits.credits) {
        renderBet()
        return
    }

    startScreen.style.display = "none"
    betScreen.style.display = "none"
    gameScreen.style.display = "block"
    gameOverScreen.style.display = "none"

    placedBet.textContent = "Current Bet: $" + currentBet
    isAlive = true
    roundOver = false
    renderGame()
}

function renderGame() {
    spinBtn.style.display = "block"
    if (roundOver) {
        newSpinBtn.style.display = "block"
        changeBetBtn.style.display = "block"
        spinBtn.style.display = "none"
    }
    
    gameMessage.textContent = message

    // later:
    // update reels
    // update win amount
    // update buttons

}
function randomSymbol() {
    const totalWeight = symbols.reduce((total, item) => { // adds all the weight values together,
        return total + item.weight
    }, 0) 
    let random = Math.random() * totalWeight // generates a number between 0 and max combined weight. rn: max combined weight = 100

    for (const item of symbols) { // creates ranges for each weight up to the max combined weight current max combined weight = 100. 0-40 = 🍒, 40-70 = 🍋, 70-90 = 🔔, 90-100 = 🎰.
        random -= item.weight // checks random number for exs. 63, starts at first symbol, 63-40=23. since the number is not below 0, it moves on to next symbol, 23-30 = -7. simple human logic: which range is the random number in

        if (random < 0) { // is the value after last subtraction more than 0? if no, loop checks next symbol. if not? continue to next line.
            return item.symbol // if value is below 0 it returns the last symbol it checked. 
        }
    }
}


async function spin() {
    if (isSpinning) {
        return
    }

    isSpinning = true
    spinBtn.disabled = true
    playerCredits.credits -= currentBet
    creditsText.textContent = "Credits: $" + playerCredits.credits


    const result = [
        [
            randomSymbol(),
            randomSymbol(),
            randomSymbol()
        ],
        [
            randomSymbol(),
            randomSymbol(),
            randomSymbol()
        ],
        [
           randomSymbol(),
           randomSymbol(),
           randomSymbol() 
        ]
    ]

    await Promise.all([
        animateReel(reel1, result[0], 3000),
        animateReel(reel2, result[1], 3500),
        animateReel(reel3, result[2], 4000),
    ])


    console.log("Reels stopped:", result)

    isSpinning = false
    spinBtn.disabled = false

    roundOver = true
    const wins = checkWin(result)
    spinBtn.style.display = "none"
    newSpinBtn.style.display = "block"
    changeBetBtn.style.display = "block"
    payOut(wins, result)
    handleGameOver()
}



function animateReel(reel, finalSymbols, duration) {
    return new Promise(resolve => { // starts a promise of how long the function shall run

        const AllCurrentSymbols =
            reel.querySelectorAll(".reel-symbol") // grabs every symbol inside the current reel

        const currentSymbols = 
            Array.from(AllCurrentSymbols) // turns the quarySelectorAll list from HTML to JS 
                .slice(-3) // gives the last 3 items in that list
                .map(symbol => symbol.textContent) // extracts the textContent from each symbol given by slice

        const reelSymbols = [...currentSymbols]

        
        for (let i = 0; i < 20; i++) { // makes an array of all the symbols that will fly past
            reelSymbols.push(randomSymbol())
        }

        
        reelSymbols.push(...finalSymbols) // puts the predetermined result at the end of the array


        const reelStrip = document.createElement("div") // creates <div class="reel-strip"></div> in JS memory
        reelStrip.classList.add("reel-strip")


        for (const symbol of reelSymbols) {
            const symbolElement = document.createElement("div") // makes <div class="reel-symbol"></div>

            symbolElement.classList.add("reel-symbol")
            symbolElement.textContent = symbol //adds emoji to the above <div> <div class="reel-symbol">🍒</div>

            reelStrip.appendChild(symbolElement) // adds all the "reel symbol" div's to the "reel reelStrip" div for a nice list.
        }


        reel.innerHTML = "" // removes the contents of the current reel
        reel.appendChild(reelStrip) // puts in the newly made reel


        
        reelStrip.getBoundingClientRect() // makes sure the browser renders the starting position first

        const symbolHeight  =
            reelStrip.querySelector(".reel-symbol").clientHeight // moves the reel by 1 symbol height at a time.

        const distance =  
            (reelSymbols.length - 3) * symbolHeight //calculates how far the reelStrip needs to move to get through the whole list


        reelStrip.style.transition =
            `transform ${duration}ms cubic-bezier(0.15, 0.7, 0.2, 1)` // the actual spinning animation, how long it lasts. cubic-bezier controls the acceleration/deceleration.

        reelStrip.style.transform =
            `translateY(-${distance}px)`// the thing that actually moves the animation, how far it moves.


        setTimeout(() => {
            resolve() // upholds the promise 
        }, duration)
    })
}

const payLines = [
    [0, 0, 0], //top
    [1, 1, 1], // middle
    [2, 2, 2], // bottom
    [0, 1, 2], // left to right down
    [2, 1, 0], // right to left up
]
function checkWin(result) {
    const wins =[]

    for (const line of payLines) {
        const symbol1 = result[0][line[0]]
        const symbol2 = result[1][line[1]]
        const symbol3 = result[2][line[2]]

        if (
            symbol1 === symbol2 && symbol2 === symbol3
        ){
            wins.push({
                symbol:symbol1,
                matches: 3,
                line: line
            })
        }
    }

    return wins
}


function payOut(wins, result) {
    
    if (wins.length === 0) {
        message = "LOOSER"
    }
    
    else if (checkJackpot(result)) {
        const winnings = currentBet * JackPotMultiplier

        playerCredits.credits += winnings
        message = "JACKPOT"
    }
    
    else {
        let totalWinnings = 0
        
        for (const win of wins) {
            const multiplier = payOutMultiplier[win.symbol][win.matches]
            totalWinnings += currentBet * multiplier
        }
        playerCredits.credits += totalWinnings
        message = "WINNER"
    }
    
    creditsText.textContent = "Credits: $" + playerCredits.credits
    gameMessage.textContent = message
}

function checkJackpot(result) {
    const firstSymbol = result[0][0]

    return result.every(reel => 
        reel.every(symbol => symbol === firstSymbol)
    )
}

function newSpin() {
    console.log("newSpin button pressed")
    roundOver = false

    spinBtn.style.display = "block"
    newSpinBtn.style.display = "none"
    changeBetBtn.style.display = "none"
    spin()
    message = " "
    gameMessage.textContent = message
}
function changeBet() {
    console.log("changeBet button pressed")
    roundOver = false

    newSpinBtn.style.display = "none"
    changeBetBtn.style.display = "none"
    startGame()
}

async function handleGameOver() {
       if (roundOver) {
           if (playerCredits.credits < 5) {
               newSpinBtn.style.display = "none"
               changeBetBtn.style.display = "none"
               await pause(1500)
               gameOver()
               return
           }
           changeBetBtn.style.display = "block"
   
           if (currentBet > playerCredits.credits) {
               newSpinBtn.style.display = "none"
           } else {
               newSpinBtn.style.display = "block"
           }
       }
}

function gameOver() {
        startScreen.style.display = "none"
        betScreen.style.display = "none"
        gameScreen.style.display = "none"
        gameOverScreen.style.display = "block"
        console.log("game over called")
        pause(1500).then(() => {
            console.log("pause called")
            gameover = false
            startScreen.style.display = "block"
            gameScreen.style.display = "none"
            newSpinBtn.style.display = "none"
            changeBetBtn.style.display = "none"
            betScreen.style.display = "none"
            gameOverScreen.style.display = "none"
            playerCredits.credits = 200
            creditsText.textContent = "credits: $" + playerCredits.credits
            
        });
}