
document.title = `Memory Blocks Game`;

const splashScreen = document.querySelector('.control-buttons');
const splashScreenBtn = document.querySelector('.control-buttons span');
const duration = 1000;
const blocksContainer = document.querySelector('.memory-game-blocks');
const blocks = Array.from(blocksContainer.children);
const correctSound = document.getElementById('correct');
const wrongSound = document.getElementById('wrong');
const clickSound = document.getElementById('click');
const endGameSound = document.getElementById('endGame');

// 1. Initial Setup (Shuffling and Event Listeners)

const orderRangeArray = Array.from(blocks.keys());

shuffleArray(orderRangeArray);

blocks.forEach((block, index) => {
    // Apply the shuffled order to the CSS 'order' property for random positioning
    block.style.order = orderRangeArray[index];

    // Attach the main click handler to each block
    block.addEventListener('click', () => {
        whenClickBox(block);
    });
});

// 2. Splash Screen Logic and Game Start

splashScreenBtn.addEventListener('click', () => {
    // Get user name and update display
    let yourName = prompt('Whats Your Name ?');
    const nameSpan = document.querySelector('.name > span');
    nameSpan.innerHTML = (yourName && yourName.trim() !== '') ? yourName.trim() : 'Unknown';

    // Remove the splash screen
    splashScreen.remove();

    // Start the game-specific animation and block reveal
    boxAnimation();
    
    // TEMPORARY: Flip all blocks for 'duration' time to let the player see the layout
    blocks.forEach(block => block.classList.add('is-clicked'));

    // Revert the blocks after the duration time
    setTimeout(() => {
        blocks.forEach(block => block.classList.remove('is-clicked'));
    }, duration * 2); // Give a bit more time than 'duration' for the initial peek

    // Disable clicking briefly after the splash screen is removed
    stopClicking(duration * 2);
});

function boxAnimation() {
    const frontFaces = document.querySelectorAll('.front');
    const loopDelay = 2000;
    function startAnimation() {
        frontFaces.forEach( (face) => face.classList.add('animation') )
    }
    frontFaces.forEach( (f) => {
        f.addEventListener('animationend', () => {
            f.classList.remove('animation'); // reset animation
            setTimeout(startAnimation, loopDelay); // delay before next loop
        });
    } );
    // start first animation
    startAnimation();
}

// 3. Core Game Functions

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
        
        // CHECK FOR GAME END
        checkForGameEnd(); 
    } else {
        // NO MATCH
        tries.innerHTML = parseInt(tries.innerHTML) + 1;
        setTimeout(() => {
            block_1.classList.remove('is-clicked');
            block_2.classList.remove('is-clicked');
            wrongSound.play();
        }, duration);
    }
}

function whenClickBox(clickedBox) {

    clickedBox.classList.add('is-clicked');
    clickSound.play();
    
    // Get all currently clicked/opened boxes
    let allOpenedBox = blocks.filter((block => block.classList.contains('is-clicked')));

    if (allOpenedBox.length === 2) {
        stopClicking(); // Prevent further clicks until the check is done
        checkResults(allOpenedBox[0], allOpenedBox[1]);
    }
}

// 4. Game End Logic (New Function)

function checkForGameEnd() {
    // Find all blocks that have the 'matched' class
    const matchedBlocks = blocks.filter(block => block.classList.contains('matched'));

    // If the number of matched blocks equals the total number of blocks, the game is over
    if (matchedBlocks.length === blocks.length) {
        endGameSound.play();
        blocksContainer.style.pointerEvents = 'none';
    }
}

