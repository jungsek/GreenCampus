placeholderID = 11; // This is the ID of the student that is currently logged in

async function fetchAchievements() {
    let response = await fetch(`/achievements`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    let data = await response.json();
    return data;
}

async function fetchStudentAchievements() {
    const response = await fetch('/studentAchievements', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    let data = await response.json();
    return data;
}

async function displayAchievements() {
    const achievements = await fetchAchievements();
    const studentAchievements = await fetchStudentAchievements();
    console.log(achievements);
    console.log(studentAchievements);
    
    const ecoFriendlyAchievements = achievements.filter(achievement => achievement.category === 'Eco-Friendly Habits');
    const communityAchievements = achievements.filter(achievement => achievement.category === 'Community Contributions');
    const energyAchievements = achievements.filter(achievement => achievement.category === 'Energy & Resource Efficiency');

    // Eco-Friendly Achievements
    const ecoContainer = document.querySelector('.achievement-category:nth-of-type(1) .row');
    ecoContainer.innerHTML = '';
    ecoFriendlyAchievements.forEach(achievement => {
        const studentAchievement = studentAchievements.find(sa => sa.achievement_id === achievement.achievement_id);
        const progress = studentAchievement ? Math.round((studentAchievement.progress / achievement.target_value) * 100) : 0;
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card achievement-card h-100">
                <div class="card-body text-center">
                    <i class='bx bx-calendar-check achievement-icon'></i>
                    <h5 class="card-title">${achievement.name}</h5>
                    <p class="card-text">${achievement.description}</p>
                    <div class="progress mb-3">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    ${progress === 100 ? '<span class="badge bg-success">Achieved!</span>' : `<small class="text-muted">Progress: ${progress}%</small>`}
                </div>
            </div>
        `;
        ecoContainer.appendChild(card);
    });

    // Community Achievements
    const communityContainer = document.querySelector('.achievement-category:nth-of-type(2) .row');
    communityContainer.innerHTML = '';
    communityAchievements.forEach(achievement => {
        const studentAchievement = studentAchievements.find(sa => sa.achievement_id === achievement.achievement_id);
        const progress = studentAchievement ? Math.round((studentAchievement.progress / achievement.target_value) * 100) : 0;
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card achievement-card h-100">
                <div class="card-body text-center">
                    <i class='bx bx-group achievement-icon'></i>
                    <h5 class="card-title">${achievement.name}</h5>
                    <p class="card-text">${achievement.description}</p>
                    <div class="progress mb-3">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    ${progress === 100 ? '<span class="badge bg-success">Achieved!</span>' : `<small class="text-muted">Progress: ${progress}%</small>`}
                </div>
            </div>
        `;
        communityContainer.appendChild(card);
    });

    // Energy & Resource Efficiency Achievements
    const energyContainer = document.querySelector('.achievement-category:nth-of-type(3) .row');
    energyContainer.innerHTML = '';
    energyAchievements.forEach(achievement => {
        const studentAchievement = studentAchievements.find(sa => sa.achievement_id === achievement.achievement_id);
        const progress = studentAchievement ? Math.round((studentAchievement.progress / achievement.target_value) * 100) : 0;
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card achievement-card h-100">
                <div class="card-body text-center">
                    <i class='bx bx-time-five achievement-icon'></i>
                    <h5 class="card-title">${achievement.name}</h5>
                    <p class="card-text">${achievement.description}</p>
                    <div class="progress mb-3">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    ${progress === 100 ? '<span class="badge bg-success">Achieved!</span>' : `<small class="text-muted">Progress: ${progress}%</small>`}
                </div>
            </div>
        `;
        energyContainer.appendChild(card);
    });
}

displayAchievements();