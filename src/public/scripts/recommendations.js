// scripts/recommendations.js

document.addEventListener('DOMContentLoaded', () => {
    const generateRecommendationsBtn = document.getElementById('generateRecommendationsBtn');
    const yearSelect = document.getElementById('year');
    const recommendationsOutput = document.getElementById('recommendationsOutput');
    const recommendationsContainer = document.getElementById('recommendationsContainer'); 
    const downloadPdfBtn = document.getElementById('downloadPdfBtn'); 

    // Assume the user is the principal of Lincoln High School with schoolId = 1
    const schoolId = 1;

    // Fetch available years on page load
    fetchAvailableYears(schoolId);

    generateRecommendationsBtn.addEventListener('click', async () => {
        const selectedYear = parseInt(yearSelect.value);
        if (isNaN(selectedYear)) {
            displayError('Please select a valid year.');
            return;
        }

        clearOutputs();

        try {
            // Call backend to generate recommendations
            const recommendationsData = await generateRecommendations(selectedYear);

            // Display Recommendations
            displayRecommendations(recommendationsData);

        } catch (error) {
            console.error('Error:', error);
            displayError('An error occurred while generating recommendations. Please try again later.');
        }
    });

    // Event listener for the Download as PDF button
    downloadPdfBtn.addEventListener('click', () => {
        downloadRecommendationsAsPDF();
    });    

    function clearOutputs() {
        recommendationsOutput.classList.add('hidden');
        if (recommendationsContainer) {
            recommendationsContainer.innerHTML = '';
        }
    }

    function showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'block';
    }

    function hideLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'none';
    }
    

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
        yearSelect.innerHTML = ''; // Clear existing options
        if (years.length === 0) {
            yearSelect.innerHTML = '<option value="">No years available</option>';
            return;
        }
        yearSelect.innerHTML = '<option value="">Select a year</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    async function generateRecommendations(year) {
        showLoadingScreen();
        // Send the request to the backend to generate recommendations
        const response = await fetch(`/api/generate-recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ schoolId, year }),
        });
    
        let data;
        try {
            data = await response.json();
        } catch (error) {
            throw new Error('Failed to parse server response.');
        }
    
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate recommendations.');
        }
        hideLoadingScreen();
        return data.recommendationData; // Return the parsed JSON data
    }


    function displayRecommendations(recommendationData) {
        if (!recommendationData) {
            displayError('No recommendations data received.');
            return;
        }
    
        // Build the HTML content
        let htmlContent = '';
    
        // Display Green Score
        htmlContent += `
            <h2>Green Score: ${recommendationData.green_score.score}</h2>
            <p>${recommendationData.green_score.summary}</p>
        `;
    
        // Display Areas of Concern
        htmlContent += '<h2>Areas of Concern</h2>';
    
        recommendationData.areas_of_concern.forEach((area, index) => {
            htmlContent += `
                <div class="area-of-concern">
                    <h3>${area.title}</h3>
                    <p>${area.problem}</p>
                    <p>${area.conclusion}</p>
                    <canvas id="areaChart${index}"></canvas>
                </div>
            `;
        });
    
        // Display Personalized Recommendations
        htmlContent += `
            <h2>Personalized Recommendations</h2>
            <ul>
                ${recommendationData.personalized_recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
    
        // Display Strengths
        htmlContent += '<h2>Strengths</h2>';
    
        recommendationData.strengths.forEach((strength, index) => {
            htmlContent += `
                <div class="strength">
                    <h3>${strength.title}</h3>
                    <p>${strength.achievement}</p>
                    <p>${strength.conclusion}</p>
                    <canvas id="strengthChart${index}"></canvas>
                </div>
            `;
        });
    
        // Display Path to Net Zero
        htmlContent += `
            <h2>Path to Net Zero</h2>
            <ul>
                ${recommendationData.path_to_net_zero.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
    
        // Set the HTML content
        recommendationsContainer.innerHTML = htmlContent;
    
        // Now that the HTML is set, the canvas elements exist in the DOM.
        // We can render the charts.
    
        // Render charts for Areas of Concern
        recommendationData.areas_of_concern.forEach((area, index) => {
            // Render Chart
            renderAreaChart(`areaChart${index}`, area.data);
        });
    
        // Render charts for Strengths
        recommendationData.strengths.forEach((strength, index) => {
            // Render Chart
            renderStrengthChart(`strengthChart${index}`, strength.data);
        });
    
        recommendationsOutput.classList.remove('hidden');
        downloadPdfBtn.classList.remove('hidden'); // Show the download button
    }

    function downloadRecommendationsAsPDF() {
        const recommendationsContent = document.getElementById('recommendationsContainer');

        // Define PDF options
        const opt = {
            margin:       0.5,
            filename:     'Recommendations.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate and save the PDF
        html2pdf().set(opt).from(recommendationsContent).save();
    }
    

    function renderAreaChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id ${canvasId} not found.`);
            return;
        }
        const ctx = canvas.getContext('2d');
    
        new Chart(ctx, {
            type: 'bar', 
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Values',
                    data: data.values,
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
    
    function renderStrengthChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id ${canvasId} not found.`);
            return;
        }
        const ctx = canvas.getContext('2d');
    
        new Chart(ctx, {
            type: 'line', 
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Values',
                    data: data.values,
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
    
});
