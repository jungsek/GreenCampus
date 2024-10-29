async function fetchEnergyUsageData() {
    let response = await fetch(`/dashboard/energyusage`, {
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
    let response = await fetch(`/dashboard/carbonfootprint`, {
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

// Initialize the doughnut charts
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

const ctx3 = document.getElementById('doughnutChart3').getContext('2d');
const doughnutChart3 = new Chart(ctx3, {
    type: 'doughnut',
    data: chartData,
    options: chartOptions
});

// ==================== Bar + Line Graph ====================

async function initEnergyTempChart(){
    const fetchedData = await fetchEnergyUsageData();

    const labels = fetchedData.map(item => item.month);
    const energyData = fetchedData.map(item => item.energy_kwh);
    const temperatureData = fetchedData.map(item => item.avg_temperature_c);
    const schID = fetchedData.map(item => item.school_id);

    const totalEnergy = energyData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const totalTemp = temperatureData.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Define the chart configuration
    const energyTemperatureConfig = {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
    avgEnergyTemp.innerHTML = `<p>Energy consumption:<br><strong> ${(totalEnergy/12).toFixed(2)} kWh/month</strong></p>
                            <p>Average Temperature:<br><strong>${(totalTemp/12).toFixed(1)}°C</strong></p>`

    // Initialize the energy vs. temperature chart
    const energyCtx = document.getElementById('energyTemperatureChart').getContext('2d');
    const energyTemperatureChart = new Chart(energyCtx, energyTemperatureConfig);
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


// ==================== Line Graph ====================
async function initCarbonFootprintChart() {
    const fetchedData = await fetchCarbonFootprintData();

    const schID = fetchedData.map(item => item.school_id);
    const totalCarbonFoot = fetchedData.map(item => item.total_carbon_tons);
    const month = fetchedData.map(item => new Date(item.timestamp).getMonth() + 1);

    const carbonFootprintConfig = {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Carbon Footprint (tonnes)',
                    type: 'line',
                    data: totalCarbonFoot,
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
                    max: 300, // Adjust based on expected maximum carbon footprint
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
}
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