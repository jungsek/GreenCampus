let studentID = 11; // Example student ID

const POINTS_SYSTEM = {
    1: 10, // 1st try: 10 points
    2: 7,  // 2nd try: 7 points
    3: 5,  // 3rd try: 5 points
    4: 3,  // 4th try: 3 points
    5: 1   // 5th try: 1 points
};

const QUIZ_POINTS_SYSTEM = {
    1: 1, 
    2: 3, 
    3: 5,  
    4: 7,  
    5: 10   
};


document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('gamesInstructionModal');
    const infoBtn = document.querySelector('.info-btn');
    const instructionCloseBtn = document.querySelector('.instruction-close-btn');


    loadDictionary();  // Load the dictionary
    initializeBoard(); 
    initializeKeyboard();
    initializeQuiz(); 

    // checkGreendleStatus();  // comment this line out to enable multiple tries per day
    // checkQuizStatus();  // comment this line out to enable multiple tries per day

    // Open modal when info button is clicked
    infoBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    });

    // Close modal when close button is clicked
    instructionCloseBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Handle modal inert attributes
    const greendleModal = document.getElementById('greendleModal');
    const quizModal = document.getElementById('quizModal');

    // For Greendle Modal
    greendleModal.addEventListener('show.bs.modal', function () {
        this.removeAttribute('inert');
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        document.addEventListener('keyup', handleKeyPress);
    });

    greendleModal.addEventListener('hide.bs.modal', function () {
        this.setAttribute('inert', '');
    });

    // For Quiz Modal
    quizModal.addEventListener('show.bs.modal', function () {
        this.removeAttribute('inert');
    });

    quizModal.addEventListener('hide.bs.modal', function () {
        this.setAttribute('inert', '');
    });
});

// ================= Background animation =================
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

//function to update achievements
async function updateQuizAttemptAchievement() {
    try {
        const achievementId = 2; // ID for "Attempt 5 GreenCampus Quizzes"
        const studentId = studentID; // Use the placeholderID for the logged-in student

        // Get current progress
        const studentAchievements = await fetch('/studentAchievements').then(res => res.json());
        const currentProgress = studentAchievements.find(sa => 
            sa.achievement_id === achievementId && sa.student_id === studentId
        )?.progress || 0;

        // Update progress
        const response = await fetch(`/studentAchievements/${achievementId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentId,
                achievement_id: achievementId,
                progress: currentProgress + 1,
                completed: 0
            })
        });
        
    } catch (error) {
        console.error('Error updating quiz achievement:', error);
    }
}

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


// ================= Keyboard logic =================
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
        const pointsEarned = POINTS_SYSTEM[currentRow + 1];
        showMessage(`Congratulations! You earned ${pointsEarned} points!`);
        earnRewardPoints(pointsEarned);
        disableGreendleButton();
        // Add slight delay before showing fun fact
        setTimeout(showFunFact, 2500);
        return;
    }

    currentRow++;
    currentTile = 0;

    if (currentRow === MAX_GUESSES) {
        gameOver = true;
        showMessage(`Game Over! The word was ${currentWord}. No points earned.`);
        disableGreendleButton();
        setTimeout(showFunFact, 2500);
    }
}

// ================= Disable greendle button after completing game =================
const greendleBtn = document.querySelector('.game-button.greendle');

function getStorageKey() {
    return `greendleCompleted_user_${studentID}`;
}

function disableGreendleButton() {
    greendleBtn.classList.add('completed');
    greendleBtn.disabled = true;
    const today = new Date().toDateString();
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, today);
    
    // Override the tooltip content with custom CSS
    const customTooltipStyle = document.createElement('style');
    customTooltipStyle.textContent = `
        .game-button.greendle.completed::after {
            content: "Come back tomorrow for a new word!";
        }
    `;
    document.head.appendChild(customTooltipStyle);
}

function checkGreendleStatus() {
    const today = new Date().toDateString();
    const storageKey = getStorageKey();
    const greendleCompleted = localStorage.getItem(storageKey);
    
    if (greendleCompleted === today) {
        greendleBtn.classList.add('completed');
        greendleBtn.disabled = true;  
        greendleBtn.setAttribute('data-tooltip', 'Come back tomorrow for a new word!');
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
    const modal = document.getElementById('greendleModal');
    if (!modal.classList.contains('show')) return;

    const key = e.key.toUpperCase();
    if (key === 'ENTER') {
        e.preventDefault();
        e.stopPropagation();
        handleInput('ENTER');
        return false;
    } else if (key === 'BACKSPACE' || (key.length === 1 && key.match(/[A-Z]/))) {
        e.preventDefault();
        e.stopPropagation();
        handleInput(key === 'BACKSPACE' ? '⌫' : key);
    }
}

// ================= Fun fact toast =================
async function fetchFunFact(word) {
    try {
        const response = await fetch('/api/funFacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                word: word,                
            })
        });

        if (!response.ok) {
            throw new Error('API response was not ok');
        }

        const data = await response.json();
        return data.fact || BACKUP_FACTS[word];
    } catch (error) {
        console.error('Error fetching fun fact:', error);
        return BACKUP_FACTS[word] || `Did you know? ${word} helps protect our environment!`;
    }
}

// Backup facts in case the API fails
const BACKUP_FACTS = {
    'SOLAR': "Solar panels on just 0.3% of Earth's surface could power the entire world!",
    'GREEN': "Green roofs can cool buildings and reduce urban heat by up to 5°C!",
    'EARTH': "Earth's magnetic field protects us from solar winds traveling at 1 million miles per hour!",
    'CLEAN': "Transitioning to clean energy could create over 18 million new jobs by 2030!",
    'PLANT': "Plants can 'communicate' by releasing chemicals to warn nearby plants of danger!",
    'REUSE': "Reusing aluminum saves 95% of the energy compared to making it from raw materials!",
    'WATER': "Water is the only substance that exists naturally as solid, liquid, and gas on Earth!",
    'WASTE': "The Great Pacific Garbage Patch is three times the size of France, and growing!",
    'OCEAN': "The ocean produces over 50% of the world's oxygen and absorbs 50 times more CO2 than our atmosphere!",
    'POWER': "Wind turbines can generate enough energy in one hour to power 2,000 homes for a day!",
    'OZONE': "The ozone layer's recovery is expected to prevent 2 million cases of skin cancer annually by 2030!",
    'TREES': "Trees can lower surrounding air temperatures by up to 10°F through shade and evapotranspiration!",
    'CORAL': "Some corals have been around for over 5,000 years, making them one of Earth's oldest living organisms!",
    'CLOUD': "Data centers running on cloud computing save enough energy annually to power 600,000 homes!",
    'BEACH': "Every year, coastal mangroves prevent $65 billion in property damage from storms and hurricanes!"
};

// Function to show the fun fact toast
async function showFunFact() {
    let toast = document.querySelector('.fun-fact-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'fun-fact-toast';
        document.body.appendChild(toast);
    }

    // Show loading state
    toast.innerHTML = `
        <div class="fun-fact-header">
            <i class="fas fa-lightbulb"></i>
            <span>Loading fun fact...</span>
        </div>
    `;
    toast.classList.add('visible');

    try {
        // Fetch and display the fact
        const fact = await fetchFunFact(currentWord);
        
        toast.innerHTML = `
            <div class="fun-fact-header">
                <i class="fas fa-lightbulb"></i>
                <span>Did You Know?</span>
            </div>
            <div class="fun-fact-content">
                ${fact}
            </div>
        `;
    } catch (error) {
        // Show backup fact if API fails
        const backupFact = BACKUP_FACTS[currentWord] || `${currentWord} helps protect our environment!`;
        toast.innerHTML = `
            <div class="fun-fact-header">
                <i class="fas fa-lightbulb"></i>
                <span>Did You Know?</span>
            </div>
            <div class="fun-fact-content">
                ${backupFact}
            </div>
        `;
        console.error('Error showing fun fact:', error);
    }

    // Remove toast after delay
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 8000);
}


// ================= Quiz =================
let quiz = {
    currentQuestion: 0,
    score: 0,
    questions: [],
    isAnswered: false,
    isActive: false,
    isFirstQuiz: true  
};

function initializeQuiz() {
    // Add event listeners for quiz elements
    document.getElementById('nextButton').addEventListener('click', handleNextQuestion);
}

function checkQuizStatus() {
    const quizBtn = document.querySelector('.game-button.quiz');
    const today = new Date().toDateString();
    const storageKey = `quizCompleted_user_${studentID}`;
    const quizCompleted = localStorage.getItem(storageKey);
    
    if (quizCompleted === today) {
        quizBtn.classList.add('completed');
        quizBtn.disabled = true;
        quizBtn.setAttribute('data-tooltip', 'Come back tomorrow for new questions!');
    }
}

function toggleTopicSelector(show) {
    const topicSelector = document.querySelector('.topic-selector');
    if (show) {
        topicSelector.classList.remove('d-none');
    } else {
        topicSelector.classList.add('d-none');
    }
}

async function startNewQuiz() {
    // Update quiz attempt achievement
    await updateQuizAttemptAchievement();

    const topic = document.getElementById('topic-select').value;
    quiz.isActive = true;
    showLoading(true);
    
    // Check if this is a subsequent quiz
    if (!quiz.isFirstQuiz) {
        // Show disclaimer for subsequent quizzes
        const disclaimerAlert = document.createElement('div');
        disclaimerAlert.className = 'alert alert-info mb-3';
        disclaimerAlert.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>
            Note: You've already completed today's rewarded quiz. You can continue playing for fun, but no additional points will be awarded.
        `;
        document.getElementById('quiz-content').prepend(disclaimerAlert);
    }
    
    // Hide topic selector when quiz starts
    toggleTopicSelector(false);

    // Reset and hide the results container
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.add('d-none');
    const questionContainer = document.getElementById('questionContainer');
    questionContainer.style.display = 'block';
    
    try {
        const response = await fetch('/api/quizQns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid question data received');
        }

        quiz.questions = data;
        quiz.currentQuestion = 0;
        quiz.score = 0;
        quiz.isAnswered = false;
        
        displayQuestion();
    } catch (error) {
        console.error('Error starting quiz:', error);
        const message = document.createElement('div');
        message.className = 'alert alert-danger';
        message.textContent = 'Failed to load quiz questions. Please try again.';
        document.getElementById('quiz-content').prepend(message);
    } finally {
        showLoading(false);
    }
}

function displayQuestion() {
    const question = quiz.questions[quiz.currentQuestion];
    if (!question) return;

    // Update question text
    const questionText = document.getElementById('questionText');
    questionText.textContent = `Question ${quiz.currentQuestion + 1} of ${quiz.questions.length}`;
    
    const questionElement = document.createElement('p');
    questionElement.className = 'mt-2 text-lg';
    questionElement.textContent = question.question;
    questionText.appendChild(questionElement);

    // Create options
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'quiz-option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => checkAnswer(index));
        optionsContainer.appendChild(optionElement);
    });

    // Reset state
    document.getElementById('nextButton').classList.add('d-none');
    document.getElementById('explanation').classList.add('d-none');
    document.getElementById('questionContainer').style.display = 'block';
}

async function checkAnswer(selectedIndex) {
    if (quiz.isAnswered || !quiz.isActive) return;
    
    const question = quiz.questions[quiz.currentQuestion];
    const options = document.getElementById('options').children;
    quiz.isAnswered = true;

    // Show correct answer
    options[question.correctIndex].classList.add('correct-answer');
    
    if (selectedIndex === question.correctIndex) {
        quiz.score += 10;  // Keep this for display purposes
        
        // Calculate correct answers count
        const correctAnswers = Math.floor(quiz.score / 10);  // Convert score to number of correct answers
        
        // Only award points if it's the first quiz
        if (quiz.isFirstQuiz) {
            // Show incremental points message
            showMessage(`Correct! (${correctAnswers}/5 correct)`);
            
            // If this is the last question, award points based on total correct answers
            if (quiz.currentQuestion === quiz.questions.length - 1) {
                const pointsEarned = QUIZ_POINTS_SYSTEM[correctAnswers];
                await earnRewardPoints(pointsEarned);
                setTimeout(() => {
                    showMessage(`Quiz Complete! You earned ${pointsEarned} points!`);
                }, 1500);
            }
        } else {
            showMessage("Correct!");
        }
    } else {
        options[selectedIndex].classList.add('wrong-answer');
        showMessage("Incorrect!");
    }

    // Show explanation
    const explanationElement = document.getElementById('explanation');
    explanationElement.textContent = question.explanation;
    explanationElement.classList.remove('d-none');

    // Show next button or results
    if (quiz.currentQuestion < quiz.questions.length - 1) {
        document.getElementById('nextButton').classList.remove('d-none');
    } else {
        setTimeout(showQuizResults, 6500);
    }
}

function handleNextQuestion() {
    if (quiz.currentQuestion < quiz.questions.length - 1) {
        quiz.currentQuestion++;
        quiz.isAnswered = false;
        displayQuestion();
    }
}

function showQuizResults() {
    const questionContainer = document.getElementById('questionContainer');
    const resultContainer = document.getElementById('resultContainer');
    
    // Hide question container and show results
    questionContainer.style.display = 'none';
    resultContainer.classList.remove('d-none');

    // Calculate score percentage
    const scorePercentage = (quiz.score / (quiz.questions.length * 10)) * 100;
    
    const correctAnswers = Math.floor(quiz.score / 10);
    const pointsEarned = quiz.isFirstQuiz ? QUIZ_POINTS_SYSTEM[correctAnswers] : 0;

    const pointsMessage = quiz.isFirstQuiz 
        ? `<div class="points-breakdown mb-4">
             <p class="h5 mb-2">Score: ${correctAnswers}/5</p>
             <p class="text-success fw-bold">Points Earned: ${pointsEarned}</p>
           </div>`
        : `<p class="h5 mb-4">${correctAnswers}/5 correct</p>`;

        const resultContent = resultContainer.querySelector('.bg-light');
        resultContent.innerHTML = `
            <h3 class="h4 mb-3">Quiz Complete! 🎉</h3>
            ${pointsMessage}
            ${getFeedbackMessage(scorePercentage)}
            <div class="mt-4">
                <p class="mb-3">Want to learn more? Choose another topic!</p>
                <select id="next-topic-select" class="form-select mb-3" aria-label="Select next quiz topic">
                    <option value="climate change">🌡️ Climate Change</option>
                    <option value="renewable energy">⚡ Renewable Energy</option>
                    <option value="biodiversity">🦋 Biodiversity</option>
                    <option value="sustainable living">🌱 Sustainable Living</option>
                    <option value="ocean conservation">🌊 Ocean Conservation</option>
                    <option value="waste management">♻️ Waste Management</option>
                </select>
                <button onclick="startNewTopic()" class="btn btn-success">
                    <i class="fas fa-play me-2"></i>
                    Start New Topic
                </button>
            </div>
        `;

    // Only update completion status and disable button if it's the first quiz
    if (quiz.isFirstQuiz) {
        const quizBtn = document.querySelector('.game-button.quiz');
        quizBtn.classList.add('completed');
        quizBtn.disabled = true;
        quizBtn.setAttribute('data-tooltip', 'Come back tomorrow for new questions!');

        // Save completion status
        const today = new Date().toDateString();
        localStorage.setItem(`quizCompleted_user_${studentID}`, today);
        
        // Set first quiz flag to false
        quiz.isFirstQuiz = false;
    }

    // Set game as inactive
    quiz.isActive = false;
}

// Helper function to get feedback message based on score
function getFeedbackMessage(scorePercentage) {
    if (scorePercentage === 100) {
        return `
            <div class="alert alert-success">
                <h4 class="alert-heading">Perfect Score! 🌟</h4>
                <p>You're an environmental expert! Your knowledge can make a real difference in protecting our planet.</p>
            </div>
        `;
    } else if (scorePercentage >= 80) {
        return `
            <div class="alert alert-success">
                <h4 class="alert-heading">Excellent Work! 🌿</h4>
                <p>You have a strong understanding of environmental issues. Keep learning and sharing your knowledge!</p>
            </div>
        `;
    } else if (scorePercentage >= 60) {
        return `
            <div class="alert alert-info">
                <h4 class="alert-heading">Good Job! 🌱</h4>
                <p>You're on the right track! Try another topic to expand your environmental knowledge.</p>
            </div>
        `;
    } else {
        return `
            <div class="alert alert-info">
                <h4 class="alert-heading">Keep Learning! 💚</h4>
                <p>Environmental topics can be challenging. Try another quiz to improve your understanding!</p>
            </div>
        `;
    }
}

// Function to handle starting a new topic
function startNewTopic() {
    const topic = document.getElementById('next-topic-select').value;
    document.getElementById('topic-select').value = topic;
    startNewQuiz();
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('d-none', !show);
    document.getElementById('quiz-content').style.display = show ? 'none' : 'block';
}



// ================= Reward Points system =================
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