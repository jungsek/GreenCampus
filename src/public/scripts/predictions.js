// scripts/predictions.js

// Placeholder variables until school ID can be dynamically set
const placeholderID = 1; // Example school ID
const currentYear = new Date().getFullYear();

// Function to Generate Predictions for All Future Years
async function generatePredictions() {
    try {
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';

        const response = await fetch('/api/predictions/generate', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ schoolId: placeholderID }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch predictions.');
        }

        const data = await response.json();
        const predictionsData = data.predictions;
        const netZeroData = data.net_zero_estimation;

        if (!predictionsData || predictionsData.length === 0) {
            throw new Error('No prediction data available.');
        }

        // Render Charts with the Retrieved Predictions
        renderPredictedEnergyChart(predictionsData, currentYear);
        renderPredictedCarbonChart(predictionsData, currentYear);
        renderEnergyCarbonComparisonChart(predictionsData, currentYear);

        // Display Net Zero Estimation if data exists
        if (netZeroData) {
            displayNetZeroEstimation(netZeroData);
        } else {
            console.warn('No net zero estimation data available.');
        }

    } catch (error) {
        console.error('Error generating predictions:', error);
        document.getElementById('errorMessage').textContent = `Error: ${error.message}`;
        document.getElementById('errorMessage').style.display = 'block';
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}


// Chart Instances
let predictedEnergyChart;
let predictedCarbonChart;
let energyCarbonComparisonChart;

// Function to Render Predicted Energy Usage Chart
function renderPredictedEnergyChart(predictionsData, year) {
    const ctx = document.getElementById('predictedEnergyChart').getContext('2d');

    const labels = predictionsData.map(p => `${p.year} ${p.month}`);
    const energyData = predictionsData.map(p => p.predicted_energy_kwh);

    // Destroy existing chart if it exists
    if (predictedEnergyChart) {
        predictedEnergyChart.destroy();
    }

    predictedEnergyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Predicted Energy Usage (kWh)',
                data: energyData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Predicted Energy Usage for ${year} and Beyond`
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} kWh`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energy Usage (kWh)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year and Month'
                    }
                }
            }
        }
    });

    // Display Net Zero Estimation
    displayNetZeroEstimation(predictionsData.net_zero_estimation);
}

// Function to Render Predicted Carbon Emissions Chart
function renderPredictedCarbonChart(predictionsData, year) {
    const ctx = document.getElementById('predictedCarbonChart').getContext('2d');

    const labels = predictionsData.map(p => `${p.year} ${p.month}`);
    const carbonData = predictionsData.map(p => p.predicted_carbon_tons);
    

    // Destroy existing chart if it exists
    if (predictedCarbonChart) {
        predictedCarbonChart.destroy();
    }

    predictedCarbonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Predicted Carbon Emissions (tons)',
                data: carbonData,
                backgroundColor: 'rgba(255, 99, 132, 0.4)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Predicted Carbon Emissions for ${year} and Beyond`
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} tons`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Carbon Emissions (tons)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year and Month'
                    }
                }
            }
        }
    });
}

// Function to Render Energy Usage vs. Carbon Emissions Comparison Chart
function renderEnergyCarbonComparisonChart(predictionsData, year) {
    const ctx = document.getElementById('energyCarbonComparisonChart').getContext('2d');

    const labels = predictionsData.map(p => `${p.year} ${p.month}`);
    const energyData = predictionsData.map(p => p.predicted_energy_kwh);
    const carbonData = predictionsData.map(p => p.predicted_carbon_tons);

    // Destroy existing chart if it exists
    if (energyCarbonComparisonChart) {
        energyCarbonComparisonChart.destroy();
    }

    energyCarbonComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Predicted Energy Usage (kWh)',
                    data: energyData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Predicted Carbon Emissions (tons)',
                    data: carbonData,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            plugins: {
                title: {
                    display: true,
                    text: `Energy Usage vs. Carbon Emissions for ${year} and Beyond`
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Predicted Energy Usage (kWh)') {
                                return `${context.dataset.label}: ${context.parsed.y} kWh`;
                            } else {
                                return `${context.dataset.label}: ${context.parsed.y} tons`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Energy Usage (kWh)'
                    },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Carbon Emissions (tons)'
                    },
                    beginAtZero: true,

                    // grid line settings
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year and Month'
                    }
                }
            }
        }
    });
}

// Function to Display Net Zero Estimation
function displayNetZeroEstimation(netZeroData) {
    const container = document.getElementById('netZeroEstimation');
    if (!netZeroData) {
        container.textContent = 'No net zero estimation data available.';
        return;
    }

    // Update container content if data is valid
    container.innerHTML = `
        <h3>Net Zero Estimation</h3>
        <p>Current Status: ${netZeroData.current_status}</p>
        <p>Estimated Year to Net Zero: ${netZeroData.estimated_year_to_net_zero}</p>
    `;
}


// Initialize Predictions on Page Load
window.addEventListener('DOMContentLoaded', (event) => {
    generatePredictions();
});
