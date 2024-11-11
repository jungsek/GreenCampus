// scripts/predictions.js

// Placeholder variable until school ID can be dynamically set
const placeholderID = 1; // Example school ID

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
    renderPredictedEnergyChart(predictionsData);
    renderPredictedCarbonChart(predictionsData);
    renderEnergyCarbonComparisonChart(predictionsData);
    renderTrendAnalysisChart(predictionsData);
    renderEnergyBreakdownPieChart(predictionsData);

    // Display Net Zero Estimation
    displayNetZeroEstimation(netZeroData);

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
let trendAnalysisChart;
let energyBreakdownPieChart;

// Function to Render Predicted Energy Usage Chart
function renderPredictedEnergyChart(predictionsData) {
  const ctx = document.getElementById('predictedEnergyChart').getContext('2d');

  const labels = predictionsData.map(p => `${p.year}`);
  const actualEnergyData = predictionsData.map(p => p.predicted_energy_kwh);
  const idealEnergyData = predictionsData.map(p => p.ideal_energy_kwh);

  // Destroy existing chart if it exists
  if (predictedEnergyChart) {
    predictedEnergyChart.destroy();
  }

  predictedEnergyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Actual Energy Usage (kWh)',
          data: actualEnergyData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Ideal Energy Usage (kWh)',
          data: idealEnergyData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
          borderDash: [5, 5],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow chart to fill container
      plugins: {
        title: {
          display: true,
          text: 'Predicted vs. Ideal Energy Usage',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy Usage (kWh)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Year',
          },
          ticks: {
            autoSkip: false, // Show every year
          },
        },
      },
    },
  });
}

// Function to Render Predicted Carbon Emissions Chart
function renderPredictedCarbonChart(predictionsData) {
  const ctx = document.getElementById('predictedCarbonChart').getContext('2d');

  const labels = predictionsData.map(p => `${p.year}`);
  const actualCarbonData = predictionsData.map(p => p.predicted_carbon_tons);
  const idealCarbonData = predictionsData.map(p => p.ideal_carbon_tons);

  // Destroy existing chart if it exists
  if (predictedCarbonChart) {
    predictedCarbonChart.destroy();
  }

  predictedCarbonChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Actual Carbon Emissions (tons)',
          data: actualCarbonData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Ideal Carbon Emissions (tons)',
          data: idealCarbonData,
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 2,
          fill: false,
          borderDash: [5, 5],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow chart to fill container
      plugins: {
        title: {
          display: true,
          text: 'Predicted vs. Ideal Carbon Emissions',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Carbon Emissions (tons)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Year',
          },
          ticks: {
            autoSkip: false, // Show every year
          },
        },
      },
    },
  });
}

// Function to Render Energy Usage vs. Carbon Emissions Comparison Chart
function renderEnergyCarbonComparisonChart(predictionsData) {
  const ctx = document.getElementById('energyCarbonComparisonChart').getContext('2d');

  const labels = predictionsData.map(p => `${p.year}`);
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
          yAxisID: 'y',
        },
        {
          label: 'Predicted Carbon Emissions (tons)',
          data: carbonData,
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow chart to fill container
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      plugins: {
        title: {
          display: true,
          text: 'Energy Usage vs. Carbon Emissions',
        },
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Energy Usage (kWh)',
          },
          beginAtZero: true,
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Carbon Emissions (tons)',
          },
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
        },
        x: {
          title: {
            display: true,
            text: 'Year',
          },
          ticks: {
            autoSkip: false, // Show every year
          },
        },
      },
    },
  });
}

// Function to Render Trend Analysis Chart
function renderTrendAnalysisChart(predictionsData) {
  const ctx = document.getElementById('trendAnalysisChart').getContext('2d');

  const labels = predictionsData.map(p => `${p.year}`);
  const energyData = predictionsData.map(p => p.predicted_energy_kwh);
  const carbonData = predictionsData.map(p => p.predicted_carbon_tons);

  // Destroy existing chart if it exists
  if (trendAnalysisChart) {
    trendAnalysisChart.destroy();
  }

  trendAnalysisChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Energy Usage Trend',
          data: energyData,
          borderColor: 'rgba(54, 162, 235, 1)',
          fill: false,
          yAxisID: 'y',
        },
        {
          label: 'Carbon Emissions Trend',
          data: carbonData,
          borderColor: 'rgba(255, 99, 132, 1)',
          fill: false,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow chart to fill container
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      plugins: {
        title: {
          display: true,
          text: 'Trend Analysis',
        },
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Energy Usage (kWh)',
          },
          beginAtZero: true,
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Carbon Emissions (tons)',
          },
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          },
        },
        x: {
          title: {
            display: true,
            text: 'Year',
          },
          ticks: {
            autoSkip: false, // Show every year
          },
        },
      },
    },
  });
}

// Function to Render Energy Breakdown Forecast Pie Chart
function renderEnergyBreakdownPieChart(predictionsData) {
  const ctx = document.getElementById('energyBreakdownPieChart').getContext('2d');

  // Assuming you have breakdown data in predictionsData
  // For example, predictionsData[0].energy_breakdown = [{ category: 'Heating', percentage: 30 }, ...]
  const latestBreakdown = predictionsData[predictionsData.length - 1].energy_breakdown || [];

  const categories = latestBreakdown.map(b => b.category);
  const percentages = latestBreakdown.map(b => b.percentage);

  // Destroy existing chart if it exists
  if (energyBreakdownPieChart) {
    energyBreakdownPieChart.destroy();
  }

  energyBreakdownPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: percentages,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow chart to fill container
      plugins: {
        title: {
          display: true,
          text: 'Energy Breakdown Forecast',
        },
      },
    },
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
    <p>Current Status: ${netZeroData.current_status}</p>
    <p>Estimated Year to Net Zero: ${netZeroData.estimated_year_to_net_zero}</p>
  `;
}

// Initialize Predictions on Page Load
window.addEventListener('DOMContentLoaded', (event) => {
  generatePredictions();
});
