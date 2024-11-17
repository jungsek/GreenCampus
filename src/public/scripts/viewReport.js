guardLoginPage();

const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
const role = sessionStorage.getItem("role") || localStorage.getItem("role");

console.log('Role:', role); // Debugging log
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
    
        // Add a class for PDF-specific styles
        reportContent.classList.add('pdf-export');
    
        // Resize charts for PDF
        resizeChartsForPDF();   
    
        // Define PDF options
        const opt = {
            margin: 1,
            filename: `Report_${reportId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak: { mode: 'avoid-all', before: '.page-break' }
        };
    
        // Generate and save the PDF    
        html2pdf()
            .set(opt)
            .from(reportContent)
            .save()
            .then(() => {
                // Remove the PDF-specific class and reset chart sizes after generation
                reportContent.classList.remove('pdf-export');
                resetChartSizes();
            });
    }
    
    // Add these two functions from generate-report.js
    function resizeChartsForPDF() {
        const charts = document.querySelectorAll('canvas');
        charts.forEach((chart) => {
            const chartContainer = chart.parentElement;
            chart.style.width = '100%';
            chart.style.height = 'auto';
            chartContainer.style.maxWidth = '720px';
            chartContainer.style.maxHeight = '500px';
        });
    }
    
    function resetChartSizes() {
        const charts = document.querySelectorAll('canvas');
        charts.forEach((chart) => {
            chart.style.width = '';
            chart.style.height = '';
            const chartContainer = chart.parentElement;
            chartContainer.style.maxWidth = '';
            chartContainer.style.maxHeight = '';
        });
    }

    function initCharts() {
        // Initialize Recommendation Charts
        if (recommendationData) {
            // Initialize Areas of Concern Charts
            recommendationData.areas_of_concern.forEach((area, index) => {
                try {
                    const chartData = {
                        labels: area.data.labels,
                        values: area.data.values,
                        temperature: area.data.temperature
                    };
    
                    const canvas = document.getElementById(`areaChart${index}`);
                    if (canvas) {
                        canvas.height = 500; // Set fixed height
                        if (index === 0) {
                            renderEnergyChart(canvas, chartData);
                        } else {
                            renderCarbonChart(canvas, chartData);
                        }
                    }
                } catch (error) {
                    console.error('Error creating area charts:', error);
                }
            });
    
            // Initialize Strengths Charts
            recommendationData.strengths.forEach((strength, index) => {
                try {
                    const canvas = document.getElementById(`strengthChart${index}`);
                    if (canvas) {
                        canvas.height = 500; // Set fixed height
                        renderStrengthChart(canvas, strength.data);
                    }
                } catch (error) {
                    console.error('Error creating strength charts:', error);
                }
            });
        }
    
        // Initialize Prediction Charts
        if (predictionData) {
            initPredictionCharts();
        }
    
        // Enable the download button after charts are rendered
        setTimeout(() => {
            downloadPdfBtn.disabled = false;
        }, 1000);
    }
    
    function renderEnergyChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Energy Usage (kWh)',
                    data: data.values,
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                }, {
                    label: 'Temperature (°C)',
                    data: data.temperature,
                    type: 'line',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.dataset.yAxisID === 'y2') {
                                    return `${context.parsed.y}°C`;
                                }
                                return `${context.parsed.y} kWh`;
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
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    function renderCarbonChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Carbon Emissions (tons)',
                    data: data.values,
                    backgroundColor: 'rgba(91, 199, 160, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} tonnes`;
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
                    }
                }
            }
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
                    tension: 0.4,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
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
