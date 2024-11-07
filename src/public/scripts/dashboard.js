placeholderID = 1; //placeholder until school id can be transferred from login
placeholderYear = 2024
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; //For labeling of charts
const yearSelect = document.getElementById("yearsFilter")
function getMonthFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.getMonth() + 1; // Adding 1 because JavaScript months are zero-indexed (0 = January, 11 = December)
}

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
            onClick: function(event, activeElements) {
                if (activeElements.length > 0) {
                    const clickedIndex = activeElements[0].index;
                    const dataset = this.data.datasets[0];
            
                    // Reset the background color for all bars and apply the transition
                    dataset.backgroundColor = dataset.backgroundColor.map((color, index) => {
                        return index === clickedIndex
                            ? 'rgba(255, 159, 64, 1)'  // Highlight clicked bar with orange color
                            : 'rgba(255, 159, 64, 0.3)'; // Dim other bars
                    });
            
                    // Reset the border color and apply transition
                    dataset.borderColor = dataset.borderColor.map((color, index) => {
                        return index === clickedIndex
                            ? 'rgba(255, 159, 64, 1)'  // Orange color for clicked bar border
                            : 'rgba(255, 159, 64, 1)'; // Keeping the same border color for others
                    });
            
                    // Update the chart with a transition for smooth animation
                    this.update({
                        duration: 300, // 0.3s transition duration
                        easing: 'easeInOutQuad', // Smooth easing function for animation
                    });
                }
            }
            
        }
    };

    const energyCtx = document.getElementById('energyTemperatureChart').getContext('2d');
    energyTemperatureChart = new Chart(energyCtx, energyTemperatureConfig);
}

initEnergyTempChart();



/*const energyTemperatureData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        {
            label: 'Energy (kWh)',
            type: 'bar',
            data: [270, 180, 200, 100, 120, 50, 60, 130, 70, 50, 90, 190],
            backgroundColor: 'rgba(255, 159, 64, 0.5)', // Light orange
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            yAxisID: 'y1'
        },
        {
            label: 'Temperature (°C)',
            type: 'line',
            data: [-6, 0, 6, 12, 18, 24, 28, 30, 26, 20, 10, 2],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light green for the line
            fill: false,
            yAxisID: 'y2'
        }
    ]
};

const energyTemperatureConfig = {
    type: 'bar',
    data: energyTemperatureData,
    options: {
        responsive: true,
        maintainAspectRatio: false, 
        scales: {
            y1: {
                type: 'linear',
                position: 'left',
                beginAtZero: true,
                max: 350, // Adjust based on the maximum energy value
                ticks: {
                    callback: function(value) {
                        return value + ' kWh'; // Add unit to tick labels
                    }
                }
            },
            y2: {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                max: 35, // Adjust based on maximum temperature
                ticks: {
                    callback: function(value) {
                        return value + '°C'; // Add unit to tick labels
                    }
                }
            }
        }
    }
};

// Initialize the energy vs. temperature chart
const energyCtx = document.getElementById('energyTemperatureChart').getContext('2d');
const energyTemperatureChart = new Chart(energyCtx, energyTemperatureConfig);
*/

let currentChart; // Global variable to hold the current chart instance
let uniqueLocations = [];
let uniqueCategories = []; // Store unique categories for button visibility

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
    uniqueLocations.unshift("all_locations"); // Prepend "all_locations" option

    const locationDropdown = document.getElementById('locationSelect');

    uniqueLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location; // Set the value to the location
        option.textContent = location === "all_locations" ? "All Locations" : location; // Set display text
        locationDropdown.appendChild(option);
    });
    // End populate dropdown--------------------

    // Function to filter data by location
    function filterDataByLocation(fetchedData, selectedLocation) {
        let filteredData;
        if (selectedLocation === "all_locations") {
            filteredData = fetchedData; // Use all data if "all_locations" is selected
        } else {
            filteredData = fetchedData.filter(item => item.location === selectedLocation);
        }

        filteredData = filteredData.filter(item => new Date(item.timestamp).getFullYear() === placeholderYear);
        return aggregateData(filteredData);
    }

    // Function to get previous year's data for comparison
    function getPreviousYearData(fetchedData, selectedLocation) {
        let previousYearData;
        if (selectedLocation === "all_locations") {
            previousYearData = fetchedData.filter(item => new Date(item.timestamp).getFullYear() === placeholderYear - 1);
        } else {
            previousYearData = fetchedData.filter(item => item.location === selectedLocation && new Date(item.timestamp).getFullYear() === placeholderYear - 1);
        }

        return aggregateData(previousYearData);
    }

    // Function to aggregate data for a specific year
    function aggregateData(filteredData) {
        const Label = [];
        const Percentage = [];

        filteredData.forEach(item => {
            if (!Label.includes(item.category)) {
                Label.push(item.category);
                Percentage.push(item.percentage);
            }
        });

        return { Label, Percentage };
    }

    // Function to initialize the pie chart
    function initializePieChart(currentData, previousData) {
        // Destroy the current chart if it exists
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
                            const previousValue = previousData.Percentage[previousData.Label.indexOf(category)] || 0; // Fallback to 0 if not found
                            if (previousValue){
                                const change = ((currentValue - previousValue) / previousValue * 100).toFixed(1); // Calculate percentage change
                                return `${category}: ${currentValue}% (${change >= 0 ? '+' : ''}${change}% from last year)`;
                            }
                            else {
                                return `${category}: ${currentValue}% (last year's data unavailable)`;
                            }
                        }
                    }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.forEach(data => {
                            sum += data;
                        });
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

        // Function to convert a hex color to RGBA with specified opacity
        function hexToRGBA(hex, opacity) {
            const num = parseInt(hex.slice(1), 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        // Update the legend button colors dynamically with 60% opacity
        const legendButtons = document.querySelectorAll('#legendButtons button');
        legendButtons.forEach((button, index) => {
            const baseColor = chartDataPie.datasets[0].backgroundColor[index];
            button.style.backgroundColor = hexToRGBA(baseColor, 0.65); // Set background colour to 65% opacity
            button.style.borderColor = baseColor; // Border uses the original color
            button.style.borderWidth = '3px';
            button.style.borderStyle = 'solid';
        });

        // Show or hide legend buttons based on current data
        showHideLegendButtons(currentData.Label);
    }

    // Function to show/hide legend buttons based on the categories in current data
    function showHideLegendButtons(currentLabels) {
        const legendButtons = document.querySelectorAll('#legendButtons button');
        legendButtons.forEach(button => {
            const category = button.getAttribute('data-segment');
            if (currentLabels.includes(category)) {
                button.style.display = 'inline-block'; // Show button
            } else {
                button.style.display = 'none'; // Hide button
            }
        });
    }

    // Initialize the pie chart with data for "All Locations" by default
    const allData = filterDataByLocation(fetchedData, "all_locations");
    const previousYearData = getPreviousYearData(fetchedData, "all_locations");
    initializePieChart(allData, previousYearData);

    // Event listener for location dropdown change
    locationDropdown.addEventListener('change', function() {
        const selectedLocation = this.value; // Get the selected location
        const currentFilteredData = filterDataByLocation(fetchedData, selectedLocation);
        const previousYearFilteredData = getPreviousYearData(fetchedData, selectedLocation);
        initializePieChart(currentFilteredData, previousYearFilteredData); // Update the pie chart with filtered data
    });
}

initPieChart();


// Function to show the popup and update its content
function highlightSegment(segment) {
    const popupTitle = document.getElementById("popupTitle");
    const popupMessage = document.getElementById("popupMessage");

    // // Update the popup content based on the clicked segment
    // popupTitle.textContent = segment;
    // popupMessage.textContent = `Details about ${segment} will go here.`;  

    // Use innerHTML to display the HTML content properly
    popupTitle.textContent = popupMessages[segment].title;
    popupMessage.innerHTML = popupMessages[segment].message;

    // Show the popup modal
    document.getElementById("popupModal").style.display = "flex"; 
}

// Function to close the popup
function closePopup() {
    document.getElementById("popupModal").style.display = "none"; 
}

// Close the popup when clicking outside of the popup content
document.getElementById("popupModal").addEventListener("click", function(event) {
    const popupContent = document.querySelector(".popup-content");
    if (!popupContent.contains(event.target)) {
        closePopup();
    }
});




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
    initPieChart();
    initCarbonFootprintChart(); 

    // Reset the location filter to its default value
    const locationDropdown = document.getElementById('locationSelect');
    locationDropdown.value = 'all_locations'; // Change this to your default value
});
