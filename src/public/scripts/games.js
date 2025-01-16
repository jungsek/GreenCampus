let studentID = 11; // Example student ID

const POINTS_SYSTEM = {
    1: 10, // 1st try: 10 points
    2: 7,  // 2nd try: 7 points
    3: 5,  // 3rd try: 5 points
    4: 3,  // 4th try: 3 points
    5: 1   // 5th try: 1 points
};


document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('gamesInstructionModal');
    const infoBtn = document.querySelector('.info-btn');
    const instructionCloseBtn = document.querySelector('.instruction-close-btn');


    loadDictionary();  // Load the dictionary
    initializeBoard(); // Initialize the game board
    initializeKeyboard(); // Initialize the keyboard
    document.addEventListener('keyup', handleKeyPress); // Attach key press listener

    // Open modal when info button is clicked
    infoBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    });

    // Close modal when close button is clicked
    instructionCloseBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
});

// ================= Background animation =================
// Create floating particles
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 5 and 15 pixels
        const size = Math.random() * 15 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random starting position
        particle.style.left = `${Math.random() * 100}%`;
        
        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 15}s`;
        
        container.appendChild(particle);
    }
}

// Initialize particles on load
createParticles();

// ================= Instruction Modal =================
// Close modal when clicking the close button or outside the modal
document.querySelector('.instruction-close-btn').addEventListener('click', function() {
    document.getElementById('gamesInstructionModal').style.display = 'none';
});

window.addEventListener('click', function(event) {
    var modal = document.getElementById('gamesInstructionModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


// ================= Greendle =================
const WORDS = [
    'SOLAR', 'GREEN', 'EARTH', 'CLEAN', 'PLANT',
    'REUSE', 'WATER', 'WASTE', 'OCEAN', 'POWER',
    'OZONE', 'TREES', 'CORAL', 'CLOUD', 'BEACH'
];

const WORD_LENGTH = 5;
const MAX_GUESSES = 5;

// This will store all valid 5-letter words
let VALID_WORDS = new Set();

// Function to load the dictionary
async function loadDictionary() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt');
        const text = await response.text();
        const words = text.split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length === 5 && /^[A-Z]+$/.test(word));
        
        VALID_WORDS = new Set(words);
        // Add our target words to ensure they're all included
        WORDS.forEach(word => VALID_WORDS.add(word));
    } catch (error) {
        console.error('Failed to load dictionary:', error);
        // Fallback to just using WORDS if dictionary load fails
        VALID_WORDS = new Set(WORDS);
    }
}

let currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
let currentRow = 0;
let currentTile = 0;
let gameOver = false;



function initializeBoard() {
    const gameBoard = document.getElementById('gameBoard');
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'game-row';
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'game-tile';
            row.appendChild(tile);
        }
        gameBoard.appendChild(row);
    }
}

function initializeKeyboard() {
    const keyboard = document.getElementById('keyboard');
    const layout = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];

    layout.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        
        row.forEach(key => {
            const button = document.createElement('button');
            button.textContent = key;
            button.className = 'key';
            if (key === 'ENTER' || key === '⌫') {
                button.classList.add('key-wide');
            }
            button.setAttribute('data-key', key);
            button.addEventListener('click', () => handleInput(key));
            keyboardRow.appendChild(button);
        });
        
        keyboard.appendChild(keyboardRow);
    });
}

function handleInput(key) {
    if (gameOver) return;

    if (key === '⌫') {
        deleteLetter();
    } else if (key === 'ENTER') {
        checkWord();
    } else if (currentTile < WORD_LENGTH && currentRow < MAX_GUESSES) {
        addLetter(key);
    }
}

function addLetter(letter) {
    const tile = document.querySelector(`.game-row:nth-child(${currentRow + 1}) .game-tile:nth-child(${currentTile + 1})`);
    tile.textContent = letter;
    tile.setAttribute('data-letter', letter);
    currentTile++;
}

function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.querySelector(`.game-row:nth-child(${currentRow + 1}) .game-tile:nth-child(${currentTile + 1})`);
        tile.textContent = '';
        tile.removeAttribute('data-letter');
    }
}

function checkWord() {
    if (currentTile !== WORD_LENGTH) {
        showMessage("Not enough letters");
        return;
    }

    const row = document.querySelector(`.game-row:nth-child(${currentRow + 1})`);
    const tiles = row.querySelectorAll('.game-tile');
    const guess = Array.from(tiles).map(tile => tile.getAttribute('data-letter')).join('');
    
    // Check if the guess is in the global dictionary
    if (!VALID_WORDS.has(guess)) {
        showMessage("Not in word list");
        return;
    }

    const letterCount = {};
    for (const letter of currentWord) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    // First pass: mark correct letters
    tiles.forEach((tile, index) => {
        const letter = tile.getAttribute('data-letter');
        if (letter === currentWord[index]) {
            tile.classList.add('correct');
            const key = document.querySelector(`[data-key="${letter}"]`);
            key.classList.add('correct');
            letterCount[letter]--;
        }
    });

    // Second pass: mark present and absent letters
    tiles.forEach((tile, index) => {
        if (!tile.classList.contains('correct')) {
            const letter = tile.getAttribute('data-letter');
            const key = document.querySelector(`[data-key="${letter}"]`);
            
            if (letterCount[letter] > 0) {
                tile.classList.add('present');
                if (!key.classList.contains('correct')) {
                    key.classList.add('present');
                }
                letterCount[letter]--;
            } else {
                tile.classList.add('absent');
                if (!key.classList.contains('correct') && !key.classList.contains('present')) {
                    key.classList.add('absent');
                }
            }
        }
    });

    if (guess === currentWord) {
        gameOver = true;
        
        // Calculate points based on number of attempts (currentRow + 1)
        const pointsEarned = POINTS_SYSTEM[currentRow + 1];
        
        // Show points earned in the message
        showMessage(`Congratulations! You earned ${pointsEarned} points!`);
        
        // Call earnRewardPoints with the calculated points
        earnRewardPoints(pointsEarned);
        
        return;
    }

    currentRow++;
    currentTile = 0;

    if (currentRow === MAX_GUESSES) {
        gameOver = true;
        showMessage(`Game Over! The word was ${currentWord}. No points earned.`);
    }
}

function showMessage(text) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.classList.add('visible');
    setTimeout(() => {
        message.classList.remove('visible');
    }, 2000);
}

function handleKeyPress(e) {
    const key = e.key.toUpperCase();
    if (key === 'ENTER' || key === 'BACKSPACE' || (key.length === 1 && key.match(/[A-Z]/))) {
        handleInput(key === 'BACKSPACE' ? '⌫' : key);
    }
}

async function earnRewardPoints(pts) {
    // Update points
    const earnPointsResponse = await fetch(`/users/student/points/${studentID}`);
    if (!earnPointsResponse.ok) throw new Error("Failed to get current points");

    const pointsData = await earnPointsResponse.json();
        const totalPoints = pointsData.reduce((sum, item) => sum + item.points, 0) + pts;

        const updatepointsresponse = await fetch(`/users/student/points/${studentID}/${totalPoints}`, {
            method: "PATCH"
        });
        
        if (!updatepointsresponse.ok) throw new Error("Failed to update points");
}