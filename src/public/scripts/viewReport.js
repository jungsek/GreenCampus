document.addEventListener('DOMContentLoaded', () => {
    const errorOutput = document.getElementById('errorOutput');
    const reportContentDiv = document.getElementById('reportContent');

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('reportId');

    // Variables to store recommendation and prediction data
    let recommendationData = null;
    let predictionData = null;

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    downloadPdfBtn.disabled = true; // Disable the button initially

    if (!reportId) {
        displayError('No report ID specified.');
        return;
    }

    fetchReport(reportId);

    async function fetchReport(reportId) {
        try {
            const response = await fetch(`/api/reports/id/${reportId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch report.');
            }
            const data = await response.json();

            // Store the recommendation and prediction data
            recommendationData = data.recommendationData;
            predictionData = data.predictionData;

            displayReport(data.report.content);
        } catch (error) {
            console.error('Error fetching report:', error);
            displayError('An error occurred while fetching the report.');
        }
    }

    function displayError(message) {
        errorOutput.textContent = message;
        errorOutput.classList.remove('hidden');
    }

    function displayReport(content) {
        // Sanitize and display the report content
        reportContentDiv.innerHTML = content;

        // Initialize charts after the report is displayed
        initCharts();
    }

    downloadPdfBtn.addEventListener('click', () => {
        downloadReportAsPDF();
    });

    function downloadReportAsPDF() {
        const reportContent = document.getElementById('reportContent');

        // Define PDF options
        const opt = {
            margin:       0,
            filename:     `Report_${reportId}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate and save the PDF
        html2pdf().set(opt).from(reportContent).save();
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
                // Enable the download button after charts are rendered
                setTimeout(() => {
                    downloadPdfBtn.disabled = false;
                }, 1000); // Adjust the timeout as needed
    }

    // Functions to initialize charts for recommendations and predictions
    function initRecommendationCharts() {
        // For Areas of Concern
        document.querySelectorAll('.chart-placeholder[data-chart-type="areaOfConcern"]').forEach((placeholder) => {
            const index = placeholder.getAttribute('data-index');
            const area = recommendationData.areas_of_concern[index];

            // Create canvas element
            const canvas = document.createElement('canvas');
            canvas.height = 400;
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
            canvas.height = 400;
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
            canvas.height = 400;
            energyChartContainer.appendChild(canvas);
            renderPredictedEnergyChart(canvas, predictionData.predictions);
        }

        // Predicted Carbon Chart
        const carbonChartContainer = document.getElementById('predictedCarbonChartContainer');
        if (carbonChartContainer) {
            const canvas = document.createElement('canvas');
            canvas.height = 400;
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
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Values',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Labels',
                        },
                    },
                },
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
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Values',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Labels',
                        },
                    },
                },
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
});
