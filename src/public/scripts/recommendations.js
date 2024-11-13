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

    // Add Event Listener to the "Generate Recommendations" Button
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
            displayError(`Error: ${error.message}`);
        }
    });

    // Event listener for the Download as PDF button
    downloadPdfBtn.addEventListener('click', () => {
        downloadRecommendationsAsPDF();
    });    

    // === Static Data Definitions === //

    // Static Recommendation Data

    const staticRecommendationData2024 = {
        "green_score": {
          "score": 75,
          "summary": "Lincoln High School demonstrates moderate sustainability performance with room for improvement in energy management and emission reduction, especially during warmer months."
        },
        "areas_of_concern": [
          {
            "title": "High Energy Usage in July",
            "problem": "July recorded the highest energy consumption of the year.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350]
            },
            "conclusion": "The peak in energy usage during July can be attributed to higher average temperatures, leading to increased cooling needs. Targeting energy-efficient cooling solutions could mitigate this issue."
          },
          {
            "title": "Increased Carbon Emissions in July, September, and December",
            "problem": "Carbon emissions peaked in July, September, and December at 1.00 tons.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [0.80, 0.70, 0.90, 0.80, 0.90, 0.80, 1.00, 0.90, 1.00, 0.70, 0.80, 1.00]
            },
            "conclusion": "Higher emissions during these months suggest a correlation with increased energy usage. Implementing renewable energy sources could help reduce the carbon footprint."
          }
        ],
        "personalized_recommendations": [
          "Install energy-efficient HVAC systems to reduce energy usage during warmer months.",
          "Incorporate solar panels to offset energy consumption and reduce reliance on non-renewable sources.",
          "Implement a building management system to optimize energy usage and monitor consumption patterns.",
          "Encourage behavioral changes, such as turning off lights and equipment when not in use, to decrease energy demand."       
        ],
        "strengths": [
          {
            "title": "Lowest Energy Usage in April",
            "achievement": "April recorded the lowest energy consumption of the year.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350]
            },
            "conclusion": "April's low energy usage indicates effective energy management, possibly due to milder weather conditions reducing the need for cooling."
          },
          {
            "title": "Lowest Carbon Emissions in February and October",
            "achievement": "Carbon emissions were lowest in February and October at 0.70 tons.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [0.80, 0.70, 0.90, 0.80, 0.90, 0.80, 1.00, 0.90, 1.00, 0.70, 0.80, 1.00]
            },
            "conclusion": "The low emissions during these months reflect efficient energy use, likely due to decreased demand for cooling and lighting."
          }
        ],
        "path_to_net_zero": [
          "Increase the installation of renewable energy sources such as solar panels to reduce dependence on non-renewable energy.",
          "Enhance energy efficiency in buildings through retrofitting and smart technology implementation.",
          "Promote sustainable transportation options for students and staff, such as carpooling and cycling.",
          "Conduct regular sustainability audits to identify areas for improvement and track progress toward goals.",
          "Engage the school community in sustainability initiatives to foster a culture of environmental responsibility."
        ]
      };

    const staticRecommendationData2023 = {
        "green_score": {
          "score": 75,
          "summary": "Lincoln High School demonstrates a commendable effort in managing its energy consumption and carbon footprint. However, there are notable peaks in energy usage during the hotter months, which require strategic interventions to improve sustainability performance."
        },
        "areas_of_concern": [
          {
            "title": "High Energy Consumption in August",
            "problem": "August has the highest energy consumption at 1100.00 kWh.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [800, 750, 900, 1000, 850, 950, 1000, 1100, 900, 950, 800, 750]
            },
            "conclusion": "The high temperatures in August (28.0°C) likely contributed to increased use of cooling systems, resulting in peak energy usage."
          },
          {
            "title": "Carbon Footprint Peaks in December",
            "problem": "The carbon footprint in December is notably high at 1.00 tons.",
            "data": {
              "labels": ["2023-01-31", "2023-02-28", "2023-03-31", "2023-04-30", "2023-05-31", "2023-06-30", "2023-07-31", "2023-08-31", "2023-09-30", "2023-10-31", "2023-11-30", "2023-12-31"],
              "values": [0.80, 0.70, 0.90, 0.80, 0.90, 0.80, 1.00, 0.90, 1.00, 0.70, 0.80, 1.00]
            },
            "conclusion": "Despite lower energy consumption in December, the carbon footprint remains high, suggesting inefficiencies in energy sources or usage patterns."
          }
        ],
        "personalized_recommendations": [
          "Implement energy-efficient cooling systems to manage high energy consumption during hot months like August.",
          "Conduct an energy audit in December to identify and rectify inefficiencies contributing to high carbon emissions.",       
          "Increase awareness and engagement among students and staff on energy-saving practices, especially during peak months."    
        ],
        "strengths": [
          {
            "title": "Low Energy Usage in February",
            "achievement": "February has the lowest energy usage at 750.00 kWh.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [800, 750, 900, 1000, 850, 950, 1000, 1100, 900, 950, 800, 750]
            },
            "conclusion": "The cooler average temperature of 22.0°C in February contributes to reduced energy demands, showcasing effective energy management during this period."
          },
          {
            "title": "Effective Carbon Management in October",
            "achievement": "October reports a low carbon footprint of 0.70 tons.",
            "data": {
              "labels": ["2023-01-31", "2023-02-28", "2023-03-31", "2023-04-30", "2023-05-31", "2023-06-30", "2023-07-31", "2023-08-31", "2023-09-30", "2023-10-31", "2023-11-30", "2023-12-31"],
              "values": [0.80, 0.70, 0.90, 0.80, 0.90, 0.80, 1.00, 0.90, 1.00, 0.70, 0.80, 1.00]
            },
            "conclusion": "The strategies implemented in October are successful in minimizing carbon output, indicating effective carbon management practices."
          }
        ],
        "path_to_net_zero": [
          "Adopt renewable energy sources such as solar panels to reduce reliance on non-renewable energy.",
          "Enhance building insulation and shading to reduce the cooling load during hotter months.",
          "Implement a comprehensive monitoring system to track real-time energy usage and identify areas for immediate improvement.",
          "Establish a sustainability committee to regularly review energy policies and promote best practices throughout the school community."
        ]
      };

      const staticRecommendationData2022 = {
        "green_score": {
          "score": 75,
          "summary": "Lincoln High School demonstrates a moderate level of sustainability performance, with room for improvement particularly in energy consumption and carbon emissions during specific months."
        },
        "areas_of_concern": [
          {
            "title": "High Energy Usage in December",
            "problem": "December recorded the highest energy usage of 1850.00 kWh.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [1250.00, 1360.00, 1400.00, 1300.00, 1550.00, 1700.00, 1600.00, 1750.00, 1700.00, 1675.00, 1800.00, 1850.00] 
            },
            "conclusion": "The increased energy usage in December could be attributed to cooler temperatures leading to higher heating demands or increased lighting needs due to shorter daylight hours."
          },
          {
            "title": "High Carbon Emissions in April and May",
            "problem": "Both April and May recorded high carbon emissions of 0.90 tons.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [0.70, 0.60, 0.80, 0.90, 0.90, 0.80, 0.90, 0.80, 0.90, 0.70, 0.60, 0.80]
            },
            "conclusion": "The elevated emissions in April and May may be linked to transitional weather patterns requiring more energy for climate control, or possibly due to increased school activities during these months."
          }
        ],
        "personalized_recommendations": [
          "Implement energy-saving measures such as LED lighting and smart HVAC systems to reduce energy consumption during high-usage months.",
          "Conduct an energy audit in December to identify specific areas or practices contributing to high energy usage.",
          "Introduce a campaign to raise awareness among staff and students about sustainable practices, focusing on reducing energy use during peak months.",
          "Explore renewable energy options such as solar panels to offset carbon emissions, particularly in months with high emissions."
        ],
        "strengths": [
          {
            "title": "Lowest Carbon Emissions in February and November",
            "achievement": "February and November had the lowest carbon emissions at 0.60 tons each.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [0.70, 0.60, 0.80, 0.90, 0.90, 0.80, 0.90, 0.80, 0.90, 0.70, 0.60, 0.80]
            },
            "conclusion": "The low emissions in February and November indicate effective energy management during these months, possibly due to favorable weather conditions reducing the need for artificial climate control."
          }
        ],
        "path_to_net_zero": [
          "Adopt energy-efficient technologies and practices across the school to systematically reduce energy consumption.",        
          "Set up a carbon management plan to monitor and report emissions regularly, ensuring transparency and accountability.",    
          "Engage with students and staff in sustainability initiatives to create a culture of environmental responsibility.",       
          "Partner with local government and energy providers to access resources and incentives for renewable energy installations."
        ]
      };

      const staticRecommendationData2021 = {
        "green_score": {
          "score": 75,
          "summary": "Lincoln High School demonstrates moderate sustainability performance with consistent efforts in energy management. However, increased consumption during warmer months highlights areas for improvement to align with net zero targets."      
        },
        "areas_of_concern": [
          {
            "title": "High Energy Consumption in April",
            "problem": "April recorded the highest energy usage of the year.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [1000, 950, 1100, 1300, 980, 1125, 1150, 1200, 1100, 1200, 1150, 1250]
            },
            "conclusion": "The increase in energy consumption during April, coinciding with rising temperatures, suggests a need for improved climate control systems and energy-efficient practices."
          },
          {
            "title": "Consistent Carbon Emissions",
            "problem": "Carbon emissions remained high in April, May, July, and September.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [0.60, 0.50, 0.70, 0.80, 0.80, 0.70, 0.80, 0.70, 0.80, 0.60, 0.50, 0.60]
            },
            "conclusion": "Persistent high emissions in these months indicate potential inefficiencies in energy usage and a need for enhanced emission reduction strategies."
          }
        ],
        "personalized_recommendations": [
          "Implement advanced HVAC systems to improve energy efficiency during warmer months.",
          "Conduct an energy audit to identify inefficiencies and opportunities for energy savings.",
          "Increase awareness and training on energy conservation among staff and students.",
          "Explore renewable energy options such as solar panels to offset grid electricity usage."
        ],
        "strengths": [
          {
            "title": "Low Energy Consumption in February",
            "achievement": "February recorded the lowest energy usage.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [1000, 950, 1100, 1300, 980, 1125, 1150, 1200, 1100, 1200, 1150, 1250]
            },
            "conclusion": "Effective energy management strategies were successfully implemented in February, resulting in the lowest consumption of the year."
          },
          {
            "title": "Reduced Carbon Emissions in February and November",
            "achievement": "Significantly lower carbon emissions were recorded in February and November.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [0.60, 0.50, 0.70, 0.80, 0.80, 0.70, 0.80, 0.70, 0.80, 0.60, 0.50, 0.60]
            },
            "conclusion": "The months of February and November highlight effective emission reduction strategies, likely due to targeted conservation efforts."
          }
        ],
        "path_to_net_zero": [
          "Adopt comprehensive energy efficiency measures, including LED lighting and smart energy management systems.",
          "Increase the use of renewable energy sources to reduce dependency on fossil fuels.",
          "Implement a robust monitoring and evaluation system to track progress and identify areas for improvement.",
          "Engage the school community in sustainability initiatives to foster a culture of environmental stewardship."
        ]
      };
    

    // === End of Static Data Definitions === //

    // Flag to toggle between static and dynamic data
    const useStaticData = true; // Set to false to enable API fetching

    // Add Event Listener to the "Generate Recommendations" Button
    generateRecommendationsBtn.addEventListener('click', async () => {
        const selectedYear = parseInt(yearSelect.value);
        if (isNaN(selectedYear)) {
            displayError('Please select a valid year.');
            return;
        }

        clearOutputs();

        try {
            // Call backend or use static data to generate recommendations
            const recommendationsData = await generateRecommendations(selectedYear);

            // Display Recommendations
            displayRecommendations(recommendationsData);

        } catch (error) {
            console.error('Error:', error);
            displayError(`Error: ${error.message}`);
        }
    });

    // Event listener for the Download as PDF button
    downloadPdfBtn.addEventListener('click', () => {
        downloadRecommendationsAsPDF();
    });    

    // Helper Sleep Function to Simulate Data Fetching Delay
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'block';
        recommendationsOutput.classList.add('hidden');
    }

    function hideLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'none';
        recommendationsOutput.classList.remove('hidden');
    }

    // Function to Fetch Available Years (Dynamic)
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

    // Function to Populate Year Dropdown
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

    // Function to Generate Recommendations for a Selected Year
    async function generateRecommendations(year) {
        try {
            showLoadingScreen(); // Show loading screen

            let data;

            if (useStaticData) {
                // Introduce a 3-second delay
                await sleep(3000); // 3000 milliseconds = 3 seconds

                // Select static data based on the year
                if (year === 2023) {
                    data = staticRecommendationData2023;
                } else if (year === 2024) {
                    data = staticRecommendationData2024;
                } else if (year === 2022) {
                    data = staticRecommendationData2022;
                } else if (year === 2021) {
                    data = staticRecommendationData2021;
                } else {
                    throw new Error('Static data for the selected year is not available.');
                }
            } else {
                // Call backend API to get recommendations data
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

                data = await response.json();
            }

            hideLoadingScreen();
            return data; // Return the parsed JSON data
        } catch (error) {
            hideLoadingScreen();
            throw error;
        }
    }

    // Function to Display Recommendations
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

    // Function to Download Recommendations as a PDF
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

    // Function to Show Recommendation Components
    function showPredictionComponents() {
        const predictionComponents = document.getElementById('predictionComponents');
        predictionComponents.classList.remove('hidden');
    }

    // Function to Hide Prediction Components
    function hidePredictionComponents() {
        const predictionComponents = document.getElementById('predictionComponents');
        predictionComponents.classList.add('hidden');
    }

    // Function to Clear Existing Outputs and Errors
    function clearOutputs() {
        recommendationsOutput.classList.add('hidden');
        if (recommendationsContainer) {
            recommendationsContainer.innerHTML = '';
        }
        clearError();
    }

    // Function to Display Errors
    function displayError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Function to Clear Errors
    function clearError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    // Function to Render Area Chart
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

    // Function to Render Strength Chart
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
