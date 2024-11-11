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
const chartData1 = {
    labels: ['Within Goal Limit', 'Reaching Goal Limit', 'Past Goal Limit'],
    datasets: [{
        label: 'Progress Towards Goal',
        data: [80, 20, 20], //first element green (80% of goal), second element yellow (20% remaining of goal), third element red (amount past goal)
        backgroundColor: [
            '#5bc7a0', // Color for within goal limit (green)
            '#f1c40f', // Color for reaching goal limit (yellow)
            '#FF0000',  //Color for past goal limit (red)
        ],
        borderColor: '#fff',
        borderWidth: 2,
        circumference: 180,
        rotation: 270,
    }]
};

const chartData2 = {
    labels: ['Within Goal Limit', 'Reaching Goal Limit', 'Past Goal Limit'],
    datasets: [{
        label: 'Progress Towards Goal',
        data: [80, 20, 20], //first element green (80% of goal), second element yellow (20% remaining of goal), third element red (amount past goal)
        backgroundColor: [
            '#5bc7a0', // Color for within goal limit (green)
            '#f1c40f', // Color for reaching goal limit (yellow)
            '#FF0000',  //Color for past goal limit (red)
        ],
        borderColor: '#fff',
        borderWidth: 2,
        circumference: 180,
        rotation: 270,
    }]
};

const doughnutPointer = {
    id: 'doughnutPointer',
    afterDatasetsDraw(chart, args, plugins) {
        const {ctx, data} = chart;

        ctx.save()

        const xCenter = chart.getDatasetMeta(0).data[0].x;
        const yCenter = chart.getDatasetMeta(0).data[0].y;
        const innerRadius = chart.getDatasetMeta(0).data[0].innerRadius;
        const outerRadius = chart.getDatasetMeta(0).data[0].outerRadius;
        const doughnutThickness = outerRadius - innerRadius;

        const pointerColor = plugins.pointerColor || 'black';
        const pointerValue = plugins.pointerValue || 1;
        const pointerRadius = plugins.pointerRadius || 5;
        const angle = Math.PI / 180;

        //total value of data (adds up to 120)
        function sumArray(arr) {
            return arr.reduce((acc, current) => acc + current, 0);
        }

        const dataPointArray = data.datasets[0].data.map((datapoint) => {
            return datapoint
        })

        const totalSum = sumArray(dataPointArray);
        const targetPointerRotation = (pointerValue / totalSum * 180) - 90;
        const datapointPercentage = data.datasets[0].data[0] / totalSum * 120;

        //text
        ctx.font = 'bold 1.0rem sans-serif';
        ctx.fillStyle = pointerColor;
        ctx.textAlign = 'center';
        ctx.baseline = 'middle'
        ctx.fillText(`${datapointPercentage.toFixed(1)}%`, xCenter, yCenter);

        //pointer
        ctx.translate(xCenter, yCenter);
        ctx.rotate(angle * targetPointerRotation);

        ctx.beginPath();
        ctx.fillStyle = pointerColor;
        ctx.roundRect(0 - 2.5, -outerRadius - 3, 3, doughnutThickness + 5,
            pointerRadius); //x,y,w,h
        ctx.fill();
        
        ctx.restore();

    }
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // Ring effect
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
        },
        doughnutPointer: {
            pointerValue: chartData1.datasets[0].data[0], //value should be the total amount used currently
            pointerColor: 'black',
            pointerRadius: 2
        }
    }
};

//Initialize the doughnut charts
const ctx1 = document.getElementById('doughnutChart1').getContext('2d');
const doughnutChart1 = new Chart(ctx1, {
    type: 'doughnut',
    data: chartData1,
    options: chartOptions,
    plugins: [doughnutPointer]
});

const ctx2 = document.getElementById('doughnutChart2').getContext('2d');
const doughnutChart2 = new Chart(ctx2, {
    type: 'doughnut',
    data: chartData2,
    options: chartOptions,
    plugins: [doughnutPointer]
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
            const monthIndex = getMonthFromTimestamp(item.timestamp) - 1; // 0 = January, 11 = December

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
            labels: Object.keys(monthlyEnergyData).map(monthIndex => monthNames[monthIndex]), // Convert index to month name
            totalEnergy: Object.values(monthlyEnergyData),
            totalTemp: Object.values(monthlyTempData)
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

    // Define the chart configuration
    const energyTemperatureConfig = {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: 'Energy (kWh)',
                    type: 'bar',
                    data: energyData,
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
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

// ==================== Pie Chart ====================
let currentChart; // Global variable to hold the current chart instance
let uniqueLocations = [];
async function initPieChart() {
    const fetchedData = await fetchEnergyBreakdownData();
    
    // TO POPULATE DROPDOWN-------------------------
    
    fetchedData.forEach(data => {
        if (!uniqueLocations.includes(data.location)) {
            uniqueLocations.push(data.location);
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
                backgroundColor: ['#5bc7a0', '#f1c40f', '#e74c3c', '#3498db', '#9b59b6'] // Colors for each segment
            }]
        };

        const pieChartOptions = {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
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



/*
const chartDataPie = {
    labels: ['Lights', 'Fans', 'Computers', 'Projectors', 'Air Conditioners '],
    datasets: [{
        data: [40, 15, 25, 10, 10], // Sample data
        backgroundColor: ['#5bc7a0', '#f1c40f', '#e74c3c', '#3498db', '#9b59b6'] // Colors for each segment
    }]
};

const pieChartOptions = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'right', // Position the legend to the right
            labels: {
                boxWidth: 20, // Size of the color box in the legend
                padding: 15 // Space between legend items
                
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

const energyData = {
    'classroom': {
        labels: ['Lights', 'Fans', 'Computers', 'Projectors', 'Air Conditioners'],
        data: [40, 15, 25, 10, 10]
    },
    'library': {
        labels: ['Lights', 'Computers', 'Air Conditioners'],
        data: [50, 30, 20]
    },
    'lab': {
        labels: ['Lights', 'Microscopes', 'Lab Freezers', 'Fans'],
        data: [30, 35, 50, 15]
    },
    'staffroom': {
        labels: ['Lights', 'Printers', 'Air Conditioners'],
        data: [60, 20, 20]
    },
    'canteen': {
        labels: ['Lights', 'Fans', 'Refrigerators', 'Stove'],
        data: [20, 15, 35, 25,]
    }
};

//Piechart filter
// Function to apply default filter on page load
window.onload = function() {
    filterPieData(); // Calls the filter function with the default "Locations" option
};


// Update the filterData function
function filterPieData() {
    const locationSelect = document.getElementById('locationSelect');
    const selectedValue = locationSelect.value;

    let filteredLabels = [];
    let filteredData = [];

    if (selectedValue === 'all_locations') {
        // Combine total energy consumption per location
        filteredLabels = Object.keys(energyData); // Labels will be the location names
        filteredData = Object.values(energyData).map(location => {
            return location.data.reduce((acc, val) => acc + val, 0); // Sum of all appliances in the location
        });

    } else if (selectedValue === 'all_appliances') {
        // Group data by appliance type across all locations
        const applianceTotals = {};

        Object.values(energyData).forEach(location => {
            location.labels.forEach((label, index) => {
                applianceTotals[label] = (applianceTotals[label] || 0) + location.data[index];
            });
        });

        filteredLabels = Object.keys(applianceTotals);
        filteredData = Object.values(applianceTotals);

    } else {
        // Filter for a specific location
        filteredLabels = energyData[selectedValue].labels;
        filteredData = energyData[selectedValue].data;
    }

    // Update chart with filtered data
    pieChart.data.labels = filteredLabels;
    pieChart.data.datasets[0].data = filteredData;
    pieChart.update();
}


// Add event listener to filter dropdown
document.getElementById('locationSelect').addEventListener('change', filterPieData);


// Initialize the pie chart with the right-positioned legend
const pieCtx = document.getElementById('pieChart').getContext('2d');
const pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: chartDataPie,
    options: pieChartOptions,
    plugins: [ChartDataLabels] // Register the data labels plugin if used
});
*/
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




//test
/*
const carbonFootprintData = {
    months: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [2.7, 1.8, 2.0, 1.0, 1.2, 0.5, 0.6, 1.3, 0.7, 0.5, 0.9, 1.9], // Monthly data in tonnes
    },
    years: {
        labels: ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
        data: [19.8 ,22.4, 27.6, 25.8, 27.9, 30.8, 18.9, 27.4, 29.8, 30.0], // Yearly data in tonnes
    }
};

function filterData() {
    const selection = document.getElementById('yearMonthSelect').value;
    let filteredLabels;
    let filteredData;
    

    if (selection === 'years') {
        filteredLabels = carbonFootprintData.years.labels;
        filteredData = carbonFootprintData.years.data;
    } else if (selection === 'months') {
        filteredLabels = carbonFootprintData.months.labels;
        filteredData = carbonFootprintData.months.data;
    }

    // Update the chart with the selected data
    carbonFootprintGraph.data.labels = filteredLabels;
    carbonFootprintGraph.data.datasets[0].data = filteredData;
    
    // Calculate the maximum value for the y-axis
    const maxDataValue = Math.max(...filteredData); // Get the maximum data value
    carbonFootprintGraph.options.scales.y1.max = Math.ceil(maxDataValue * 1.1); // Set max to 10% above the max data value

    carbonFootprintGraph.update();
}


const carbonFootprintConfig = {
    type: 'line',
    data: {
        labels: carbonFootprintData.months.labels,
        datasets: [
            {
                label: 'Carbon Footprint (tonnes)',
                type: 'line',
                data: carbonFootprintData.months.data,
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
                max: 20, // Adjust based on expected maximum carbon footprint
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
const carbonFootprintGraph = new Chart(carbonCtx, carbonFootprintConfig);
*/

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
