
document.title = `Memory Blocks Game | Interactive Card Matching Game`;

const splashScreen = document.querySelector('.control-buttons');
const nameHint = document.querySelector('.control-buttons .hint')
const StartGameBtn = document.getElementById('StartGameBtn');
const playerNameInput = document.getElementById('playerName');
const victoryModal = document.getElementById('victoryModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const difficultySelect = document.getElementById('difficultySelect');

const duration = 1000;
const blocksContainer = document.querySelector('.memory-game-blocks');
let blocks = [];
let currentDifficulty = 'medium';

// timer variables
let timerInterval = null;
let timeLeft = 0;

const correctSound = document.getElementById('correct');
const wrongSound = document.getElementById('wrong');
const clickSound = document.getElementById('click');
const endGameSound = document.getElementById('endGame');

const cardsData = [
    { name: 'angular', icon: 'fa-brands fa-angular' },
    { name: 'vuejs', icon: 'fa-brands fa-vuejs' },
    { name: 'css', icon: 'fa-brands fa-css' },
    { name: 'github', icon: 'fa-brands fa-github' },
    { name: 'gulp', icon: 'fa-brands fa-gulp' },
    { name: 'html5', icon: 'fa-brands fa-html5' },
    { name: 'cowboy', icon: 'fa-solid fa-hat-cowboy' },
    { name: 'robot', icon: 'fa-solid fa-robot' },
    { name: 'python', icon: 'fa-brands fa-python' },
    { name: 'react', icon: 'fa-brands fa-react' }
];

const difficultyConfig = {
    easy: {pairs: 6, time: 45},    // 6 pairs
    medium: {pairs: 8, time: 60},  // 8 pairs
    hard: {pairs: 10, time: 75}    // 10 pairs
};

function createCards() {
    blocksContainer.innerHTML = '';
    blocksContainer.className += `${currentDifficulty}`;

    const pairsCount = difficultyConfig[currentDifficulty] || difficultyConfig.medium;
    const selectedCards = cardsData.slice(0, pairsCount.pairs);

    //Duplicate each card
    const gameItems = [...selectedCards, ...selectedCards];
    gameItems.forEach(item => {
        const block = document.createElement('div');
        block.classList.add('game-block');
        block.dataset.technology = item.name;

        block.innerHTML = `
        <div class="face front"></div>
        <div class="face back">
            <i class="${item.icon}"></i>
        </div>
        `;

        blocksContainer.appendChild(block);
    });

    blocks = Array.from(blocksContainer.children);
}

function initGame() {
    createCards();

    const orderRangeArray = Array.from(blocks.keys())
    shuffleArray(orderRangeArray);

    blocks.forEach((block, index) => {
        block.style.order = orderRangeArray[index];
        block.classList.remove('is-clicked', 'matched');
        block.onclick = () => whenClickBox(block)
    })
}

StartGameBtn.addEventListener('click', startGame)
playerNameInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') startGame();
})


function startGame() {
    const enteredName = playerNameInput.value.trim();
    if(!enteredName) {
        nameHint.style.display = 'block';
        return;
    }
    const nameArea = document.querySelector('.name > span');
    nameArea.innerHTML = enteredName;

    currentDifficulty = difficultySelect.value;
    document.querySelector('.currentLevelDisplay span').innerText = currentDifficulty;

    initGame();

    splashScreen.style.display = 'none';
    boxAnimation();

    // Quick peek duration
    blocks.forEach(block => block.classList.add('is-clicked'));
    setTimeout(() => {
        blocks.forEach(block => block.classList.remove('is-clicked'));
        startTimer(); // Start timer after initial peek
    }, duration * 2);

    stopClicking(duration * 2);
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = difficultyConfig[currentDifficulty].time;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleGameOver();
        }
    }, 1000)
}

function updateTimerDisplay() {
    const timerSpan = document.querySelector('.timer span');
    if(timerSpan) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerSpan.innerHTML = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

function stopTimer() {
    clearInterval(timerInterval);
}

function handleGameOver() {
    blocksContainer.style.pointerEvents = 'none';
    wrongSound.play();
    alert('Time is up! Game Over.');
    
    // Show start screen again
    splashScreen.style.display = 'flex';
}

playAgainBtn.addEventListener('click', () => {
    victoryModal.style.display = 'none';
    document.querySelector('.tries span').innerHTML = 0;
    blocksContainer.style.pointerEvents = 'auto';

    splashScreen.style.display = 'flex';

})

function boxAnimation() {
    const frontFaces = document.querySelectorAll('.front');
    const loopDelay = 2000;

    frontFaces.forEach(face => {
        function triggerAnimation() {
            face.classList.add('animation');
        }

        face.addEventListener('animationend', () => {
            face.classList.remove('animation');
            setTimeout(triggerAnimation, loopDelay);
        });

        triggerAnimation();
    });
}

// Knuth Shuffle
function shuffleArray(array) {
    for(let ind = array.length - 1; ind > 0; ind--) {
        const randomIndex = Math.floor(Math.random() * (ind + 1));
        [array[ind], array[randomIndex]] = [array[randomIndex], array[ind]];
    }
    return array
}

function whenClickBox(clickedBox) {
    
    if(clickedBox.classList.contains('matched') || clickedBox.classList.contains('is-clicked')) return;
    
    clickedBox.classList.add('is-clicked');
    clickSound.play();

    let allOpenedBox = blocks.filter(block => block.classList.contains('is-clicked'))

    if(allOpenedBox.length === 2) {
        stopClicking()
        checkResults(allOpenedBox[0], allOpenedBox[1]);
    }
}

function stopClicking(timeout = duration) {
    blocksContainer.style.pointerEvents = 'none';

    setTimeout(() => {
        blocksContainer.style.pointerEvents = 'auto';
    }, timeout);
}

function checkResults(block_1, block_2) {
    const tries = document.querySelector('.tries span');

    if (block_1.dataset.technology === block_2.dataset.technology) {
        // MATCH FOUND
        block_1.classList.remove('is-clicked');
        block_2.classList.remove('is-clicked');

        block_1.classList.add('matched');
        block_2.classList.add('matched');

        correctSound.play();
        checkForGameEnd(); 
    } else {
        // NO MATCH
        tries.innerHTML = parseInt(tries.innerHTML) + 1;
        block_1.classList.add('is-wrong');
        block_2.classList.add('is-wrong');
        setTimeout(() => {
            block_1.classList.remove('is-clicked', 'is-wrong');
            block_2.classList.remove('is-clicked', 'is-wrong');
            wrongSound.play();
        }, 700);
    }
}

function checkForGameEnd() {
    // Find all blocks that have the 'matched' class
    const matchedBlocks = blocks.filter(block => block.classList.contains('matched'));

    // If the number of matched blocks equals the total number of blocks, the game is over
    if (matchedBlocks.length === blocks.length) {
        stopTimer();
        endGameSound.play();
        blocksContainer.style.pointerEvents = 'none';

        const totalTime = difficultyConfig[currentDifficulty].time;
        const timeSpend = totalTime - timeLeft;
        const minutes = Math.floor(timeSpend / 60);
        const seconds = timeSpend % 60;
        const formattedTime = minutes > 0 
            ? `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s` 
            : `${seconds}s`;

        // Trigger Confetti Effect
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        setTimeout(() => {
            document.getElementById('finalPlayerName').innerText = document.querySelector('.name > span').innerText;
            document.getElementById('finalDifficulty').innerText = currentDifficulty;
            document.getElementById('finalTimeTaken').innerText = formattedTime;
            document.getElementById('finalWrongTries').innerText = document.querySelector('.tries span').innerText;
            victoryModal.style.display = 'flex';
        }, 800);

    }
}

