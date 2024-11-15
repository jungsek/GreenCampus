// scripts/predictions.js

// Placeholder variable until school ID can be dynamically set
const placeholderID = 1; // Example school ID

const staticPredictionData = {
  "predictions": [
    {
      "year": 2024,
      "predicted_energy_kwh": 1100,
      "ideal_energy_kwh": 900,
      "predicted_carbon_tons": 0.85,
      "ideal_carbon_tons": 0.70
    },
    {
      "year": 2025,
      "predicted_energy_kwh": 1080,
      "ideal_energy_kwh": 880,
      "predicted_carbon_tons": 0.83,
      "ideal_carbon_tons": 0.68
    },
    {
      "year": 2026,
      "predicted_energy_kwh": 1120,
      "ideal_energy_kwh": 860,
      "predicted_carbon_tons": 0.87,
      "ideal_carbon_tons": 0.66
    },
    {
      "year": 2027,
      "predicted_energy_kwh": 1050,
      "ideal_energy_kwh": 840,
      "predicted_carbon_tons": 0.80,
      "ideal_carbon_tons": 0.64
    },
    {
      "year": 2028,
      "predicted_energy_kwh": 1030,
      "ideal_energy_kwh": 820,
      "predicted_carbon_tons": 0.78,
      "ideal_carbon_tons": 0.62
    },
    {
      "year": 2029,
      "predicted_energy_kwh": 1070,
      "ideal_energy_kwh": 800,
      "predicted_carbon_tons": 0.82,
      "ideal_carbon_tons": 0.60
    },
    {
      "year": 2030,
      "predicted_energy_kwh": 1020,
      "ideal_energy_kwh": 780,
      "predicted_carbon_tons": 0.77,
      "ideal_carbon_tons": 0.58
    },
    {
      "year": 2031,
      "predicted_energy_kwh": 990,
      "ideal_energy_kwh": 760,
      "predicted_carbon_tons": 0.75,
      "ideal_carbon_tons": 0.56
    },
    {
      "year": 2032,
      "predicted_energy_kwh": 970,
      "ideal_energy_kwh": 740,
      "predicted_carbon_tons": 0.73,
      "ideal_carbon_tons": 0.54
    },
    {
      "year": 2033,
      "predicted_energy_kwh": 950,
      "ideal_energy_kwh": 720,
      "predicted_carbon_tons": 0.71,
      "ideal_carbon_tons": 0.52
    },
    {
      "year": 2034,
      "predicted_energy_kwh": 980,
      "ideal_energy_kwh": 700,
      "predicted_carbon_tons": 0.74,
      "ideal_carbon_tons": 0.50
    },
    {
      "year": 2035,
      "predicted_energy_kwh": 930,
      "ideal_energy_kwh": 680,
      "predicted_carbon_tons": 0.70,
      "ideal_carbon_tons": 0.48
    },
    {
      "year": 2036,
      "predicted_energy_kwh": 910,
      "ideal_energy_kwh": 660,
      "predicted_carbon_tons": 0.68,
      "ideal_carbon_tons": 0.46
    },
    {
      "year": 2037,
      "predicted_energy_kwh": 890,
      "ideal_energy_kwh": 640,
      "predicted_carbon_tons": 0.66,
      "ideal_carbon_tons": 0.44
    },
    {
      "year": 2038,
      "predicted_energy_kwh": 870,
      "ideal_energy_kwh": 620,
      "predicted_carbon_tons": 0.64,
      "ideal_carbon_tons": 0.42
    },
    {
      "year": 2039,
      "predicted_energy_kwh": 900,
      "ideal_energy_kwh": 600,
      "predicted_carbon_tons": 0.67,
      "ideal_carbon_tons": 0.40
    },
    {
      "year": 2040,
      "predicted_energy_kwh": 850,
      "ideal_energy_kwh": 580,
      "predicted_carbon_tons": 0.63,
      "ideal_carbon_tons": 0.38
    },
    {
      "year": 2041,
      "predicted_energy_kwh": 830,
      "ideal_energy_kwh": 560,
      "predicted_carbon_tons": 0.61,
      "ideal_carbon_tons": 0.36
    },
    {
      "year": 2042,
      "predicted_energy_kwh": 810,
      "ideal_energy_kwh": 540,
      "predicted_carbon_tons": 0.59,
      "ideal_carbon_tons": 0.34
    },
    {
      "year": 2043,
      "predicted_energy_kwh": 790,
      "ideal_energy_kwh": 520,
      "predicted_carbon_tons": 0.57,
      "ideal_carbon_tons": 0.32
    },
    {
      "year": 2044,
      "predicted_energy_kwh": 770,
      "ideal_energy_kwh": 500,
      "predicted_carbon_tons": 0.55,
      "ideal_carbon_tons": 0.30
    },
    {
      "year": 2045,
      "predicted_energy_kwh": 800,
      "ideal_energy_kwh": 480,
      "predicted_carbon_tons": 0.58,
      "ideal_carbon_tons": 0.28
    },
    {
      "year": 2046,
      "predicted_energy_kwh": 750,
      "ideal_energy_kwh": 460,
      "predicted_carbon_tons": 0.54,
      "ideal_carbon_tons": 0.26
    },
    {
      "year": 2047,
      "predicted_energy_kwh": 730,
      "ideal_energy_kwh": 440,
      "predicted_carbon_tons": 0.52,
      "ideal_carbon_tons": 0.24
    },
    {
      "year": 2048,
      "predicted_energy_kwh": 710,
      "ideal_energy_kwh": 420,
      "predicted_carbon_tons": 0.50,
      "ideal_carbon_tons": 0.22
    },
    {
      "year": 2049,
      "predicted_energy_kwh": 690,
      "ideal_energy_kwh": 400,
      "predicted_carbon_tons": 0.48,
      "ideal_carbon_tons": 0.21
    },
    {
      "year": 2050,
      "predicted_energy_kwh": 650,
      "ideal_energy_kwh": 350,
      "predicted_carbon_tons": 0.45,
      "ideal_carbon_tons": 0.20
    }
  ],
  "net_zero_estimation": {
    "current_status": "65% towards net zero",
    "estimated_year_to_net_zero": 2045
  }
};

// Flag to toggle between static and dynamic data
const useStaticData = true; // Set to false to enable API fetching

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

// Helper Sleep Function to Simulate Data Fetching Delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

    let data;

    if (useStaticData) {
      // Introduce a 3-second delay
      await sleep(3000); // 3000 milliseconds = 3 seconds

      // Select static data
      data = staticPredictionData;
    } else {
      // Call backend API to get predictions data
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

      data = await response.json();
    }
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

   // Temporarily hide the download button
   const downloadBtn = document.getElementById('downloadPdfBtn');
   downloadBtn.style.display = 'none';

    // Define PDF options
    const opt = {
      margin: [0.25, 0, 0.25, 0.25], // [top, left, bottom, right] in inches
      filename: 'Predictions.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 1200
      },
      jsPDF: { 
          unit: 'in',
          format: 'a4',
          orientation: 'portrait',
          compress: true
      },
      pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: ['canvas', '.card', '.chart-card', '.net-zero-container']
      }
  };
      // Resize charts before PDF generation
      const charts = document.querySelectorAll('canvas');
      charts.forEach(chart => {
          chart.style.height = '500px';
          chart.style.width = '100%';
      });

    // Generate PDF
    html2pdf().set(opt)
        .from(predictionsContent)
        .save()
        .then(() => {
          // Restore original chart sizes
          charts.forEach((chart) => {
            chart.style.height = '500px';
            chart.style.width = '100%';
          });
          // Show the download button again
          downloadBtn.style.display = 'block';
          if (typeof loadingDiv !== 'undefined' && loadingDiv) {
              document.body.removeChild(loadingDiv);
          }
      })
        .catch(error => {
            console.error('PDF generation error:', error);
            document.body.removeChild(loadingDiv);
            alert('Error generating PDF. Please try again.');
        });
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
