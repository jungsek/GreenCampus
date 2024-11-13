placeholderID = 1; //placeholder until school id can be transferred from login
placeholderYear = 2024
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; //For labeling of charts
const yearSelect = document.getElementById("yearsFilter")
function getMonthFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.getMonth() + 1; // Adding 1 because JavaScript months are zero-indexed (0 = January, 11 = December)
}

// ==================== Goal Setting ====================
// DOM Elements
const setgoalbtn = document.querySelector('#setGoalButton');
const goalPopup = document.getElementById('goalPopup');
const confirmationPopup = document.getElementById('confirmationPopup');
const cancelButton = document.getElementById('cancelButton');
const goalForm = document.getElementById('goalForm');
const goalSelect = document.getElementById('goalSelect');
const typeSelection = document.getElementById('typeSelection');
const percentageInput = document.getElementById('percentageInput');
const kwhinput = document.getElementById('kwhInput');
const kwhGoal = document.getElementById('goalkwh');
const tonGoal = document.getElementById('goalton');
const toninput = document.getElementById('tonInput');
const yearinput = document.getElementById('goalYear');
const submitgoalbtn = document.querySelector('#submitnewgoalbtn');
const yesConfirmButton = document.getElementById('yesconfirmButton');
const noConfirmButton = document.getElementById('noconfirmButton');

// Function to show goal popup
function showGoalPopup() {
    goalPopup.classList.add('visible');
    resetForm();
}

// Function to hide goal popup
function hideGoalPopup() {
    goalPopup.classList.remove('visible');
    resetForm();
}

// Function to show confirmation popup
function showConfirmationPopup(itemName, itemValue) {
    document.getElementById('itemName').textContent = itemName;
    document.getElementById('itemValue').textContent = itemValue;
    confirmationPopup.classList.add('visible');
}

// Function to hide confirmation popup
function hideConfirmationPopup() {
    confirmationPopup.classList.remove('visible');
}

// Function to reset form
function resetForm() {
    goalForm.reset();
    updateInputVisibility();
}

// Function to update input visibility based on selections
function updateInputVisibility() {
    if (goalSelect.value === 'pctgdecrease') {
        percentageInput.classList.remove('hidden');
        kwhinput.classList.add('hidden');
        toninput.classList.add('hidden');
    } else {
        percentageInput.classList.add('hidden');
        const selectedType = document.querySelector('input[name="type"]:checked');
        if (selectedType) {
            if (selectedType.value === 'energy') {
                kwhinput.classList.remove('hidden');
                toninput.classList.add('hidden');
            } else {
                toninput.classList.remove('hidden');
                kwhinput.classList.add('hidden');
            }
        }
    }
}

// Function to create a new goal
async function createGoal(metric_value, selectedType) {
    const newGoal = {
        school_id: parseInt(placeholderID),
        year: parseInt(yearinput.value),
        goal: goalSelect.value,
        metric: selectedType.value,
        metric_value: metric_value,
    };

    const response = await fetch('/goals', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(newGoal)
    });

    if (!response.ok) throw new Error('Network response was not ok');
    alert("Goal created! Reload to sync changes.");
    hideGoalPopup();
}

// Event Listeners
setgoalbtn.addEventListener('click', showGoalPopup);
cancelButton.addEventListener('click', hideGoalPopup);

goalSelect.addEventListener('change', updateInputVisibility);

typeSelection.addEventListener('change', function() {
    if (goalSelect.value === 'tgtvalue') {
        updateInputVisibility();
    }
});

// Form submission handler
submitgoalbtn.addEventListener('click', async (event) => {
    event.preventDefault();
    
    const selectedType = document.querySelector('input[name="type"]:checked');
    
    // Validation
    if (!selectedType) {
        alert('Please select a type (Energy Usage or Carbon Emissions)');
        return;
    }

    if (!yearinput.value || yearinput.value < 2024 || yearinput.value > 2100) {
        alert('Please enter a valid year between 2024 and 2100');
        return;
    }

    let metric_value;
    if (goalSelect.value === "pctgdecrease") {
        metric_value = parseFloat(document.getElementById('goalPercentage').value);
        if (!metric_value || metric_value < 1 || metric_value > 100) {
            alert('Please enter a valid percentage between 1 and 100');
            return;
        }
    } else {
        if (selectedType.value === 'energy') {
            metric_value = parseFloat(kwhGoal.value);
            if (!metric_value || metric_value < 0) {
                alert('Please enter a valid kWh target value');
                return;
            }
        } else {
            metric_value = parseFloat(tonGoal.value);
            if (!metric_value || metric_value < 0) {
                alert('Please enter a valid tonnes target value');
                return;
            }
        }
    }

    try {
        // Check for existing goals
        const prevCheckresponse = await fetch(`/goals/school/${placeholderID}`);
        let prevdata;
        
        if (prevCheckresponse.status === 404) {
            console.log("No previous goals found.");
            await createGoal(metric_value, selectedType);
            return;
        } else if (prevCheckresponse.ok) {
            prevdata = await prevCheckresponse.json();
        } else {
            throw new Error('Network response to get previous goals was not ok');
        }

        // Check if goal needs override
        const existingGoal = prevdata.find(goal => goal.metric === selectedType.value);
        
        if (existingGoal) {
            const itemValue = selectedType.value === 'energy' ? 'Energy Usage' : 'Carbon Emissions';
            const itemName = goalSelect.value === 'pctgdecrease' ? 'Percentage Decrease' : 'Target Value';
            showConfirmationPopup(itemName, itemValue);

            // Remove existing event listeners
            const newYesButton = yesConfirmButton.cloneNode(true);
            const newNoButton = noConfirmButton.cloneNode(true);
            yesConfirmButton.parentNode.replaceChild(newYesButton, yesConfirmButton);
            noConfirmButton.parentNode.replaceChild(newNoButton, noConfirmButton);

            // Add new event listeners
            newYesButton.addEventListener('click', async () => {
                try {
                    hideConfirmationPopup();
                    
                    // Delete existing goal
                    const deleteResponse = await fetch(`/goals/${existingGoal.id}`, {
                        method: "DELETE"
                    });
                    
                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete existing goal');
                    }
                    
                    // Create new goal
                    await createGoal(metric_value, selectedType);
                    window.location.reload();
                } catch (error) {
                    console.error('Error in goal deletion/creation:', error);
                    alert('There was an error updating the goal. Please try again.');
                }
            });

            newNoButton.addEventListener('click', () => {
                hideConfirmationPopup();
                hideGoalPopup();
            });
        } else {
            await createGoal(metric_value, selectedType);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your request. Please try again.');
    }
});

// Close popups when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === goalPopup) {
        hideGoalPopup();
    }
    if (e.target === confirmationPopup) {
        hideConfirmationPopup();
    }
});

// Initialize form visibility
updateInputVisibility();





// function flipCard(card) {
//     card.classList.toggle('is-flipped');
// 

async function fetchEnergyUsageData() {
    let response = await fetch(`/energy-usage/school/${placeholderID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    let Edata = await response.json();
    return Edata;
}

async function fetchCarbonFootprintData() {
    let response = await fetch(`/carbon-footprints/school/${placeholderID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    let Edata = await response.json();
    return Edata;
}

async function fetchGoals() {
    let prevCheckresponse = await fetch(`/goals/school/${placeholderID}`);
    let prevdata;
    if (prevCheckresponse.status === 404) {
        // No previous goals found, continue as needed
        console.log("No previous goals found.");
        return [];
    } else if (prevCheckresponse.ok) {
        // If the response is successful, parse the JSON data
        prevdata = await prevCheckresponse.json();
        return prevdata;
    } else {
        // Handle any other errors (e.g., 500 server errors, etc.)
        throw new Error('Network response to get previous goals was not ok');
    }
}
async function fetchEnergyBreakdownData() {
    let response = await fetch(`/energy-breakdowns/school/${placeholderID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    let Edata = await response.json();
    return Edata;
}


// ==================== Impact Card ====================
document.addEventListener("DOMContentLoaded", () => {
    const defaultYear = 2024;
    initImpactCard(defaultYear);
});

function getTotalCarbonFootprint(data, selectedYear) {
    const filteredData = data.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear;
    });

    // calculate all the carbon footprint for that particular year
    const totalCarbonFootprint = filteredData.reduce((total, item) => {
        return total + (item.total_carbon_tons); 
    }, 0);

    return totalCarbonFootprint;
}

function getTotalEnergyUsage(energyUsageData, breakdownData, selectedYear) {
    // Filter energy usage data for the selected year
    const filteredEnergyUsage = energyUsageData.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear;
    });

    // Calculate the total energy usage, incorporating percentage from breakdownData
    const totalEnergyUsage = filteredEnergyUsage.reduce((total, item) => {
        // Find matching breakdown entry for the current energy usage item
        const breakdownEntries = breakdownData.filter(b => b.energyusage_id === item.id);

        // Sum the energy usage * percentage for each breakdown entry associated with this usage item
        const itemTotal = breakdownEntries.reduce((subtotal, breakdown) => {
            // Multiply energy_kwh by the percentage (converted to a decimal)
            return subtotal + (item.energy_kwh * (breakdown.percentage / 100));
        }, 0);

        // Add this item's total to the overall total
        return total + itemTotal;
    }, 0);

    return totalEnergyUsage;
}


function getTopContributors(data, selectedYear) {
    // filter the data for the selected year
    const filteredData = data.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear;
    });

    // calculate the total energy usage for the selected year
    const totalEnergyUsage = filteredData.reduce((total, item) => total + item.energy_usage, 0);

    // calculate the percentage contribution for each category
    const categoriesWithPercentage = filteredData.map(item => ({
        category: item.category,
        percentage: (item.percentage / totalEnergyUsage) * 100
    }));

    // sort by percentage in descending order and get the top 2 categories
    const topCategories = categoriesWithPercentage
        .sort((a, b) => b.percentage - a.percentage) // Sort by highest percentage
        .slice(0, 2) // Get the top 2 categories
        .map(item => item.category); // Extract the category names

    return topCategories;
}



function percentageChangeCF(data, selectedYear) {
    // Filter data for the selected year and the previous year
    const currentYearData = data.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear;
    });
    
    const previousYearData = data.filter(item => {
        const itemYear = new Date(item.timestamp).getFullYear();
        return itemYear === selectedYear - 1;
    });

    // Sum carbon footprint values for the selected year and the previous year
    const currentYearTotal = currentYearData.reduce((total, item) => total + item.total_carbon_tons, 0);
    const previousYearTotal = previousYearData.reduce((total, item) => total + item.total_carbon_tons, 0);

    // Calculate percentage change
    if (previousYearTotal === 0) {
        return 0; // Avoid division by zero if previous year total is 0
    }
    const change = ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;

    return change.toFixed(1); // one dp
}

function percentageChangeEU(energyUsageData, breakdownData, selectedYear) {
    // Get the total energy usage for the current and previous year
    const currentYearTotal = getTotalEnergyUsage(energyUsageData, breakdownData, selectedYear);
    const previousYearTotal = getTotalEnergyUsage(energyUsageData, breakdownData, selectedYear - 1);

    // Calculate percentage change
    if (previousYearTotal === 0) {
        return "No data"; // Indicate that we cannot calculate a change
    }
    const change = ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;

    return change.toFixed(2); // two decimal places
}



async function initImpactCard(placeholderYear) {
    const carbonFootprintData = await fetchCarbonFootprintData();
    const energyUsageData = await fetchEnergyUsageData();
    const topContributorsData = await fetchEnergyBreakdownData();

    const totalCarbonFootprint = getTotalCarbonFootprint(carbonFootprintData, placeholderYear);
    const totalEnergyUsage = getTotalEnergyUsage(energyUsageData, topContributorsData, placeholderYear);
    const topContributors = getTopContributors(topContributorsData, placeholderYear);
    
    const carbonFootprintChange = percentageChangeCF(carbonFootprintData, placeholderYear);
    const energyUsageChange = percentageChangeEU(energyUsageData, topContributorsData, placeholderYear);

    const yearElement = document.querySelector(".impact-card .title");
    const totalCarbonFootprintElement = document.querySelector(".metric-value1");
    const totalEnergyUsageElement = document.querySelector(".metric-value2");
    const topContributorsElement = document.querySelector(".metric-value3");
    const carbonFootprintChangeElement = document.querySelector(".trend1");
    const energyUsageChangeElement = document.querySelector(".trend2");


    if (yearElement) {
        yearElement.innerText = `${placeholderYear}'s Impact`;
    }

    if (totalCarbonFootprintElement) {
        totalCarbonFootprintElement.innerText = `${totalCarbonFootprint.toFixed(2)}`;
    }

    if (totalEnergyUsageElement) {
        totalEnergyUsageElement.innerText = `${totalEnergyUsage.toFixed(2)}`;
    }

    if (topContributorsElement) {
        topContributorsElement.innerText = topContributors.join(", "); 
    }

    if (carbonFootprintChangeElement) {
        // Check if carbonFootprintChange is "No data" or NaN
        if (isNaN(carbonFootprintChange) || carbonFootprintChange === "No data") {
            carbonFootprintChangeElement.innerHTML = "No data available from last year";
            carbonFootprintChangeElement.style.color = "grey"; // Default color for no data
        } else if (Math.abs(carbonFootprintChange) == 0.0) {
            // No change case (near zero)
            carbonFootprintChangeElement.innerHTML = `<br><i class='bx bx-minus'></i> No change from last year`;
            carbonFootprintChangeElement.style.color = "blue"; // Blue color for no change
        } else {
            // Set up icon and color based on increase or decrease
            const iconClass = carbonFootprintChange < 0 ? 'bx-trending-down' : 'bx-trending-up';
            const color = carbonFootprintChange < 0 ? 'rgb(25, 176, 25)' : 'red';
            
            carbonFootprintChangeElement.innerHTML = `<br><i class='bx ${iconClass}'></i> ${Math.abs(carbonFootprintChange)}% from last year`;
            carbonFootprintChangeElement.style.color = color; // Apply color based on trend
        }
    }
    
    if (energyUsageChangeElement) {
        // Check if energyUsageChange is "No data" or NaN
        if (isNaN(energyUsageChange) || energyUsageChange === "No data") {
            energyUsageChangeElement.innerHTML = "No data available from last year";
            energyUsageChangeElement.style.color = "grey"; // Default color for no data
        } else if (Math.abs(energyUsageChange) == 0.0) {
            // No change case (near zero)
            energyUsageChangeElement.innerHTML = `<br><i class='bx bx-minus'></i> No change from last year`;
            energyUsageChangeElement.style.color = "blue"; // Blue color for no change
        } else {
            // Set up icon and color based on increase or decrease
            const iconClass = energyUsageChange < 0 ? 'bx-trending-down' : 'bx-trending-up';
            const color = energyUsageChange < 0 ? 'rgb(25, 176, 25)' : 'red';
            
            energyUsageChangeElement.innerHTML = `<br><i class='bx ${iconClass}'></i> ${Math.abs(energyUsageChange)}% from last year`;
            energyUsageChangeElement.style.color = color; // Apply color based on trend
        }
    }
}


// ==================== Doughnut Progress Chart ====================
async function initBarCharts() {
    let sumEnergy;
    let sumEnergyNow;
    let metricValue; 
    let sumCarbon;
    let sumCarbonNow;
    const fetchedData = await fetchGoals();
    const fetchedEnergyData = await fetchEnergyUsageData();

    //sumEnergy value
    const fetchedCarbonFootprintData = await fetchCarbonFootprintData();
    function filterDataById(fetchedData, selectedId, placeholderYear, type) {
        let filteredData = fetchedData.filter(item => 
            item.school_id === selectedId && 
            new Date(item.timestamp).getFullYear() === placeholderYear
        );

        let total = 0;
        if (type == 'energy'){
            filteredData.forEach(row => {
                total += row.energy_kwh;
            });
        }
        else {
            filteredData.forEach(row => {
                total += row.total_carbon_tons;
            });
        }
        
        return total;
    }


    sumEnergy = filterDataById(fetchedEnergyData, placeholderID, placeholderYear - 1, 'energy');
    sumEnergyNow = filterDataById(fetchedEnergyData, placeholderID, placeholderYear, 'energy');

    sumCarbon = filterDataById(fetchedCarbonFootprintData, placeholderID, placeholderYear - 1, 'carbon')
    sumCarbonNow = filterDataById(fetchedCarbonFootprintData, placeholderID, placeholderYear, 'carbon')
    
    const energyGoal = fetchedData.find(item => item.metric === 'energy');
    updateChart('energy', energyGoal, sumEnergyNow, 'kWh');

    const carbonGoal = fetchedData.find(item => item.metric === 'carbon');
    updateChart('carbon', carbonGoal, sumCarbonNow, 'tonnes CO₂e');

    // Update trend indicator
    /*
    const energyProgressChangeElement = document.querySelector('.etrend');
    if (energyProgressChangeElement) {
        const percentageChange = (((sumEnergyNow - sumEnergy)/sumEnergy) * 100).toFixed(2);
        
        if (isNaN(percentageChange) || percentageChange === "No data") {
            energyProgressChangeElement.innerHTML = "No data available from last year";
            energyProgressChangeElement.style.color = "grey";
        } else if (Math.abs(percentageChange) == 0.0) {
            energyProgressChangeElement.innerHTML = `<br><i class='bx bx-minus'></i> No change from last year`;
            energyProgressChangeElement.style.color = "blue";
        } else {
            const iconClass = percentageChange < 0 ? 'bx-trending-down' : 'bx-trending-up';
            const color = percentageChange < 0 ? 'rgb(25, 176, 25)' : 'red';
            
            energyProgressChangeElement.innerHTML = `<br><i class='bx ${iconClass}'></i> ${Math.abs(percentageChange)}% from last year`;
            energyProgressChangeElement.style.color = color;
        }
    }*/
}

function updateChart(type, targetGoal, currentValue, unit) {
    const elements = {
        noGoal: document.getElementById(`${type}NoGoalMessage`),
        barContainer: document.getElementById(`${type}UsageBar`).parentElement,
        usageBar: document.getElementById(`${type}UsageBar`),
        targetContainer: document.getElementById(`${type}TargetContainer`),
        utilizedValue: document.getElementById(`${type}UtilizedValue`),
        goalValue: document.getElementById(`${type}GoalValue`)
    };

    if (!targetGoal) {
        elements.noGoal.style.display = 'block';
        elements.barContainer.style.display = 'none';
        elements.utilizedValue.style.display = 'none';
        elements.goalValue.style.display = 'none';
        return;
    }

    let goalValue;
    if (targetGoal.goal === 'tgtvalue') {
        goalValue = targetGoal.metric_value;
    } else {
        goalValue = currentValue * ((100 - targetGoal.metric_value)/100);
    }

    const maxValue = currentValue * 1.5;
    
    // Update the display values
    document.getElementById(`goalTitle${type}`).innerText += ` by ${targetGoal.year}`
    
    elements.utilizedValue.textContent = `Utilized: ${currentValue.toFixed(2)} ${unit}`;
    elements.goalValue.textContent = `Goal: ${goalValue.toFixed(2)} ${unit}`;

    // Update the bar and target line positions
    const usagePercentage = (currentValue / maxValue) * 100;
    const targetPercentage = (goalValue / maxValue) * 100;
    
    elements.usageBar.style.width = `${usagePercentage}%`;
    elements.targetContainer.style.left = `${targetPercentage}%`;
}


initBarCharts();


// ==================== Bar + Line Graph ====================
let energyTemperatureChart;
let backgroundColor = Array(12).fill('rgba(255, 159, 64, 0.5)');
let selectedIndex = null;
let selectedMonth = null;
const monthPicker = document.getElementById('monthPicker');

async function initEnergyTempChart() {
    const fetchedData = await fetchEnergyUsageData();
    let goalkwh = 0;
    
    // Check for goal data
    const goalData = await fetchGoals();
    if (goalData && goalData.length > 0) {
        for (const goal of goalData) {
            if (goal.metric === 'energy') {
                if (goal.goal === 'tgtvalue') {
                    goalkwh = goal.metric_value/12;
                } else {
                    try {
                        const currentkwhresponse = await fetch(`/energy-usage/school/${placeholderID}`);
                        if (!currentkwhresponse.ok) {
                            throw new Error("Network response to get energy usage was not OK");
                        }
                        let currentkwhdata = await currentkwhresponse.json();
                        let currentkwhtotal = 0;
                        currentkwhdata = currentkwhdata.filter(item => 
                            new Date(item.timestamp).getFullYear() === new Date().getFullYear()
                        );
                        currentkwhdata.forEach(item => {
                            currentkwhtotal += item.energy_kwh;
                        });
                        currentkwhtotal = (1 - (goal.metric_value / 100)) * currentkwhtotal;
                        goalkwh = currentkwhtotal / 12;
                    } catch (error) {
                        console.error('Error fetching current energy usage:', error);
                    }
                }
                break; // Exit loop after finding energy goal
            }
        }
    }

    function filterDataById(fetchedData, selectedId) {
        let filteredData = fetchedData.filter(item => 
            item.school_id === selectedId && 
            new Date(item.timestamp).getFullYear() === placeholderYear
        );

        let kwhtotal = 0;
        let temptotal = 0;
        filteredData.forEach(row => {
            kwhtotal += row.energy_kwh;
            temptotal += row.avg_temperature_c;
        });
        document.getElementById('avgenergy').innerText = `${(kwhtotal/12).toFixed(2)} kWh/month`
        document.getElementById('avgtemp').innerText = `${(temptotal/12).toFixed(2)} °C/month`
        const monthlyEnergyData = {};
        const monthlyTempData = {};

        filteredData.forEach(item => {
            const monthIndex = getMonthFromTimestamp(item.timestamp) - 1;
            
            if (!monthlyEnergyData[monthIndex]) {
                monthlyEnergyData[monthIndex] = 0;
            }
            monthlyEnergyData[monthIndex] += item.energy_kwh;
            
            if (!monthlyTempData[monthIndex]) {
                monthlyTempData[monthIndex] = 0;
            }
            monthlyTempData[monthIndex] += item.avg_temperature_c;
        });

        return {
            labels: monthNames,
            totalEnergy: Array(12).fill(0).map((_, i) => monthlyEnergyData[i] || 0),
            totalTemp: Array(12).fill(0).map((_, i) => monthlyTempData[i] || 0)
        };
    }

    const filteredEnergyTempData = filterDataById(fetchedData, placeholderID);

    const energyData = filteredEnergyTempData.totalEnergy;
    const temperatureData = filteredEnergyTempData.totalTemp;

    //to calculate sum of energy/temperature
    const sumEnergy = energyData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const sumTemp = temperatureData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Destroy the existing chart if it exists
    if (energyTemperatureChart) {
        energyTemperatureChart.destroy();
    }

    // Prepare datasets array
    const datasets = [
        {
            label: 'Energy (kWh)',
            type: 'bar',
            data: filteredEnergyTempData.totalEnergy,
            backgroundColor: backgroundColor,
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            yAxisID: 'y1',
        },
        {
            label: 'Temperature (°C)',
            type: 'line',
            data: filteredEnergyTempData.totalTemp,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
            yAxisID: 'y2'
        }
    ];

    // Add goal line dataset if goal exists
    if (goalkwh > 0) {
        datasets.push({
            label: 'Goal Line (kWh)',
            type: 'line',
            data: Array(12).fill(goalkwh), // All months will have the same value for the goal line
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y1',
            pointRadius: 0,
            lineTension: 0
        });
    }

    const energyTemperatureConfig = {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y1: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    max: Math.max(2000, goalkwh * 1.2), // Adjust max to accommodate goal line
                    ticks: {
                        callback: function(value) {
                            return value + ' kWh';
                        }
                    }
                },
                y2: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    max: 50,
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        }
                    }
                }
            },
            onClick: (e) => {
                const element = energyTemperatureChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                if (element.length) {
                    const index = element[0].index;

                    if (selectedIndex === index) {
                        backgroundColor[index] = 'rgba(255, 159, 64, 0.5)';
                        selectedIndex = null;
                        selectedMonth = null;
                    } else {
                        backgroundColor.fill('rgba(255, 159, 64, 0.5)');
                        backgroundColor[index] = 'rgba(255, 99, 132, 1)';
                        selectedIndex = index;
                        selectedMonth = index;
                    }

                    energyTemperatureChart.data.datasets[0].backgroundColor = backgroundColor;
                    energyTemperatureChart.update();

                    const event = new Event('change', {
                        bubbles: true,
                        cancelable: true
                    });
                    monthPicker.dispatchEvent(event);
                }
            }
        }
    };

    //calculate average energy usage and temperature
    const avgEnergyTemp = document.querySelector('.barChart-info')
    avgEnergyTemp.innerHTML = `<p>Energy consumption:<br><strong> ${(sumEnergy/12).toFixed(2)} kWh/month</strong></p>
                            <p>Average Temperature:<br><strong>${(sumTemp/12).toFixed(1)}°C</strong></p>`

    // Initialize the energy vs. temperature chart
    const energyCtx = document.getElementById('energyTemperatureChart').getContext('2d');
    energyTemperatureChart = new Chart(energyCtx, energyTemperatureConfig);
}

initEnergyTempChart();


let currentChart; // Global variable to hold the current chart instance
let uniqueLocations = [];
let uniqueCategories = []; // Store unique categories for button visibility
let prepended = false;
const colorMapping = {
    "Lighting": "#3498db",
    "Computers": "#5bc7a0",
    "HVAC": "#9b59b6",
    "Equipment": "#f1c40f",
    "Refrigeration": "#ff7f50",
    "Appliances": "#e74c3c",
    "Food Waste Management": "#FFC0CB",
    "Sound Equipment": "#c5c6c7"
};

async function initPieChart() {
    const fetchedData = await fetchEnergyBreakdownData();

    // TO POPULATE DROPDOWN-------------------------
    fetchedData.forEach(data => {
        if (!uniqueLocations.includes(data.location)) {
            uniqueLocations.push(data.location);
        }
        if (!uniqueCategories.includes(data.category)) {
            uniqueCategories.push(data.category);
        }
    });

    // Adding "All Locations" to the dropdown
    if (!prepended) {
        uniqueLocations.unshift("all_locations"); // Prepend "all_locations" option
        prepended = true;
    }

    const locationDropdown = document.getElementById('locationSelect');
    const yearDropdown = document.getElementById('yearsFilter'); // Assuming you have a year filter

    locationDropdown.innerHTML = '';
    uniqueLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location; // Set the value to the location
        option.textContent = location === "all_locations" ? "All Locations" : location; // Set display text
        locationDropdown.appendChild(option);
    });

    // Function to filter data by year
    function filterDataByYear(fetchedData, selectedYear) {
        return fetchedData.filter(item => new Date(item.timestamp).getFullYear() === selectedYear);
    }

    // Function to filter data by month
    function filterDataByMonth(fetchedData, selectedYear, selectedMonth) {
        return fetchedData.filter(item => {
            const date = new Date(item.timestamp);
            return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
        });
    }

    // Function to filter data by location
    function filterDataByLocation(fetchedData, selectedLocation) {
        if (selectedLocation === "all_locations") {
            return fetchedData;
        }
        return fetchedData.filter(item => item.location === selectedLocation);
    }

    // Function to get previous year's data for comparison
    function getPreviousYearData(fetchedData, selectedLocation, year, month) {
        let previousYearData;
        if (selectedLocation === "all_locations") {
            previousYearData = fetchedData.filter(item => new Date(item.timestamp).getFullYear() === year - 1);
        } else {
            previousYearData = fetchedData.filter(item => item.location === selectedLocation && new Date(item.timestamp).getFullYear() === year - 1);
        }

        if (month !== null) {
            previousYearData = previousYearData.filter(item => new Date(item.timestamp).getMonth() === month);
        }

        return previousYearData;
    }

    // Function to aggregate data for a specific year
    function aggregateData(filteredData) {
        const aggregated = {};
        
        filteredData.forEach(item => {
            if (!aggregated[item.category]) {
                aggregated[item.category] = item.percentage;
            }
        });

        return {
            Label: Object.keys(aggregated),
            Percentage: Object.values(aggregated)
        };
    }

    // Function to initialize the pie chart
    function initializePieChart(currentData, previousData) {
        if (currentChart) {
            currentChart.destroy();
        }

        // Map categories to fixed colors using colorMapping
        const backgroundColors = currentData.Label.map(category => colorMapping[category] || '#c5c6c7');

        const chartDataPie = {
            labels: currentData.Label,
            datasets: [{
                data: currentData.Percentage,
                backgroundColor: backgroundColors
            }]
        };

        const pieChartOptions = {
            responsive: false,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'right',
                    labels: {
                        boxWidth: 20,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const currentValue = tooltipItem.raw;
                            const category = currentData.Label[tooltipItem.dataIndex];
                            const previousValue = previousData.Percentage[previousData.Label.indexOf(category)] || 0;
                            if (previousValue) {
                                const change = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
                                return `${category}: ${currentValue}% (${change >= 0 ? '+' : ''}${change}% from last year)`;
                            }
                            return `${category}: ${currentValue}% (last year's data unavailable)`;
                        }
                    }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value, ctx) => {
                        let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        let percentage = (value * 100 / sum).toFixed(1) + "%";
                        return percentage;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        };

        // Initialize the pie chart with the right-positioned legend
        const pieCtx = document.getElementById('pieChart').getContext('2d');
        currentChart = new Chart(pieCtx, {
            type: 'pie',
            data: chartDataPie,
            options: pieChartOptions,
            plugins: [ChartDataLabels]
        });

        // Update legend buttons to match chart colors
        const legendButtons = document.querySelectorAll('#legendButtons button');
        legendButtons.forEach((button, index) => {
            const category = button.getAttribute('data-segment');
            const color = colorMapping[category] || '#c5c6c7';
            button.style.backgroundColor = hexToRGBA(color, 0.65);
            button.style.borderColor = color;
            button.style.borderWidth = '3px';
            button.style.borderStyle = 'solid';
        });

        showHideLegendButtons(currentData.Label);
    }

    // Function to show/hide legend buttons
    function showHideLegendButtons(currentLabels) {
        if (!currentLabels) return; // Guard clause to prevent undefined errors
        
        const legendButtons = document.querySelectorAll('#legendButtons button');
        legendButtons.forEach(button => {
            const category = button.getAttribute('data-segment');
            button.style.display = currentLabels.includes(category) ? 'inline-block' : 'none';
        });
    }

    // Function to update the pie chart
    function updatePieChart() {
        const selectedLocation = locationDropdown.value;
        const selectedYear = placeholderYear;
        
        let filteredData = filterDataByLocation(fetchedData, selectedLocation);
        let previousYearData;

        if (selectedMonth !== null) {
            filteredData = filterDataByMonth(filteredData, selectedYear, selectedMonth);
            previousYearData = getPreviousYearData(fetchedData, selectedLocation, selectedYear, selectedMonth);
        } else {
            filteredData = filterDataByYear(filteredData, selectedYear);
            previousYearData = getPreviousYearData(fetchedData, selectedLocation, selectedYear, null);
        }

        const aggregatedCurrentData = aggregateData(filteredData);
        const aggregatedPreviousData = aggregateData(previousYearData);
        
        initializePieChart(aggregatedCurrentData, aggregatedPreviousData);
    }

    // Initialize with default data
    let allData = filterDataByLocation(fetchedData, "all_locations");
    allData = filterDataByYear(allData, placeholderYear);
    const previousYearData = getPreviousYearData(fetchedData, "all_locations", placeholderYear, null);
    
    const aggregatedCurrentData = aggregateData(allData);
    const aggregatedPreviousData = aggregateData(previousYearData);
    
    initializePieChart(aggregatedCurrentData, aggregatedPreviousData);

    // Event listeners
    locationDropdown.addEventListener('change', updatePieChart);
    yearDropdown.addEventListener('change', updatePieChart);
    monthPicker.addEventListener('change', updatePieChart);
}

// Convert hex color to RGBA format
function hexToRGBA(hex, opacity) {
    const num = parseInt(hex.slice(1), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Popup functions
function highlightSegment(segment) {
    const popupTitle = document.getElementById("popupTitle");
    const popupMessage = document.getElementById("popupMessage");

    popupTitle.textContent = popupMessages[segment].title;
    popupMessage.innerHTML = popupMessages[segment].message;

    document.getElementById("popupModal").style.display = "flex";
}

function closePopup() {
    document.getElementById("popupModal").style.display = "none";
}

document.getElementById("popupModal").addEventListener("click", function(event) {
    const popupContent = document.querySelector(".popup-content");
    if (!popupContent.contains(event.target)) {
        closePopup();
    }
});

initPieChart();
// ==================== Line Graph ====================
let carbonFootprintChart;
async function initCarbonFootprintChart() {
    const fetchedData = await fetchCarbonFootprintData();

    let goalton = 0;
    
    // Check for goal data
    const goalData = await fetchGoals();
    if (goalData && goalData.length > 0) {
        for (const goal of goalData) {
            if (goal.metric === 'carbon') {
                if (goal.goal === 'tgtvalue') {
                    goalton = goal.metric_value / 12 ;
                    console.log("target goalton: ", goalton)
                } else {
                    try {
                        const currenttonresponse = await fetch(`/carbon-footprints/school/${placeholderID}`);
                        if (!currenttonresponse.ok) {
                            throw new Error("Network response to get carbon footprint was not OK");
                        }
                        let currenttondata = await currenttonresponse.json();
                        let currenttontotal = 0;
                        currenttondata = currenttondata.filter(item => 
                            new Date(item.timestamp).getFullYear() === new Date().getFullYear()
                        );
                        currenttondata.forEach(item => {
                            currenttontotal += item.total_carbon_tons;
                        });
                        currenttontotal = (1 - (goal.metric_value / 100)) * currenttontotal;
                        goalton = currenttontotal / 12;
                    } catch (error) {
                        console.error('Error fetching current carbon footprint:', error);
                    }
                }
                break; // Exit loop after finding carbon goal
            }
        }
    }

    function filterDataByIdandMonth(fetchedData, selectedId) {
        const monthlyData = {};
        const yearlyData = {};
        let filteredData = fetchedData.filter(item => item.school_id === selectedId);

        // Determine which filtering is needed based on the dropdown value
        const selection = document.getElementById('yearMonthSelect').value;

        if (selection === 'months') {
            // Filter to only include data for the specified placeholderYear
            filteredData = filteredData.filter(item => new Date(item.timestamp).getFullYear() === placeholderYear);
        }

        filteredData.forEach(item => {
            const date = new Date(item.timestamp);
            const monthIndex = getMonthFromTimestamp(item.timestamp) - 1; // 0 = January, 11 = December
            const year = date.getFullYear();

            if (!monthlyData[monthIndex]) {
                monthlyData[monthIndex] = 0;
            }
            monthlyData[monthIndex] += item.total_carbon_tons;

            if (!yearlyData[year]) {
                yearlyData[year] = 0;
            }
            yearlyData[year] += item.total_carbon_tons;
        });

        return {
            labels: Object.keys(monthlyData).map(monthIndex => monthNames[monthIndex]), // Convert index to month name
            yearLabels: Object.keys(yearlyData),
            totalCarbonTons: Object.values(monthlyData),
            totalCarbonYear: Object.values(yearlyData)
        };
    }

    function filterData() {
        const selection = document.getElementById('yearMonthSelect').value;
        let filteredLabels;
        let filteredData;

        if (selection === 'years') {
            // Use the full fetched data to filter for all years
            const yearlyData = {};
            fetchedData.filter(item => item.school_id === placeholderID).forEach(item => {
                const year = new Date(item.timestamp).getFullYear();
                if (!yearlyData[year]) {
                    yearlyData[year] = 0;
                }
                yearlyData[year] += item.total_carbon_tons; // Aggregate by year
            });

            filteredLabels = Object.keys(yearlyData); // Year labels
            filteredData = Object.values(yearlyData); // Yearly carbon data
        } else if (selection === 'months') {
            // Re-filter based on the placeholderYear for monthly data
            const updatedFilteredData = filterDataByIdandMonth(fetchedData, placeholderID);
            filteredLabels = updatedFilteredData.labels;
            filteredData = updatedFilteredData.totalCarbonTons;
        }

        // Update the chart with the selected data
        if (carbonFootprintChart) {
            carbonFootprintChart.data.labels = filteredLabels;
            carbonFootprintChart.data.datasets[0].data = filteredData;
            // Calculate the maximum value for the y-axis
            const maxDataValue = Math.max(...filteredData); // Get the maximum data value
            carbonFootprintChart.options.scales.y1.max = Math.ceil(maxDataValue * 1.1); // Set max to 10% above the max data value
            carbonFootprintChart.update();
        } else {
            createChart(filteredLabels, filteredData); // Create chart if it doesn't exist
        }
    }

    // Initialize the chart with the default data
    const filteredCarbonData = filterDataByIdandMonth(fetchedData, placeholderID);
    createChart(filteredCarbonData.labels, filteredCarbonData.totalCarbonTons);

    // Add event listener to the dropdown to call filterData on change
    const yearMonthSelect = document.getElementById('yearMonthSelect');
    yearMonthSelect.addEventListener('change', filterData);

    function createChart(labels, data) {
        // Destroy the current chart if it exists
        if (carbonFootprintChart) {
            carbonFootprintChart.destroy();
        }

        const maxDataValue = Math.max(...data);
        const dynamicMax = Math.ceil(maxDataValue * 1.1); // Set max to 10% above the max data value

        const datasets = [
            {
                label: 'Carbon Footprint (tonnes)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: true,
                borderWidth: 2,
                yAxisID: 'y1'
            }
        ];

        // If goalton exists, add goal line to datasets
        if (goalton > 0) {
            const goalLineData = (document.getElementById('yearMonthSelect').value === 'years') 
                ? Array(labels.length).fill(goalton * 12) // For year, multiply by 12
                : Array(labels.length).fill(goalton); // For months, use goalton directly

            datasets.push({
                label: 'Goal Line (tonnes)',
                type: 'line',
                data: goalLineData,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y1',
                pointRadius: 0,
                lineTension: 0
            });
        }

        const carbonFootprintConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y1: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        max: dynamicMax, // Adjust based on expected maximum carbon footprint
                        ticks: {
                            callback: function(value) {
                                return value + ' tonnes'; // Add unit to tick labels
                            }
                        }
                    }
                }
            }
        };

        // Initialize the chart
        const carbonCtx = document.getElementById('carbonFootprintGraph').getContext('2d');
        carbonFootprintChart = new Chart(carbonCtx, carbonFootprintConfig);
    }
}

// Call the function to initialize everything
initCarbonFootprintChart();


// Function to toggle dropdown visibility
function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
}

yearSelect.addEventListener('change', function() {
    placeholderYear = parseInt(this.value);
    initEnergyTempChart();
    initCarbonFootprintChart(); 

    initImpactCard(placeholderYear);

    // Reset the location filter to its default value
    const locationDropdown = document.getElementById('locationSelect');
    locationDropdown.value = 'all_locations'; // Change this to your default value
});


document.querySelectorAll('.analyse-chart-btn').forEach(button => {
    button.addEventListener('click', () => {
        const chartType = button.getAttribute('data-chart-type');
        const selectedYear = parseInt(yearSelect.value) || new Date().getFullYear();
        const schoolId = placeholderID; // Assuming placeholderID = 1

        // Redirect to the analyseChart page with query parameters
        window.location.href = `analyseChart.html?chartType=${chartType}&year=${selectedYear}&schoolId=${schoolId}`;
    });
});
