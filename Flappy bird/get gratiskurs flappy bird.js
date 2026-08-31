console.log("js loaded");
window.addEventListener("load", () => {
    applyBirdPosition();
    applyPipePositions();
    background.classList.add("paused");
});
const bird = document.getElementById("bird");
const game = document.getElementById("game");
const pipe1 = document.getElementById("pipe1");
const pipe2 = document.getElementById("pipe2");
const pipe3 = document.getElementById("pipe3");
const background = document.querySelector(".moving-background");
const scoreCount = document.getElementById("scoreCount");
const highScoreCount = document.getElementById("highScoreCount");
const birdWidth = bird.offsetWidth;
const birdHeight = bird.offsetHeight;
const gameHeight = game.offsetHeight;
const gapSize = 300; // hvor stort mellomrom er det mellom top pipe og bottom pipe
const howToStart = document.getElementById("howToStart");
const howToRestart = document.getElementById("howToRestart");
let isRunning = false;
let birdX = 300;
let birdY = 300;
let velocityY = 0;
let gravity = 0.1;
let frames = 0;
let birdSpeedX = 0;
let hasStarted = false
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let pipes = [
    {
        element: pipe1, //hvilken pipe det er
        x: 800, // hvor den er på skjermen
        gapY: 200 // hvor åpningen starter.
        ,scored: false
    },
    {
        element: pipe2,
        x: 1400,
        gapY: 350
        ,scored: false
    },
    {
        element: pipe3,
        x: 1800,
        gapY: 250
        ,scored: false
    }
];

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !event.repeat) {
        if (!hasStarted) {
            hasStarted = true;
            howToStart.style.display = "none";
            start()
        }
        console.log("space pressed")
        velocityY = -5 ;
    }

    if (!isRunning && hasStarted && event.code == "Enter") {
        restart()
    }
});


function start() {
    isRunning = true
    gameLoop();
}

function restart() {
    howToRestart.style.display = "none";
    birdX = 300;
    birdY = 300;
    birdSpeedX = 0;
    velocityY = 0;
    pipes[0].x = 800;
    pipes[1].x = 1400;
    pipes[2].x = 1800;
    score = 0;
    scoreCount.textContent = "Score: 0";
    background.classList.remove("paused");
    hasStarted = true;
    isRunning = true
    start()
}

setInterval(() => {
    console.log("FPS:", frames);
    frames = 0;
}, 1000);

function applyBirdPosition() {
    bird.style.left = birdX + "px";
    bird.style.top = birdY + "px";
}

function gameLoop() {
    if (!isRunning) return;

    velocityY += gravity;

    updatePosition();

    if (!isRunning) return;

    updatePipePositions();

    updateScore();

    applyBirdPosition();
    applyPipePositions();

    checkCollision();

    if (!isRunning) return;

    frames++;
    requestAnimationFrame(gameLoop);
}

function updatePosition() {
    birdX += birdSpeedX;
    birdY += velocityY;

    let bottomY = birdY + birdHeight;
    if (bottomY >= gameHeight) {
        gameOver() 
        birdY = gameHeight - birdHeight;
    }
    if (birdY <= 0) { 
        birdY = 0;
    }
}

function updatePipePositions() {

    pipes.forEach(pipe => {

        pipe.x -= 3; // flytter pipe til venstre 3 pixeler hver frame

        if (pipe.x < -pipe.element.offsetWidth) { // har pipa forlatt skjermen?

            pipe.x = 1400; // hvor langt det er mellom hvert sett med 3 piper.
            pipe.scored = false;
            pipe.gapY = // lager et nytt mellomrom i den neste pipe sette som kommer, sånn at hvær pipe har forskjellige mellomrom og hvor de mellomrommene er
                Math.floor(Math.random() * 300) + 100; // math.random gir et random desimaltall mellom 0 og 1, så blir det tallet ganget med 300, math.floor fjerner alle desimaltall, så blir +100 langt til det tallet.
        }
    });
}

function updateScore() {
    pipes.forEach(pipe => {
        if (!pipe.scored && pipe.x + pipe.element.offsetWidth < birdX) {
            score++;
            pipe.scored = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
            scoreCount.textContent = "Score: " + score;
            highScoreCount.textContent = "High Score: " + highScore;
        }
    })
}


function applyPipePositions() {
    pipes.forEach(pipe => {

        pipe.element.style.left = pipe.x + "px"; //flytter pipe x (1, 2, 3) på skjermen.

        const topPipe = pipe.element.querySelector(".top-pipe"); //finner top-Pipe item fra HTML
        const bottomPipe = pipe.element.querySelector(".bottom-pipe"); //finner bottom-Pipe item fra HTML

        topPipe.style.height = pipe.gapY + "px"; // tar tallet gapY gir og gjør det om til høyden på top pipe i pixeler. 

        bottomPipe.style.height =
            (gameHeight - pipe.gapY - gapSize) + "px"; // velger hvor stor bottom pipe skal være basert på hvor stor gameHeight er - gapY verdien - gapSize. eksempel: gameHeigh=800 gapY=200 gapSize=300. 800-200-300=300 bottomPipe er 300px høy.
    });
}

function collision(birdX, birdY, birdWidth, birdHeight, pipeX, pipeY, pipeWidth, pipeHeight) {
    let birdRightX = birdX + birdWidth;
    let birdLeftX = birdX;
    let birdTopY = birdY;
    let birdBottomY = birdY + birdHeight;

    let pipeLeftX = pipeX;
    let pipeRightX = pipeX + pipeWidth;
    let pipeTopY = pipeY;
    let pipeBottomY = pipeY + pipeHeight;

    if (birdRightX <= pipeLeftX) return false;
    if (birdLeftX >= pipeRightX) return false;
    if (birdBottomY <= pipeTopY) return false;
    if (birdTopY >= pipeBottomY) return false;

    return true;
}

function checkCollision() {
    pipes.forEach(pipe => {
        const topPipe = pipe.element.querySelector(".top-pipe");
        const bottomPipe = pipe.element.querySelector(".bottom-pipe");

        const topPipeHeight = topPipe.offsetHeight;
        const bottomPipeHeight = bottomPipe.offsetHeight;

        let hitTopPipe = collision(
            birdX, birdY, birdWidth, birdHeight,
            pipe.x, 0, pipe.element.offsetWidth, topPipeHeight
        );

        let hitBottomPipe = collision(
            birdX, birdY, birdWidth, birdHeight,
            pipe.x, gameHeight - bottomPipeHeight, pipe.element.offsetWidth, bottomPipeHeight
        );

        if (hitTopPipe || hitBottomPipe) {
            isRunning = false;
            gameOver();
        }
    });
}
function gameOver() {
    isRunning = false;
    howToRestart.style.display = "block";
    background.classList.add("paused");
}