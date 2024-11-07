// scripts/recommendations.js

document.addEventListener('DOMContentLoaded', () => {
    const generateRecommendationsBtn = document.getElementById('generateRecommendationsBtn');
    const yearSelect = document.getElementById('year');
    const loadingIndicator = document.getElementById('loading');
    const errorOutput = document.getElementById('errorOutput');
    const recommendationsOutput = document.getElementById('recommendationsOutput');
    const recommendationsContainer = document.getElementById('recommendationsContainer'); // Ensure this exists in your HTML

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
            // Call backend to generate recommendations
            const recommendationsHTML = await generateRecommendations(selectedYear);

            // Display Recommendations
            displayRecommendations(recommendationsHTML);

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
        if (recommendationsContainer) {
            recommendationsContainer.innerHTML = '';
        }
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
        // Send the request to the backend to generate recommendations
        const response = await fetch(`/api/generate-recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ schoolId, year }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate recommendations.');
        }

        const data = await response.json();
        return data.recommendation; // This is the HTML string
    }

    function displayRecommendations(recommendationHTML) {
        if (recommendationsContainer) {
            // Sanitize the HTML before inserting to prevent XSS attacks
            const sanitizedHTML = DOMPurify.sanitize(recommendationHTML);
            recommendationsContainer.innerHTML = sanitizedHTML;
            recommendationsOutput.classList.remove('hidden');
        }
    }
});
