// scripts/generate-report.js

document.addEventListener('DOMContentLoaded', () => {
    const generateReportBtn = document.getElementById('generateReportBtn');
    const yearSelect = document.getElementById('year');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const reportOutput = document.getElementById('reportOutput');
    // Variables to store recommendation and prediction data
    let recommendationData = null;
    let predictionData = null;

    // Assume the user is the principal of Lincoln High School with schoolId = 1
    const schoolId = 1;
    let ReportYear = 0;
    const school_name = "Lincoln High School";

    // Fetch available years on page load
    fetchAvailableYears(schoolId);
    function showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'block';
    }
      
    function hideLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'none';
    }

    generateReportBtn.addEventListener('click', async () => {
        const year = parseInt(yearSelect.value);
        ReportYear = year;
        if (isNaN(year)) {
            displayError('Please select a valid year.');
            return;
        }

        clearOutputs();
        showLoadingScreen();

        try {
            // Generate Report with schoolId and year
            const report = await generateReport(schoolId, year);

            // Display the report
            displayReport(report);
        } catch (error) {
            console.error('Error:', error);
            displayError('An error occurred while generating the report. Please try again later.');
        } finally {
            hideLoadingScreen();
        }
    });


    async function fetchAvailableYears(schoolId) {
        try {
            const response = await fetch(`/api/energy-usage/${schoolId}/years`);
            if (!response.ok) {
                throw new Error('Failed to fetch available years.');
            }
            const data = await response.json();
            populateYearDropdown(data.years);
        } catch (error) {
            console.error('Error fetching available years:', error);
            displayError('An error occurred while fetching available years.');
        }
    }

    function populateYearDropdown(years) {
        const yearSelect = document.getElementById('year');
        yearSelect.innerHTML = '<option value="">Select a year</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }


    function clearOutputs() {
        reportOutput.innerHTML = '';
        reportOutput.classList.add('hidden');
        downloadPdfBtn.classList.add('hidden'); // Hide the download button
    }

    async function generateReport(schoolId, year) {
        const response = await fetch(`/api/reports/${schoolId}?year=${year}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate report');
        }

        const data = await response.json();
        recommendationData = data.recommendationData;
        predictionData = data.predictionData;
        return data.report;
    }

    function displayReport(report) {
        const cleanHTML = DOMPurify.sanitize(report, { ADD_TAGS: ['style'] });
        reportOutput.innerHTML = cleanHTML;
        reportOutput.classList.remove('hidden');
        downloadPdfBtn.classList.remove('hidden'); // Show the download button when report is displayed

        // Initialize charts after the report is displayed
        initCharts();
    }

    // Function to initialize charts
    function initCharts() {
        // Initialize Recommendation Charts
        if (recommendationData) {
            initRecommendationCharts();
        }

        // Initialize Prediction Charts
        if (predictionData) {
            initPredictionCharts();
        }
    }

    // Functions to initialize charts for recommendations and predictions
    function initRecommendationCharts() {
        // For Areas of Concern
        document.querySelectorAll('.chart-placeholder[data-chart-type="areaOfConcern"]').forEach((placeholder) => {
            const index = placeholder.getAttribute('data-index');
            const area = recommendationData.areas_of_concern[index];
    
            // Create canvas element
            const canvas = document.createElement('canvas');
            placeholder.appendChild(canvas);
    
            // Render the chart
            renderAreaOfConcernChart(canvas, area.data);
        });
    
        // For Strengths
        document.querySelectorAll('.chart-placeholder[data-chart-type="strength"]').forEach((placeholder) => {
            const index = placeholder.getAttribute('data-index');
            const strength = recommendationData.strengths[index];

            // Create canvas element
            const canvas = document.createElement('canvas');
            placeholder.appendChild(canvas);

            // Render the chart
            renderStrengthChart(canvas, strength.data);
        });
    }

    function initPredictionCharts() {
        // Predicted Energy Chart
        const energyChartContainer = document.getElementById('predictedEnergyChartContainer');
        if (energyChartContainer) {
            const canvas = document.createElement('canvas');
            canvas.height = 400; // Set height in pixels
            energyChartContainer.appendChild(canvas);
            renderPredictedEnergyChart(canvas, predictionData.predictions);
        }
    
        // Predicted Carbon Chart
        const carbonChartContainer = document.getElementById('predictedCarbonChartContainer');
        if (carbonChartContainer) {
            const canvas = document.createElement('canvas');
            canvas.height = 400; // Set height in pixels
            carbonChartContainer.appendChild(canvas);
            renderPredictedCarbonChart(canvas, predictionData.predictions);
        }
    }
    

    // Chart rendering functions
    function renderAreaOfConcernChart(canvas, chartData) {
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'bar', 
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Values',
                    data: chartData.values,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    }

    function renderStrengthChart(canvas, chartData) {
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'line', 
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Values',
                    data: chartData.values,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54,162,235,1)',
                    borderWidth: 2,
                    fill: false,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    }

    function renderPredictedEnergyChart(canvas, predictions) {
        const ctx = canvas.getContext('2d');
    
        const labels = predictions.map(p => p.year);
        const actualEnergyData = predictions.map(p => p.predicted_energy_kwh);
        const idealEnergyData = predictions.map(p => p.ideal_energy_kwh);
    
        new Chart(ctx, {
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
                      autoSkip: false,
                    },
                  },
                },
              },
        });
    }
    

    function renderPredictedCarbonChart(canvas, predictions) {
        const ctx = canvas.getContext('2d');
    
        const labels = predictions.map(p => p.year);
        const actualCarbonData = predictions.map(p => p.predicted_carbon_tons);
        const idealCarbonData = predictions.map(p => p.ideal_carbon_tons);
    
        new Chart(ctx, {
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
                      autoSkip: false,
                    },
                  },
                },
              },
        });
    }
    


    // Event listener for the Download as PDF button
    downloadPdfBtn.addEventListener('click', () => {
        downloadReportAsPDF();
    });

    // Function to download the report as a PDF
    function downloadReportAsPDF() {
        const reportContent = document.getElementById('reportOutput');

        // Define PDF options
        const opt = {
            margin:       0,
            filename:     `Report_${school_name}_${ReportYear}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate and save the PDF
        html2pdf().set(opt).from(reportContent).save();
    }
});
