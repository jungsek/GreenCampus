// scripts/recommendations.js

document.addEventListener('DOMContentLoaded', () => {
    const generateRecommendationsBtn = document.getElementById('generateRecommendationsBtn');
    const yearSelect = document.getElementById('year');
    const loadingIndicator = document.getElementById('loading');
    const errorOutput = document.getElementById('errorOutput');
    const recommendationsOutput = document.getElementById('recommendationsOutput');
    const greenScoreSpan = document.getElementById('greenScore');
    const areasOfConcernList = document.getElementById('areasOfConcern');
    const personalizedRecommendationsList = document.getElementById('personalizedRecommendations');
    const strengthsList = document.getElementById('strengths');

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
        showLoading(true);

        try {
            // Fetch data for the selected year
            const data = await fetchDataForYear(schoolId, selectedYear);

            // Prepare data for OpenAI
            const promptData = formatDataForAI(data);

            // Call backend to generate recommendations
            const recommendations = await generateRecommendations(promptData);

            // Display Recommendations
            displayRecommendations(recommendations);

        } catch (error) {
            console.error('Error:', error);
            displayError('An error occurred while generating recommendations. Please try again later.');
        } finally {
            showLoading(false);
        }
    });

    function showLoading(isLoading) {
        loadingIndicator.classList.toggle('hidden', !isLoading);
    }

    function displayError(message) {
        errorOutput.textContent = message;
        errorOutput.classList.remove('hidden');
    }

    function clearOutputs() {
        errorOutput.textContent = '';
        errorOutput.classList.add('hidden');
        recommendationsOutput.classList.add('hidden');
        greenScoreSpan.textContent = '';
        areasOfConcernList.innerHTML = '';
        personalizedRecommendationsList.innerHTML = '';
        strengthsList.innerHTML = '';
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

    async function fetchDataForYear(schoolId, year) {
        // Fetch all relevant data needed for recommendations
        // This may include energy usage, carbon footprint, energy breakdown, etc.

        // Example: Fetch Energy Usage
        const energyUsageResponse = await fetch(`/api/energy-usage/${schoolId}/monthly/${year}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!energyUsageResponse.ok) {
            throw new Error('Failed to fetch energy usage data.');
        }

        const energyUsageData = await energyUsageResponse.json();

        // Fetch Carbon Footprint
        const carbonFootprintResponse = await fetch(`/api/carbon-footprint/${schoolId}/year/${year}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!carbonFootprintResponse.ok) {
            throw new Error('Failed to fetch carbon footprint data.');
        }

        const carbonFootprintData = await carbonFootprintResponse.json();

        // Fetch Energy Breakdown
        const energyBreakdownResponse = await fetch(`/api/energy-breakdown/${schoolId}/year/${year}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!energyBreakdownResponse.ok) {
            throw new Error('Failed to fetch energy breakdown data.');
        }

        const energyBreakdownData = await energyBreakdownResponse.json();

        return {
            energyUsage: energyUsageData,
            carbonFootprint: carbonFootprintData,
            energyBreakdown: energyBreakdownData
        };
    }

    function formatDataForAI(data) {
        // Format the fetched data into a structured prompt for OpenAI
        // This can be in JSON format or as a detailed text

        // Example: Creating a summary of data
        let summary = `Yearly Sustainability Data Summary:
        
        Energy Usage:
        `;
        data.energyUsage.forEach(item => {
            summary += `- ${item.month}: ${item.energy_kwh} kWh, Avg Temp: ${item.avg_temperature_c}°C\n`;
        });

        summary += `\nCarbon Footprint:
        `;
        data.carbonFootprint.forEach(item => {
            const date = new Date(item.timestamp).toISOString().split('T')[0];
            summary += `- ${date}: ${item.total_carbon_tons} tons\n`;
        });

        summary += `\nEnergy Breakdown:
        `;
        data.energyBreakdown.forEach(item => {
            summary += `- ${item.month}: ${item.location} - ${item.category} (${item.percentage}%)\n`;
        });

        return summary;
    }

    async function generateRecommendations(prompt) {
        // Send the formatted data to the backend to call OpenAI API
        const response = await fetch(`/api/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ schoolId, year: yearSelect.value, data: prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate recommendations.');
        }

        const data = await response.json();
        return data.recommendations;
    }

    function displayRecommendations(recommendations) {
        // Assuming recommendations is a structured JSON object
        // Example structure:
        /*
            {
                greenScore: 90,
                areasOfConcern: [
                    "Month with highest emissions: July",
                    "Location with highest consumption: Laboratory"
                ],
                personalizedRecommendations: [
                    "Implement energy-efficient lighting in the Laboratory.",
                    "Optimize HVAC systems in the Library."
                ],
                strengths: [
                    "Month with lowest emissions: January",
                    "Effective waste management in Cafeteria."
                ]
            }
        */

        greenScoreSpan.textContent = `${recommendations.greenScore}/100`;

        // Populate Areas of Concern
        recommendations.areasOfConcern.forEach(area => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.textContent = area;
            areasOfConcernList.appendChild(listItem);
        });

        // Populate Personalized Recommendations
        recommendations.personalizedRecommendations.forEach(rec => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.textContent = rec;
            personalizedRecommendationsList.appendChild(listItem);
        });

        // Populate Strengths
        recommendations.strengths.forEach(strength => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.textContent = strength;
            strengthsList.appendChild(listItem);
        });

        recommendationsOutput.classList.remove('hidden');
    }
});
