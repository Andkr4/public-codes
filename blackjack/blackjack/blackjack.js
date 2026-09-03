let playerChips = {chips: 200}
const gameMessage = document.getElementById("message2-el")
const startText = document.getElementById("message-el");
const sumText = document.getElementById("sum-el");
const dealerSumText = document.getElementById("dealer-sum");
const cardsText = document.getElementById("cards-el");
const dealerCardsText = document.getElementById("dealer-cards");
const chipsText = document.getElementById("player-el");
const placedBet = document.getElementById("placed-bet")
const startBtn = document.getElementById("start-btn");
const hitBtn = document.getElementById("hit-btn");
const stayBtn = document.getElementById("stay-btn");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const betScreen = document.getElementById("bet-screen")
const gameOverScreen = document.getElementById("game-over-screen")
const newRoundBtn = document.getElementById("new-round");
const currentBetText = document.getElementById("current-bet")
const bettingChipsText = document.getElementById("betting-chips")
const bettingArea = document.getElementById("betting-area")
const betButton = document.getElementById("place-bet")
const clearBetBtn = document.getElementById("clear-bet")
const changeBetBtn = document.getElementById("change-bet")
const deckPile = document.getElementById("deck-pile")
const SPADE = "\u2660"
const HEART = "\u2665"
const DIAMOND = "\u2666"
const CLUB = "\u2663"
const suits = [SPADE, HEART, DIAMOND, CLUB]
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
let deck = createDeck()
shuffleDeck(deck)
let cards = []
let dealerCards = []
let placedChips = []
let currentBet = 0
let sum = 0
let dealerSum = 0
let hasBlackJack = false;
let isAlive = false;
let message = " "
chipsText.textContent = "Chips: $" + playerChips.chips
let dealerRevealed = false
let roundOver = false
let gameover = false

startScreen.style.display = "block"
gameScreen.style.display = "none"
newRoundBtn.style.display = "none"
changeBetBtn.style.display = "none"
betScreen.style.display = "none"
gameOverScreen.style.display = "none"

function pause(ms) {
    return new Promise (resolve => setTimeout(resolve, ms));
}

function startGame() {
    currentBet = 0
    placedChips = []
    startScreen.style.display = "none"
    gameScreen.style.display = "none"
    betScreen.style.display = "block"
    gameOverScreen.style.display = "none"
    renderBet()
}

function renderBet() {
    currentBetText.textContent = "Current Bet: $" + currentBet
    bettingChipsText.textContent = "Your Chips: $" + playerChips.chips

    bettingArea.innerHTML = ""

    for (let i = 0; i < placedChips.length; i++) {
        const chip = document.createElement("span")

        chip.classList.add("bet-chip", `bet-chip-${placedChips[i]}`)
        chip.textContent = "$" + placedChips[i]

        bettingArea.appendChild(chip)
    }
    if (currentBet < 5) {
        betButton.style.display = "none"
        clearBetBtn.style.display = "none"
    } else {
        betButton.style.display = "block"
        clearBetBtn.style.display = "block"
    }
}

function addBet(amount) {
    if (currentBet + amount > playerChips.chips) {
        return
    }
    currentBet += amount
    placedChips.push(amount)
    renderBet()
}

function clearBet() {
    currentBet = 0
    placedChips = []
    renderBet()
}

function betPlaced() {
    if (currentBet < 5 || currentBet > playerChips.chips) {
        renderBet()
        return
    }
    console.log("Cards available before deal:", deck.length)
    if (deck.length < 10) {
        deck = createDeck()
        shuffleDeck(deck)
    }
    startScreen.style.display = "none"
    gameScreen.style.display = "block"
    betScreen.style.display = "none"
    gameOverScreen.style.display = "none"
    hitBtn.style.display = "block"
    stayBtn.style.display = "block"
    isAlive = true;
    placedBet.textContent = "Current Bet: $" + currentBet
    let firstCard = drawCard();
    let secondCard = drawCard();
    let dealerFirstCard = drawCard();
    let dealerSecondCard = drawCard();
    roundOver = false
    dealerRevealed = false 
    cards = [firstCard, secondCard]
    sum = calculateHandValue(cards)
    dealerCards = [dealerFirstCard, dealerSecondCard]
    dealerSum = calculateHandValue(dealerCards)
    renderGame()
}

function renderGame() {
    sumText.textContent = "Sum: " + sum
    cardsText.innerHTML = ""

    for (let i = 0; i < cards.length; i++) {
        cardsText.appendChild(createCardElement(cards[i]))
    }
    if (!roundOver) {
        if (sum <= 20 && !dealerRevealed) {
            message = "Hit or Stay?"
        } else if (sum === 21) {
            dealerRevealed = true
            newRoundBtn.style.display = "block"
            changeBetBtn.style.display = "block"
            hitBtn.style.display = "none"
            stayBtn.style.display = "none"
            if (dealerSum === 21) {
                message = "Both have blackjack. Push"
            } else {
                message = "Blackjack! Player wins!"
                newRoundBtn.style.display = "block"
                changeBetBtn.style.display = "block"
                payOut("win")
            }
            hasBlackJack = true;
            isAlive = false
            roundOver = true
        } else {
            message = "sorry, you're out"
            payOut("lose")
            isAlive = false;
            roundOver = true
            hitBtn.style.display = "none"
            stayBtn.style.display = "none"
            handleGameOver()
        }
    }
    gameMessage.textContent = message
    dealerSumText.textContent = "Dealer Sum: ?"
    dealerCardsText.innerHTML = ""
    if (dealerRevealed) {
        for ( let i = 0; i < dealerCards.length; i++) {
            dealerCardsText.appendChild(createCardElement(dealerCards[i]))
        }
        dealerSumText.textContent = "Dealer Sum: " + dealerSum
    } else {
        dealerCardsText.appendChild(createCardElement(dealerCards[0]))
        const hiddenCard = document.createElement("div")
        hiddenCard.classList.add("playing-card", "card-back")
        dealerCardsText.appendChild(hiddenCard)
        dealerSumText.textContent = "Dealer Sum: ?"
    }
}

function createDeck() {
    const newDeck = []

    for (const suit of suits) {
        for (const rank of ranks) {
            const card = {
                rank: rank,
                suit: suit
            }
            newDeck.push(card)
        }
    }
    return newDeck
}

function createCardElement(card) {
    const cardEl = document.createElement("div")
    cardEl.classList.add("playing-card")

    if (card.suit === "HEART" || card.suit === "DIAMOND") {
        cardEl.classList.add("red")
    } else {
        cardEl.classList.add("black")
    }

    cardEl.innerHTML = `
        <div class="card-corner top">
            <span>${card.rank}</span>
            <span>${card.suit}</span>
        </div>

        <div class="card-center">${card.suit}</div>

        <div class="card-corner bottom">
            <span>${card.rank}</span>
            <span>${card.suit}</span>
        </div>
    `

    return cardEl
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i +1))

        const currentCard = deck[i]
        deck[i] = deck[randomIndex]
        deck[randomIndex] = currentCard
    }
}

function drawCard() {
    return deck.pop()
}

function animateDeal(targetElement) {
    return new Promise(resolve => {
        const deckRect = deckPile.getBoundingClientRect()
        const targetRect = targetElement.getBoundingClientRect()

        const flyingCard = document.createElement("div")
        flyingCard.classList.add("playing-card", "card-back", "flying-card")

        // No animation while placing it at the deck
        flyingCard.style.transition = "none"
        flyingCard.style.left = deckRect.left + "px"
        flyingCard.style.top = deckRect.top + "px"

        document.body.appendChild(flyingCard)

        // Force browser to actually place it at the deck first
        flyingCard.getBoundingClientRect()

        // Now turn animation on
        flyingCard.style.transition = "left 400ms ease, top 400ms ease"

        requestAnimationFrame(() => {
            flyingCard.style.left = targetRect.left + targetRect.width / 2 - deckRect.width / 2 + "px"
            flyingCard.style.top = targetRect.top + "px"
        })

        setTimeout(() => {
            flyingCard.remove()
            resolve()
        }, 450)
    })
}

function calculateHandValue(hand) {
    let total = 0
    let aceCount = 0

    for (const card of hand) {
        if (card.rank === "A") {
            total += 11
            aceCount++
        } else if (
            card.rank === "J" ||
            card.rank === "Q" ||
            card.rank === "K"
        ) {
            total += 10
        } else {
            total += Number(card.rank)
        }
    }
    while (total > 21 && aceCount > 0) {
        total -= 10
        aceCount--
    }
    return total
}

async function hit() {
    if (isAlive) {
        let card = drawCard();
        await animateDeal(cardsText)
        cards.push(card)
        sum = calculateHandValue(cards)
        renderGame()
    }

}

async function stay() {
    if (isAlive) {
        dealerRevealed = true
        roundOver = true
        isAlive = false

        hitBtn.style.display = "none"
        stayBtn.style.display = "none"
        newRoundBtn.style.display = "none"
        changeBetBtn.style.display = "none"

        message = "Dealer draws..."
        renderGame()

        while (dealerSum < 17) {
            let card = drawCard();
            await animateDeal(dealerCardsText)
            dealerCards.push(card)
            dealerSum = calculateHandValue(dealerCards)
            renderGame()
        }
        let bust = dealerSum > 21
        if (bust){
            message = "dealer busts, player wins"
            payOut("win")
        } else if (sum > dealerSum) {
            message = "player wins"
            payOut("win")
        } else if (dealerSum > sum) {
            message = "house wins"
            payOut("lose")
        } else if (dealerSum === sum) {
            message = "push"
        }
        renderGame()
        handleGameOver()
    }
}

function payOut(result) {
    if (result === "win") {
        playerChips.chips += currentBet
    } else if (result === "lose") {
        playerChips.chips -= currentBet
    }
    chipsText.textContent = "Chips: $" + playerChips.chips
}


function newRound() {
    cards = []
    dealerCards = []

    sum  = 0
    dealerSum = 0

    dealerRevealed = false
    roundOver = false

    newRoundBtn.style.display = "none"
    changeBetBtn.style.display = "none"
    hitBtn.style.display = "block"
    stayBtn.style.display = "block"
    betPlaced()
}
function changeBet() {
    cards = []
    dealerCards = []

    sum  = 0
    dealerSum = 0

    dealerRevealed = false
    roundOver = false

    newRoundBtn.style.display = "none"
    changeBetBtn.style.display = "none"
    hitBtn.style.display = "block"
    stayBtn.style.display = "block"
    startGame()
}

async function handleGameOver() {
       if (roundOver) {
           if (playerChips.chips < 5) {
               newRoundBtn.style.display = "none"
               changeBetBtn.style.display = "none"
               await pause(1500)
               gameOver()
               return
           }
           changeBetBtn.style.display = "block"
   
           if (currentBet > playerChips.chips) {
               newRoundBtn.style.display = "none"
           } else {
               newRoundBtn.style.display = "block"
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
            newRoundBtn.style.display = "none"
            changeBetBtn.style.display = "none"
            betScreen.style.display = "none"
            gameOverScreen.style.display = "none"
            playerChips.chips = 200
            chipsText.textContent = "Chips: $" + playerChips.chips
            
        });
}