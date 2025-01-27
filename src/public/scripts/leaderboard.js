let claimedRewards = new Map();
let studentID = 11;
let school_id = 1;

document.addEventListener('DOMContentLoaded', function() {
    let role = sessionStorage.getItem('role')
    let navbar = document.createElement('div')
    if (role == 'student') {
        navbar.classList.add('studentnav-placeholder')
    }
    else {
        navbar.classList.add('nav-placeholder')
    }
    document.body.insertBefore(navbar, document.body.firstChild);

    const modal = document.getElementById('instructionsModal');
    const infoBtn = document.querySelector('.info-btn');
    const closeBtn = document.querySelector('.close-btn');

    // Open modal when info button is clicked
    infoBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    });

    // Close modal when close button is clicked
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Prevent closing when clicking inside modal content
    modal.querySelector('.modal-content').addEventListener('click', function(event) {
        event.stopPropagation();
    });

    // Dynamically load the next script to load the navbar content
    const script = document.createElement('script');
    script.src = './scripts/common.js';  // Path to the script that loads the navbar content
    script.onload = function() {
        console.log('Navbar loaded successfully!');
    };
    document.head.appendChild(script);
});

// Toggle between Monthly and Yearly data
const toggleButtons = document.querySelectorAll('.toggle-btn');

toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove the active class from all buttons
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Determine which button was clicked based on its text content
        if (button.textContent.trim() === 'Monthly') {
            fetchMonthlyData();
        } else if (button.textContent.trim() === 'Yearly') {
            fetchYearlyData();
        }
    });
});


// Fetch monthly data for both carbon footprint and energy usage
function fetchMonthlyData() {
    Promise.all([
        fetch(`http://localhost:3000/api/schools/carbon-footprint/month`).then(response => response.json()),
        fetch(`http://localhost:3000/api/schools/energy-usage/month`).then(response => response.json())
    ])
    .then(([carbonData, energyData]) => {
        const mergedData = mergeAndCalculateMonthlyData(carbonData, energyData);
        displayLeaderboard(mergedData);
    })
    .catch(error => {
        console.error("Error fetching monthly leaderboard data:", error);
        alert("Failed to load monthly leaderboard data. Please try again later.");
    });
}

// Fetch yearly data for both carbon footprint and energy usage
function fetchYearlyData() {
    Promise.all([
        fetch(`http://localhost:3000/api/schools/carbon-footprint/year`).then(response => response.json()),
        fetch(`http://localhost:3000/api/schools/energy-usage/year`).then(response => response.json())
    ])
    .then(([carbonData, energyData]) => {
        const mergedData = mergeAndCalculateYearlyData(carbonData, energyData);
        displayLeaderboard(mergedData);
    })
    .catch(error => {
        console.error("Error fetching yearly leaderboard data:", error);
        alert("Failed to load yearly leaderboard data. Please try again later.");
    });
}

// Merge and calculate data with historical ranking comparison
function mergeAndCalculateMonthlyData(carbonData, energyData) {
    // First, calculate previous month's rankings
    const previousMonthData = carbonData.map(carbonSchool => {
        const energySchool = energyData.find(energy => energy.school_id === carbonSchool.school_id) || {};
        
        return {
            school_id: carbonSchool.school_id,
            sustainability_points: calculateMonthlySustainabilityPoints(
                carbonSchool.previous_month_carbon_footprint,
                energySchool.previous_month_energy_usage
            )
        };
    });

    // Sort previous month data by points to get rankings
    const previousRankings = new Map(
        previousMonthData
            .sort((a, b) => b.sustainability_points - a.sustainability_points)
            .map((school, index) => [school.school_id, index + 1])
    );

    // Calculate current month's data with ranking comparison
    return carbonData.map(carbonSchool => {
        const energySchool = energyData.find(energy => energy.school_id === carbonSchool.school_id) || {};
        
        const sustainabilityPoints = calculateMonthlySustainabilityPoints(
            carbonSchool.current_month_carbon_footprint,
            energySchool.current_month_energy_usage
        );

        return {
            ...carbonSchool,
            current_month_energy_usage: energySchool.current_month_energy_usage || 'N/A',
            sustainability_points: sustainabilityPoints,
            previous_rank: previousRankings.get(carbonSchool.school_id) || null
        };
    });
}

function mergeAndCalculateYearlyData(carbonData, energyData) {
    // First, calculate previous year's rankings
    const previousYearData = carbonData.map(carbonSchool => {
        const energySchool = energyData.find(energy => energy.school_id === carbonSchool.school_id) || {};
        
        return {
            school_id: carbonSchool.school_id,
            sustainability_points: calculateYearlySustainabilityPoints(
                carbonSchool.previous_year_carbon_footprint,
                energySchool.previous_year_energy_usage
            )
        };
    });

    // Sort previous year data by points to get rankings
    const previousRankings = new Map(
        previousYearData
            .sort((a, b) => b.sustainability_points - a.sustainability_points)
            .map((school, index) => [school.school_id, index + 1])
    );

    // Calculate current year's data with ranking comparison
    return carbonData.map(carbonSchool => {
        const energySchool = energyData.find(energy => energy.school_id === carbonSchool.school_id) || {};
        
        const carbonFootprint = carbonSchool.current_year_carbon_footprint || 0;
        const energyUsage = energySchool.current_year_energy_usage || 0;
        
        const sustainabilityPoints = calculateYearlySustainabilityPoints(carbonFootprint, energyUsage);

        return {
            ...carbonSchool,
            current_year_energy_usage: energyUsage !== 0 ? energyUsage : 'N/A',
            sustainability_points: sustainabilityPoints,
            previous_rank: previousRankings.get(carbonSchool.school_id) || null
        };
    });
}

function displayLeaderboard(data) {
    const leaderboard = document.querySelector('.podium');
    leaderboard.innerHTML = '';

    const podiumClasses = ['second', 'first', 'third'];

    // Sort the data by sustainability points in descending order
    data.sort((a, b) => b.sustainability_points - a.sustainability_points);

    // Create a map of current rankings
    const currentRankings = new Map(
        data.map((school, index) => [school.school_id, index + 1])
    );

    const topSchools = data.slice(0, 3);
    const displayOrder = [topSchools[1], topSchools[0], topSchools[2]];

    displayOrder.forEach((school, index) => {
        console.log('School:', {
            id: school.school_id,
            type: typeof school.school_id,
            name: school.school_name,
            rank: index === 0 ? 2 : index === 1 ? 1 : 3
        });

        const podiumItem = document.createElement('div');
        podiumItem.classList.add('podium-item', podiumClasses[index]);

        const initials = getInitials(school.school_name);
        const currentRank = index === 0 ? 2 : index === 1 ? 1 : 3;
        const rankChange = calculateRankChange(currentRank, school.previous_rank);
        
        const rewardPoints = currentRank === 1 ? 50 : currentRank === 2 ? 35 : 20;
        const currentMonth = new Date().toISOString().slice(0, 7);
        const claimKey = `${school.school_id}-${currentMonth}`;
        const isAlreadyClaimed = localStorage.getItem(claimKey) === currentMonth;
        // const isAlreadyClaimed = false;  // uncomment this line and comment the line above to claim reward points mulitple times


        const carbonFootprint = school.current_year_carbon_footprint || school.current_month_carbon_footprint || 0;
        const energyUsage = school.current_year_energy_usage || school.current_month_energy_usage || 'N/A';

        podiumItem.innerHTML = `
            <div class="list-profile">
                <div class="profile-initials">${initials}</div> 
            </div>
            <div class="player-name">${school.school_name}</div>
            <div class="player-points-container">
                <div class="winnerMetricsCF">${carbonFootprint.toFixed(1)} tons</div>
                <div class="winnerMetricsEU">${energyUsage} kwh</div>
                <div class="sustainability-points">
                    Points: ${school.sustainability_points}
                    <span class="rank-change ${rankChange > 0 ? 'positive' : rankChange < 0 ? 'negative' : 'neutral'}">
                        (${rankChange > 0 ? '+' : ''}${rankChange || '-'})
                        <i class="fas fa-arrow-${rankChange > 0 ? 'up arrow-up' : rankChange < 0 ? 'down arrow-down' : ''}"></i>
                    </span>
                    ${school.school_id === 1 ? 
                        `<button 
                            class="claim-btn ${isAlreadyClaimed ? 'completed' : ''}" 
                            onclick="claimMonthlyReward('${school.school_id}', ${currentRank})"
                            ${isAlreadyClaimed ? 'disabled' : ''}
                            data-school="${school.school_id}"
                            data-tooltip="${isAlreadyClaimed ? 'Reward claimed! \nCome back next month if your school remains on the podium!' : ''}"
                        >
                            ${isAlreadyClaimed ? `Claim ${rewardPoints} Reward Points` : `Claim ${rewardPoints} Reward Points`}
                        </button>`
                    : ''}
                </div>
            </div>
            <div class="podium-step">
                <div class="rank">${currentRank}</div>
            </div>
        `;

        leaderboard.appendChild(podiumItem);
    });

    // Rest of the function remains the same
    const listContainer = document.querySelector('.list');
    listContainer.innerHTML = '';

    data.slice(3, 10).forEach((school, index) => {
        const currentRank = index + 4;
        const rankChange = calculateRankChange(currentRank, school.previous_rank);

        const listItem = document.createElement('div');
        listItem.classList.add('list-item');
        const initials = getInitials(school.school_name);

        const carbonFootprint = school.current_year_carbon_footprint || school.current_month_carbon_footprint || 0;
        const energyUsage = school.current_year_energy_usage || school.current_month_energy_usage || 'N/A';

        listItem.innerHTML = `
            <div class="list-rank">${currentRank}</div>
            <div class="list-profile"><div class="profile-initials">${initials}</div></div>
            <div class="list-info">
                <div class="list-name">${school.school_name}</div>
                <div class="list-points">
                    Points: ${school.sustainability_points}
                </div>
            </div>
            
            <div class="metrics-container">
                <div class="CFmetrics">Carbon Footprint: ${carbonFootprint.toFixed(1)} tons</div>
                <div class="EUmetrics">Energy Usage: ${energyUsage} kwh</div>
            </div>

            <div class="score-box">
                <div class="score-item ${rankChange > 0 ? 'positive' : rankChange < 0 ? 'negative' : 'neutral'}">
                    <span class="score-value">${rankChange > 0 ? `+${rankChange}` : rankChange || '-'}</span>
                    <i class="score-icon fas fa-arrow-${rankChange > 0 ? 'up' : rankChange < 0 ? 'down' : ''}"></i>
                </div>
            </div>
        `;

        listContainer.appendChild(listItem);
    });
}


// Helper function to calculate rank change
function calculateRankChange(currentRank, previousRank) {
    if (!previousRank) return 0;
    return previousRank - currentRank;  // Positive means improvement (moved up in rank)
}


function calculateYearlySustainabilityPoints(carbonFootprint, energyUsage) {
    let points = 0;
    points += (carbonFootprint <= 9) ? 100      // if CF less than 9 tons then add 100 points 
        : (carbonFootprint <= 9.5) ? 80         // if CF less than 9.5 tons then add 80 points
        : (carbonFootprint <= 10) ? 60         
        : (carbonFootprint <= 10.5) ? 40       
        : (carbonFootprint <= 11) ? 20         
        : -50;                                  // if CF more than 10.5 then minus 50 points

    points += (energyUsage <= 10000) ? 100    // if EU less than 10,000 kWh then add 100 points
    : (energyUsage <= 12000) ? 80             
    : (energyUsage <= 13000) ? 60             
    : (energyUsage <= 14000) ? 40             
    : (energyUsage <= 15000) ? 20             
    : -50;                                   // if EU more than 15,000 kWh then minus 50 points
    return points;
    
}

function calculateMonthlySustainabilityPoints(carbonFootprint, energyUsage) {
    let points = 0;
    points += (carbonFootprint <= 0.65) ? 100    // Monthly CF <-= 0.65 tons add 100 points
        : (carbonFootprint <= 0.7) ? 80         
        : (carbonFootprint <= 0.75) ? 60         
        : (carbonFootprint <= 0.8) ? 40         
        : (carbonFootprint <= 0.85) ? 20         
        : (carbonFootprint <= 0.9) ? 10         
        : -50;                                  // Monthly CF over 0.9 tons

    points += (energyUsage <= 850) ? 100        // Monthly EU  <-= 83.3 kWh add 100 points
        : (energyUsage <= 900) ? 90              
        : (energyUsage <= 950) ? 80              
        : (energyUsage <= 1000) ? 70              
        : (energyUsage <= 1050) ? 60              
        : (energyUsage <= 1100) ? 50    
        : (energyUsage <= 1150) ? 40             
        : (energyUsage <= 1200) ? 30         
        : (energyUsage <= 1250) ? 20              
        : -50;                                  // Monthly EU over 125 kWh
    return points;
}

// Helper function to get initials from school name
function getInitials(schoolName) {
    return schoolName.split(' ').map(word => word[0].toUpperCase()).join('');
}

// Fetch default data on page load
fetchMonthlyData();

// Function to generate storage key for claims
function getClaimStorageKey(schoolId) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return `claim-reward-${schoolId}-${currentMonth}`;
}

// Function to disable claim button after successful claim
function disableClaimButton(schoolId, button) {
    button.classList.add('completed');
    button.disabled = true;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const storageKey = getClaimStorageKey(schoolId);
    localStorage.setItem(storageKey, currentMonth);
    
    // Override the tooltip content with custom CSS
    const customTooltipStyle = document.createElement('style');
    customTooltipStyle.textContent = `
        .claim-btn.completed[data-school="${schoolId}"]::after {
            content: "You have claimed this month's reward! Come back again next month when your school is still on the podium!";
        }
    `;
    document.head.appendChild(customTooltipStyle);
    
    // Update button text
    button.textContent = 'Claimed';
}

// Function to check claim status
function checkClaimStatus(schoolId) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const storageKey = getClaimStorageKey(schoolId);
    const claimStatus = localStorage.getItem(storageKey);
    
    if (claimStatus === currentMonth) {
        const claimBtn = document.querySelector(`.claim-btn[data-school="${schoolId}"]`);
        if (claimBtn) {
            claimBtn.classList.add('completed');
            claimBtn.disabled = true;
            claimBtn.textContent = 'Claimed';
            claimBtn.setAttribute('data-tooltip', 'You have claimed this month\'s reward! Come back again next month when your school is still on the podium!');
        }
        return true;
    }
    return false;
}

// Modified claim reward function
async function claimMonthlyReward(schoolId, rank) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const claimKey = `${schoolId}-${currentMonth}`;
    
    // if (localStorage.getItem(claimKey) === currentMonth) {
    //     alert('Reward already claimed for this month!');
    //     return;
    // }

    const rewardPoints = {
        1: 50,
        2: 35,
        3: 20
    };

    try {
        await earnRewardPoints(rewardPoints[rank]);
        localStorage.setItem(claimKey, currentMonth);
        
        // Update button state
        const claimBtn = document.querySelector(`.claim-btn[data-school="${schoolId}"]`);
        if (claimBtn) {
            claimBtn.classList.add('completed');
            claimBtn.disabled = true;
            claimBtn.textContent = 'Claimed';
            claimBtn.setAttribute('data-tooltip', 'You have claimed this month\'s reward! Come back again next month when your school is still on the podium!');
        }
        
        alert(`Claimed ${rewardPoints[rank]} points!`);
    } catch (error) {
        console.error('Error claiming reward:', error);
        alert('Failed to claim reward. Try again later.');
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