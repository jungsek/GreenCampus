placeholderID = 1; //placeholder until school id can be transferred from login
placeholderYear = 2024
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; //For labeling of charts
const yearSelect = document.getElementById("yearsFilter")
function getMonthFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.getMonth() + 1; // Adding 1 because JavaScript months are zero-indexed (0 = January, 11 = December)
}

// ==================== Goal Setting ====================
const setgoalbtn = document.querySelector('#setGoalButton');
const goalSelect = document.getElementById('goalSelect');
const percentageInput = document.getElementById('percentageInput');
const typeSelect = document.getElementById('typeSelection');
const kwhinput = document.getElementById('kwhInput');
const kwhGoal = document.getElementById('goalkwh')
const tonGoal = document.getElementById('goalton')
const toninput = document.getElementById('tonInput');
const yearinput = document.getElementById('goalYear')
const submitgoalbtn = document.querySelector('#submitnewgoalbtn')


 // Show the goal popup when the button is clicked
 setgoalbtn.addEventListener('click', function() {
    document.getElementById('goalPopup').style.display = 'block';
});

// Hide/show percentage input based on goal selection
goalSelect.addEventListener('change', function() {
    if (this.value === 'pctgdecrease') {
        percentageInput.classList.remove('hidden');
        kwhinput.classList.add('hidden');
        toninput.classList.add('hidden');
    } else {
        percentageInput.classList.add('hidden');
        // Check the currently selected type and show the appropriate input
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
});

// Show/hide kWh and ton inputs based on type selection
typeSelect.addEventListener('change', function() {
    if (goalSelect.value === 'tgtvalue') {
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
});

// Cancel button functionality to close the popup
const cancelButton = document.getElementById('cancelButton');
cancelButton.addEventListener('click', function() {
    document.getElementById('goalPopup').style.display = 'none'; // Close popup
});



submitgoalbtn.addEventListener('click', async (event) => {
    
    event.preventDefault();

    const selectedType = document.querySelector('input[name="type"]:checked');
    let metric_value;

    if (goalSelect.value === "pctgdecrease") {
        metric_value = parseFloat(document.getElementById('goalPercentage').value);
    } else {
        if (selectedType.value === 'energy') {
            metric_value = parseFloat(kwhGoal.value);
        } else {
            metric_value = parseFloat(tonGoal.value);
        }
    }

    // Validation
    if (!metric_value || !goalSelect.value || !selectedType.value || !yearinput.value) {
        alert("Please fill in all form details.");
        return;
    }

    async function createGoal() {
            
        const newGoal = {
            school_id: parseInt(placeholderID),
            year: parseInt(yearinput.value),
            goal: goalSelect.value,
            metric: selectedType.value,
            metric_value: metric_value,
        };

        let response = await fetch('/goals', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(newGoal)
        });

        if (!response.ok) throw new Error('Network response was not ok');
        alert("Goal created");
        document.getElementById('goalPopup').style.display = 'none'; // Close the goal setting form
    }
    
    // Fetch previous goals
    let prevCheckresponse = await fetch(`/goals/school/${placeholderID}`);
    let prevdata;
    if (prevCheckresponse.status === 404) {
        // No previous goals found, continue as needed
        console.log("No previous goals found.");
    } else if (prevCheckresponse.ok) {
        // If the response is successful, parse the JSON data
        prevdata = await prevCheckresponse.json();
    } else {
        // Handle any other errors (e.g., 500 server errors, etc.)
        throw new Error('Network response to get previous goals was not ok');
    }


    let goalNeedsOverride = false;

    if (prevdata) {
        prevdata.forEach(goal => {
            if (goal.metric === selectedType.value) {
                goalNeedsOverride = true;
                // If it's the same type of goal, show the confirmation popup
                document.getElementById('itemValue').innerText = (selectedType.value === 'energy') ? 'Energy Usage' : 'Carbon Emissions';
                document.getElementById('itemName').innerText = (goalSelect.value === 'pctgdecrease') ? 'Percentage Decrease' : 'Target Value';
                document.getElementById('confirmationPopup').style.display = 'block';
            }
        });
    }

    // If the goal needs an override, wait for confirmation
    if (goalNeedsOverride) {
        document.getElementById('yesconfirmButton').addEventListener('click', async function () {
            // Hide confirmation popup
            document.getElementById('confirmationPopup').style.display = 'none';

            // Delete the old goal (same type)
            let deleteGoalresponse = await fetch(`/goals/${prevdata[0].id}`, {
                method: "DELETE"
            });
            if (!deleteGoalresponse.ok) throw new Error('Network response to delete old goal was not ok');

            // Now create the new goal
            createGoal();
        });

        document.getElementById('noconfirmButton').addEventListener('click', function () {
            document.getElementById('confirmationPopup').style.display = 'none';
            // Close the goal setting form if user cancels
            document.getElementById('goalPopup').style.display = 'none';
        });
    } else {
        // Function to create the new goal

        // If no override is needed (i.e., different type of goal or no previous goal), just create the new goal
        createGoal();
    }
});







async function fetchEnergyUsageData() {
    let response = await fetch(`/energy-usage`, {
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
    let response = await fetch(`/carbon-footprints`, {
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

async function fetchEnergyBreakdownData() {
    let response = await fetch(`/energy-breakdowns`, {
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

// ==================== Doughnut Progress Chart ====================
const chartData = {
    labels: ['Current Progress', 'Remaining Target'],
    datasets: [{
        label: 'Progress Towards Goal',
        data: [70, 30],
        backgroundColor: [
            '#5bc7a0', // Color for utilized
            '#e0e0e0'  // Color for unused
        ],
        borderColor: '#fff',
        borderWidth: 2
    }]
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%', // Ring effect
    plugins: {
        legend: {
            display: false // Hide legend
        },
        tooltip: {
            callbacks: {
                label: function(tooltipItem) {
                    return tooltipItem.label + ': ' + tooltipItem.raw + '%';
                }
            }
        }
    }
};

//Initialize the doughnut charts
const ctx1 = document.getElementById('doughnutChart1').getContext('2d');
const doughnutChart1 = new Chart(ctx1, {
    type: 'doughnut',
    data: chartData,
     options: chartOptions
});

const ctx2 = document.getElementById('doughnutChart2').getContext('2d');
const doughnutChart2 = new Chart(ctx2, {
    type: 'doughnut',
    data: chartData,
    options: chartOptions
});

// const ctx3 = document.getElementById('doughnutChart3').getContext('2d');
// const doughnutChart3 = new Chart(ctx3, {
//     type: 'doughnut',
//     data: chartData,
//     options: chartOptions
// });

// ==================== Bar + Line Graph ====================
let energyTemperatureChart; // Global variable for the energy temperature chart
let backgroundColor = ['rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 1)']
let selectedIndex = null;
let selectedMonth = null;
const monthPicker = document.getElementById('monthPicker');
async function initEnergyTempChart() {
    const fetchedData = await fetchEnergyUsageData();


    function filterDataById(fetchedData, selectedId) {
        let filteredData = fetchedData.filter(item => item.school_id === selectedId);
        filteredData = filteredData.filter(item => new Date(item.timestamp).getFullYear() === placeholderYear);
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
            labels: Object.keys(monthlyEnergyData).map(monthIndex => monthNames[monthIndex]),
            totalEnergy: Object.values(monthlyEnergyData),
            totalTemp: Object.values(monthlyTempData)
        };
    }

    const filteredEnergyTempData = filterDataById(fetchedData, placeholderID);
    const energyData = filteredEnergyTempData.totalEnergy;
    const temperatureData = filteredEnergyTempData.totalTemp;

    if (energyTemperatureChart) {
        energyTemperatureChart.destroy();
    }

    const energyTemperatureConfig = {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: 'Energy (kWh)',
                    type: 'bar',
                    data: energyData,
                    backgroundColor: energyData.map(() => 'rgba(255, 159, 64, 0.5)'), // Default color for all bars
                    borderColor: energyData.map(() => 'rgba(255, 159, 64, 1)'),
                    borderWidth: 1,
                    yAxisID: 'y1',
                },
                {
                    label: 'Temperature (°C)',
                    type: 'line',
                    data: temperatureData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y1: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    max: 2000,
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
                // Get the clicked element
                let element = energyTemperatureChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                if (element.length) {
                    const index = element[0].index; // Get the index of the clicked bar

                    // Check if the clicked bar is already selected
                    if (selectedIndex === index) {
                        // Deselecting the bar
                        backgroundColor[index] = 'rgba(255, 159, 64, 0.5)'; // Change back to default color
                        selectedIndex = null; // Reset selected index
                        selectedMonth = null;
                        const event = new Event('change', {
                            bubbles: true, // Allow the event to bubble up through the DOM
                            cancelable: true // Allow the event to be canceled
                        });
                        monthPicker.dispatchEvent(event); // Trigger the change event
                    } else {
                        // Selecting a new bar
                        // Reset all bars to default color
                        backgroundColor.fill('rgba(255, 159, 64, 0.5)');

                        // Highlight the clicked bar
                        backgroundColor[index] = 'rgba(255, 99, 132, 1)'; // Change to a different color for highlight
                        selectedIndex = index; // Update selected index
                        selectedMonth = index;
                        const event = new Event('change', {
                            bubbles: true, // Allow the event to bubble up through the DOM
                            cancelable: true // Allow the event to be canceled
                        });
                        monthPicker.dispatchEvent(event); // Trigger the change event
                    }

                    // Update the chart with new background colors
                    energyTemperatureChart.data.datasets[0].backgroundColor = backgroundColor;
                    energyTemperatureChart.update(); // Refresh the chart
                }
            }

            }
        }
    

    // Initialize the energy vs. temperature chart
    const energyCtx = document.getElementById('energyTemperatureChart').getContext('2d');
    energyTemperatureChart = new Chart(energyCtx, energyTemperatureConfig);
}

// Initialize the energy temperature chart
initEnergyTempChart();


let currentChart; // Global variable to hold the current chart instance
let uniqueLocations = [];
let uniqueCategories = []; // Store unique categories for button visibility
let prepended = false;

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

        const chartDataPie = {
            labels: currentData.Label,
            datasets: [{
                data: currentData.Percentage,
                backgroundColor: ['#3498db', '#5bc7a0', '#9b59b6', '#f1c40f', '#ff7f50', '#e74c3c', '#FFC0CB']
            }]
        };

        const pieChartOptions = {
            responsive: false,
            maintainAspectRatio: false,
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

        const pieCtx = document.getElementById('pieChart').getContext('2d');
        currentChart = new Chart(pieCtx, {
            type: 'pie',
            data: chartDataPie,
            options: pieChartOptions,
            plugins: [ChartDataLabels]
        });

        // Function to convert hex to RGBA
        function hexToRGBA(hex, opacity) {
            const num = parseInt(hex.slice(1), 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        // Update legend buttons
        const legendButtons = document.querySelectorAll('#legendButtons button');
        legendButtons.forEach((button, index) => {
            const baseColor = chartDataPie.datasets[0].backgroundColor[index];
            button.style.backgroundColor = hexToRGBA(baseColor, 0.65);
            button.style.borderColor = baseColor;
            button.style.borderWidth = '3px';
            button.style.borderStyle = 'solid';
        });

        // Show/hide legend buttons based on current data
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

        const carbonFootprintConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Carbon Footprint (tonnes)',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: true,
                        borderWidth: 2,
                        yAxisID: 'y1'
                    },
                ]
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

    // Reset the location filter to its default value
    const locationDropdown = document.getElementById('locationSelect');
    locationDropdown.value = 'all_locations'; // Change this to your default value
});
