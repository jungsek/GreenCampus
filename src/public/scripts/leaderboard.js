// Toggle between Monthly and Yearly data
const toggleButtons = document.querySelectorAll('.toggle-btn');

toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove the active class from all buttons
        toggleButtons.forEach(btn => btn.classList.remove('active'));

        // Add the active class to the clicked button
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
        // Merge carbon footprint and energy usage data based on school IDs
        const mergedData = carbonData.map(carbonSchool => {
            const energySchool = energyData.find(energy => energy.school_id === carbonSchool.school_id) || {};
            return {
                ...carbonSchool,
                total_energy_usage: energySchool.total_energy_usage || 'N/A'
            };
        });

        // Display the leaderboard with the merged data
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
        // Merge carbon footprint and energy usage data based on school IDs
        const mergedData = carbonData.map(carbonSchool => {
            const energySchool = energyData.find(energy => energy.school_id === carbonSchool.school_id) || {};
            return {
                ...carbonSchool,
                total_energy_usage: energySchool.total_energy_usage || 'N/A'
            };
        });

        // Display the leaderboard with the merged data
        displayLeaderboard(mergedData);
    })
    .catch(error => {
        console.error("Error fetching yearly leaderboard data:", error);
        alert("Failed to load yearly leaderboard data. Please try again later.");
    });
}


// Function to display leaderboard (remains the same)
function displayLeaderboard(data) {
    const leaderboard = document.querySelector('.podium');
    leaderboard.innerHTML = '';  // Clear previous content

    const podiumClasses = ['second', 'first', 'third']; 

    // Limit the data to the first 3 schools
    const topSchools = data.slice(0, 3);

    // Reorder the schools for display (2nd, 1st, 3rd)
    const displayOrder = [
        topSchools[1],  // 2nd place
        topSchools[0],  // 1st place
        topSchools[2]   // 3rd place
    ];

    // Iterate over the reordered schools and create podium items
    displayOrder.forEach((school, index) => {
        const podiumItem = document.createElement('div');
        podiumItem.classList.add('podium-item');

        // Add class for the adjusted podium positions (2, 1, 3)
        podiumItem.classList.add(podiumClasses[index]);

        // get initials from the school name
        const initials = getInitials(school.school_name);

        // Calculate the correct rank for display (2, 1, 3)
        const rank = index === 0 ? 2 : index === 1 ? 1 : 3;

        podiumItem.innerHTML = `
            <div class="list-profile">
                <div class="profile-initials">${initials}</div> 
            </div>
            <div class="player-name">${school.school_name}</div>
            <div class="player-points-container">
                        <div class="winnerMetricsCF">${school.total_carbon_footprint.toFixed(1)} kg CO₂ </div>
                        <div class="winnerMetricsEU">${school.total_energy_usage} kwh</div>
                    </div>
            <div class="podium-step">
                <div class="rank">${rank}</div>
            </div>
        `;

        leaderboard.appendChild(podiumItem); // Append the new podium item
    });

    // Display the 4th and 5th ranked schools in a list
    const listContainer = document.querySelector('.list');
    listContainer.innerHTML = '';

    const remainingSchools = data.slice(3, 5);
    remainingSchools.forEach((school, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('list-item');

        // get the initials from the school name
        const initials = getInitials(school.school_name);

        listItem.innerHTML = `
            <div class="list-rank">${index + 4}</div>
            
            <div class="list-profile">
                <div class="profile-initials">${initials}</div> 
            </div>

            <div class="list-info">
                <div class="list-name">${school.school_name}</div>
                <div class="list-points">0 points</div>
            </div>

            <div class="metrics-container">
                <div class="CFmetrics">Carbon Footprint: ${school.total_carbon_footprint.toFixed(1)} kg CO₂</div>
                <div class="EUmetrics">Energy Usage: ${school.total_energy_usage} kwh</div>
            </div>
            
            <div class="score-box">
                <div class="score-item">
                    <span class="score-value">+0</span>
                    <i class="score-icon fas fa-arrow-up"></i>
                </div>
            </div>
        `;

        listContainer.appendChild(listItem);
    });

    // Function to get initials from school name
    function getInitials(schoolName) {
        const nameParts = schoolName.split(' ');  // Split name into words
        const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');  // Get first letter of each word
        return initials;
    }
}

// Fetch the default data (e.g., Monthly) when the page loads
fetchMonthlyData();
