// scripts/predictions.js

// Placeholder variable until school ID can be dynamically set
const placeholderID = 1; // Example school ID

// Chart Instances
let predictedEnergyChart;
let predictedCarbonChart;
let energyCarbonComparisonChart;
let trendAnalysisChart;

// Get references to buttons
const generatePredictionsBtn = document.getElementById('generatePredictionsBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// Add Event Listener to the "Generate Predictions" Button
generatePredictionsBtn.addEventListener('click', () => {
  generatePredictions();
});

// Add Event Listener to the "Download Predictions as PDF" Button
downloadPdfBtn.addEventListener('click', () => {
  downloadPredictionsAsPDF();
});

function showLoadingScreen() {
  document.getElementById('loading-screen').style.display = 'block';
  document.getElementById('prediction').style.display = 'none';
}

function hideLoadingScreen() {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('prediction').style.display = 'block';
}

// Function to Generate Predictions for All Future Years
async function generatePredictions() {
  try {
    showLoadingScreen(); // Show loading screen

    // Clear existing charts and data
    clearCharts();
    clearNetZeroEstimation();
    hidePredictionComponents(); // Hide components before generating predictions

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

    // Display Net Zero Estimation
    displayNetZeroEstimation(netZeroData);

    // Show prediction components after successful generation
    showPredictionComponents();

    // Show the download button
    downloadPdfBtn.classList.remove('hidden');

  } catch (error) {
    console.error('Error generating predictions:', error);
    document.getElementById('errorMessage').textContent = `Error: ${error.message}`;
    document.getElementById('errorMessage').style.display = 'block';

    // Hide the download button if there's an error
    downloadPdfBtn.classList.add('hidden');

  } finally {
    hideLoadingScreen(); // Hide loading screen
  }
}

// Function to Download Predictions as a PDF
function downloadPredictionsAsPDF() {
  const predictionsContent = document.getElementById('predictionComponents');

  // Define PDF options
  const opt = {
    margin:       0,
    filename:     'Predictions.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Generate and save the PDF
  html2pdf().set(opt).from(predictionsContent).save();
}

// Function to Show Prediction Components
function showPredictionComponents() {
  const predictionComponents = document.getElementById('predictionComponents');
  predictionComponents.classList.remove('hidden');
}

// Function to Hide Prediction Components
function hidePredictionComponents() {
  const predictionComponents = document.getElementById('predictionComponents');
  predictionComponents.classList.add('hidden');
}

// Function to Clear Existing Charts
function clearCharts() {
  if (predictedEnergyChart) {
    predictedEnergyChart.destroy();
    predictedEnergyChart = null;
  }
  if (predictedCarbonChart) {
    predictedCarbonChart.destroy();
    predictedCarbonChart = null;
  }
  if (energyCarbonComparisonChart) {
    energyCarbonComparisonChart.destroy();
    energyCarbonComparisonChart = null;
  }
  if (trendAnalysisChart) {
    trendAnalysisChart.destroy();
    trendAnalysisChart = null;
  }
}

// Function to Clear Net Zero Estimation
function clearNetZeroEstimation() {
  const container = document.getElementById('netZeroEstimation');
  container.textContent = '';
}

// Function to Render Predicted Energy Usage Chart
function renderPredictedEnergyChart(predictionsData) {
  const ctx = document.getElementById('predictedEnergyChart').getContext('2d');

  const labels = predictionsData.map(p => `${p.year}`);
  const actualEnergyData = predictionsData.map(p => p.predicted_energy_kwh);
  const idealEnergyData = predictionsData.map(p => p.ideal_energy_kwh);

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
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Predicted vs. Ideal Energy Usage',
        },
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true },
          scaleLabel: { display: true, labelString: 'Energy Usage (kWh)' },
        }],
        xAxes: [{
          scaleLabel: { display: true, labelString: 'Year' },
          ticks: { autoSkip: false },
        }],
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
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Predicted vs. Ideal Carbon Emissions',
        },
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true },
          scaleLabel: { display: true, labelString: 'Carbon Emissions (tons)' },
        }],
        xAxes: [{
          scaleLabel: { display: true, labelString: 'Year' },
          ticks: { autoSkip: false },
        }],
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
          yAxisID: 'y-axis-energy',
        },
        {
          label: 'Predicted Carbon Emissions (tons)',
          data: carbonData,
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          yAxisID: 'y-axis-carbon',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        yAxes: [
          {
            id: 'y-axis-energy',
            position: 'left',
            ticks: { beginAtZero: true },
            scaleLabel: { display: true, labelString: 'Energy Usage (kWh)' },
          },
          {
            id: 'y-axis-carbon',
            position: 'right',
            ticks: { beginAtZero: true },
            scaleLabel: { display: true, labelString: 'Carbon Emissions (tons)' },
            gridLines: { drawOnChartArea: false },
          },
        ],
        xAxes: [{
          scaleLabel: { display: true, labelString: 'Year' },
          ticks: { autoSkip: false },
        }],
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
          yAxisID: 'y-axis-energy',
        },
        {
          label: 'Carbon Emissions Trend',
          data: carbonData,
          borderColor: 'rgba(255, 99, 132, 1)',
          fill: false,
          yAxisID: 'y-axis-carbon',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        yAxes: [
          {
            id: 'y-axis-energy',
            position: 'left',
            ticks: { beginAtZero: true },
            scaleLabel: { display: true, labelString: 'Energy Usage (kWh)' },
          },
          {
            id: 'y-axis-carbon',
            position: 'right',
            ticks: { beginAtZero: true },
            scaleLabel: { display: true, labelString: 'Carbon Emissions (tons)' },
            gridLines: { drawOnChartArea: false },
          },
        ],
        xAxes: [{
          scaleLabel: { display: true, labelString: 'Year' },
          ticks: { autoSkip: false },
        }],
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
