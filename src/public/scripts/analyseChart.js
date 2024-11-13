// scripts/analyseChart.js

document.addEventListener('DOMContentLoaded', () => {
    // Get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const chartType = urlParams.get('chartType'); // "energy" or "carbon"
    const year = parseInt(urlParams.get('year'));
    const schoolId = parseInt(urlParams.get('schoolId'));

    const analysisTitle = document.getElementById('analysisTitle');
    const analysisOutput = document.getElementById('analysisOutput');
    const analysisContainer = document.getElementById('analysisContainer');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    // Update the page title based on the chart type
    if (chartType === 'energy') {
        analysisTitle.textContent = `Energy Usage Analysis for ${year}`;
    } else if (chartType === 'carbon') {
        analysisTitle.textContent = `Carbon Footprint Analysis for ${year}`;
    } else {
        analysisTitle.textContent = `Chart Analysis`;
    }
    
    
    const staticEnergyData2024  = {
        "main_chart": {
          "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          "values": [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350]
        },
        "areas_of_concern": [
          {
            "title": "July Energy Usage",
            "problem": "July had the highest energy usage of the year at 1500 kWh.",
            "data": {
              "type": "pie",
              "labels": ["Lighting", "HVAC", "Computers", "Others"],
              "values": [400, 700, 250, 150]
            },
            "conclusion": "The high energy usage in July is primarily due to increased HVAC demand during peak summer temperatures. Lighting and computer usage also contribute significantly."
          }
        ],
        "personalized_recommendations": [
          "Implement a smart thermostat system to optimize HVAC usage, especially during non-school hours.",
          "Conduct an energy audit to identify inefficient lighting and consider transitioning to LED lights.",
          "Encourage energy-saving practices among staff and students, such as turning off lights and computers when not in use."    
        ],
        "strengths": [
          {
            "title": "Energy Efficiency in April",
            "achievement": "April had the lowest energy usage of the year at 1100 kWh.",
            "data": {
              "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
              "values": [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350]
            },
            "conclusion": "April's low energy usage can be attributed to moderate temperatures reducing HVAC demand and possibly effective energy-saving measures in place."
          }
        ],
        "predictions": [
          {
            "year": 2024,
            "predicted_energy_kwh": 1100,
            "ideal_energy_kwh": 900
          },
          {
            "year": 2025,
            "predicted_energy_kwh": 1080,
            "ideal_energy_kwh": 880
          },
          {
            "year": 2026,
            "predicted_energy_kwh": 1120,
            "ideal_energy_kwh": 860
          },
          {
            "year": 2027,
            "predicted_energy_kwh": 1050,
            "ideal_energy_kwh": 840
          },
          {
            "year": 2028,
            "predicted_energy_kwh": 1030,
            "ideal_energy_kwh": 820
          },
          {
            "year": 2029,
            "predicted_energy_kwh": 1070,
            "ideal_energy_kwh": 800
          },
          {
            "year": 2030,
            "predicted_energy_kwh": 1020,
            "ideal_energy_kwh": 780
          },
          {
            "year": 2031,
            "predicted_energy_kwh": 990,
            "ideal_energy_kwh": 760
          },
          {
            "year": 2032,
            "predicted_energy_kwh": 970,
            "ideal_energy_kwh": 740
          },
          {
            "year": 2033,
            "predicted_energy_kwh": 950,
            "ideal_energy_kwh": 720
          },
          {
            "year": 2034,
            "predicted_energy_kwh": 980,
            "ideal_energy_kwh": 700
          },
          {
            "year": 2035,
            "predicted_energy_kwh": 930,
            "ideal_energy_kwh": 680
          },
          {
            "year": 2036,
            "predicted_energy_kwh": 910,
            "ideal_energy_kwh": 660
          },
          {
            "year": 2037,
            "predicted_energy_kwh": 890,
            "ideal_energy_kwh": 640
          },
          {
            "year": 2038,
            "predicted_energy_kwh": 870,
            "ideal_energy_kwh": 620
          },
          {
            "year": 2039,
            "predicted_energy_kwh": 900,
            "ideal_energy_kwh": 600
          },
          {
            "year": 2040,
            "predicted_energy_kwh": 850,
            "ideal_energy_kwh": 580
          },
          {
            "year": 2041,
            "predicted_energy_kwh": 830,
            "ideal_energy_kwh": 560
          },
          {
            "year": 2042,
            "predicted_energy_kwh": 810,
            "ideal_energy_kwh": 540
          },
          {
            "year": 2043,
            "predicted_energy_kwh": 790,
            "ideal_energy_kwh": 520
          },
          {
            "year": 2044,
            "predicted_energy_kwh": 770,
            "ideal_energy_kwh": 500
          },
          {
            "year": 2045,
            "predicted_energy_kwh": 800,
            "ideal_energy_kwh": 480
          },
          {
            "year": 2046,
            "predicted_energy_kwh": 750,
            "ideal_energy_kwh": 460
          },
          {
            "year": 2047,
            "predicted_energy_kwh": 730,
            "ideal_energy_kwh": 440
          },
          {
            "year": 2048,
            "predicted_energy_kwh": 710,
            "ideal_energy_kwh": 420
          },
          {
            "year": 2049,
            "predicted_energy_kwh": 690,
            "ideal_energy_kwh": 400
          },
          {
            "year": 2050,
            "predicted_energy_kwh": 650,
            "ideal_energy_kwh": 380
          }
        ]
      };

    const staticCarbonData2024 = {
        "main_chart": {
          "labels": ["2024-01-31", "2024-02-28", "2024-03-31", "2024-04-30", "2024-05-31", "2024-06-30", "2024-07-31", "2024-08-31", "2024-09-30", "2024-10-31", "2024-11-30", "2024-12-31"],
          "values": [0.8, 0.7, 0.9, 0.8, 0.9, 0.8, 1.0, 0.9, 1.0, 0.7, 0.8, 1.0]
        },
        "areas_of_concern": [
          {
            "title": "High Carbon Footprint in July, September and December",
            "problem": "The carbon footprint for Lincoln High School peaked at 1.0 tons in July, September, and December 2024.",     
            "data": {
              "type": "bar",
              "labels": ["2024-01-31", "2024-02-28", "2024-03-31", "2024-04-30", "2024-05-31", "2024-06-30", "2024-07-31", "2024-08-31", "2024-09-30", "2024-10-31", "2024-11-30", "2024-12-31"],
              "values": [0.8, 0.7, 0.9, 0.8, 0.9, 0.8, 1.0, 0.9, 1.0, 0.7, 0.8, 1.0]
            },
            "conclusion": "The high carbon footprint during these months could be due to increased energy usage for cooling or heating systems during the summer and winter seasons respectively. Further investigation into the school's energy use during these periods is recommended."
          }
        ],
        "personalized_recommendations": [
          "Investigate and implement energy-efficient cooling and heating systems to reduce energy consumption during the summer and winter months.",
          "Conduct regular energy audits to identify and address areas of high energy usage.",
          "Introduce renewable energy sources such as solar panels to reduce reliance on fossil fuels.",
          "Promote energy-saving practices among students and staff such as turning off lights and electronic devices when not in use."
        ],
        "strengths": [
          {
            "title": "Lowest Carbon Footprint in February and October",
            "achievement": "The school's carbon footprint was at its lowest at 0.7 tons in February and October 2024.",
            "data": {
              "labels": ["2024-01-31", "2024-02-28", "2024-03-31", "2024-04-30", "2024-05-31", "2024-06-30", "2024-07-31", "2024-08-31", "2024-09-30", "2024-10-31", "2024-11-30", "2024-12-31"],
              "values": [0.8, 0.7, 0.9, 0.8, 0.9, 0.8, 1.0, 0.9, 1.0, 0.7, 0.8, 1.0]
            },
            "conclusion": "The low carbon footprint during these months could be due to reduced energy usage for cooling or heating systems during the mild climate. This suggests that the school's energy efficiency measures are working effectively during these periods."
          }
        ],
        "predictions": [
          {
            "year": 2025,
            "predicted_carbon_tons": 0.83,
            "ideal_carbon_tons": 0.68
          },
          {
            "year": 2026,
            "predicted_carbon_tons": 0.87,
            "ideal_carbon_tons": 0.66
          },
          {
            "year": 2027,
            "predicted_carbon_tons": 0.80,
            "ideal_carbon_tons": 0.64
          },
          {
            "year": 2028,
            "predicted_carbon_tons": 0.78,
            "ideal_carbon_tons": 0.62
          },
          {
            "year": 2029,
            "predicted_carbon_tons": 0.82,
            "ideal_carbon_tons": 0.60
          },
          {
            "year": 2030,
            "predicted_carbon_tons": 0.77,
            "ideal_carbon_tons": 0.58
          },
          {
            "year": 2031,
            "predicted_carbon_tons": 0.75,
            "ideal_carbon_tons": 0.56
          },
          {
            "year": 2032,
            "predicted_carbon_tons": 0.73,
            "ideal_carbon_tons": 0.54
          },
          {
            "year": 2033,
            "predicted_carbon_tons": 0.71,
            "ideal_carbon_tons": 0.52
          },
          {
            "year": 2034,
            "predicted_carbon_tons": 0.74,
            "ideal_carbon_tons": 0.50
          },
          {
            "year": 2035,
            "predicted_carbon_tons": 0.70,
            "ideal_carbon_tons": 0.48
          },
          {
            "year": 2036,
            "predicted_carbon_tons": 0.68,
            "ideal_carbon_tons": 0.46
          },
          {
            "year": 2037,
            "predicted_carbon_tons": 0.66,
            "ideal_carbon_tons": 0.44
          },
          {
            "year": 2038,
            "predicted_carbon_tons": 0.64,
            "ideal_carbon_tons": 0.42
          },
          {
            "year": 2039,
            "predicted_carbon_tons": 0.67,
            "ideal_carbon_tons": 0.40
          },
          {
            "year": 2040,
            "predicted_carbon_tons": 0.63,
            "ideal_carbon_tons": 0.38
          },
          {
            "year": 2041,
            "predicted_carbon_tons": 0.61,
            "ideal_carbon_tons": 0.36
          },
          {
            "year": 2042,
            "predicted_carbon_tons": 0.59,
            "ideal_carbon_tons": 0.34
          },
          {
            "year": 2043,
            "predicted_carbon_tons": 0.57,
            "ideal_carbon_tons": 0.32
          },
          {
            "year": 2044,
            "predicted_carbon_tons": 0.55,
            "ideal_carbon_tons": 0.30
          },
          {
            "year": 2045,
            "predicted_carbon_tons": 0.58,
            "ideal_carbon_tons": 0.28
          },
          {
            "year": 2046,
            "predicted_carbon_tons": 0.54,
            "ideal_carbon_tons": 0.26
          },
          {
            "year": 2047,
            "predicted_carbon_tons": 0.52,
            "ideal_carbon_tons": 0.24
          },
          {
            "year": 2048,
            "predicted_carbon_tons": 0.50,
            "ideal_carbon_tons": 0.22
          },
          {
            "year": 2049,
            "predicted_carbon_tons": 0.48,
            "ideal_carbon_tons": 0.21
          },
          {
            "year": 2050,
            "predicted_carbon_tons": 0.45,
            "ideal_carbon_tons": 0.20
          }
        ]
      };

      const staticEnergyData2023 = {
        "main_chart": {
          "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          "values": [800.0, 750.0, 900.0, 1000.0, 850.0, 950.0, 1000.0, 1100.0, 900.0, 950.0, 800.0, 750.0]
        },
        "areas_of_concern": [
          {
            "title": "August Energy Usage",
            "problem": "August had the highest energy usage of the year.",
            "data": {
              "type": "pie",
              "labels": ["Heating", "Cooling", "Lighting", "Equipment"],
              "values": [150.0, 500.0, 300.0, 150.0]
            },
            "conclusion": "The high energy usage in August was primarily due to increased cooling demands driven by the high average temperature of 28.0°C."
          }
        ],
        "personalized_recommendations": [
          "Implement a more efficient HVAC system to reduce cooling energy consumption, particularly during hotter months like August.",
          "Install programmable thermostats to optimize temperature settings based on occupancy and time of day.",
          "Conduct an energy audit to identify and address additional inefficiencies in lighting and equipment usage."
        ],
        "strengths": [
          {
            "title": "Low Energy Usage in December",
            "achievement": "December recorded one of the lowest energy usages at 750.00 kWh.",
            "data": {
              "labels": ["January", "December"],
              "values": [800.00, 750.00]
            },
            "conclusion": "The low energy usage in December suggests effective energy management during colder months, likely due to reduced heating needs and better insulation."
          }
        ],
        "predictions": [
          {
            "year": 2024,
            "predicted_energy_kwh": 1100,
            "ideal_energy_kwh": 900
          },
          {
            "year": 2025,
            "predicted_energy_kwh": 1080,
            "ideal_energy_kwh": 880
          },
          {
            "year": 2026,
            "predicted_energy_kwh": 1120,
            "ideal_energy_kwh": 860
          },
          {
            "year": 2027,
            "predicted_energy_kwh": 1050,
            "ideal_energy_kwh": 840
          },
          {
            "year": 2028,
            "predicted_energy_kwh": 1030,
            "ideal_energy_kwh": 820
          },
          {
            "year": 2029,
            "predicted_energy_kwh": 1070,
            "ideal_energy_kwh": 800
          },
          {
            "year": 2030,
            "predicted_energy_kwh": 1020,
            "ideal_energy_kwh": 780
          },
          {
            "year": 2031,
            "predicted_energy_kwh": 990,
            "ideal_energy_kwh": 760
          },
          {
            "year": 2032,
            "predicted_energy_kwh": 970,
            "ideal_energy_kwh": 740
          },
          {
            "year": 2033,
            "predicted_energy_kwh": 950,
            "ideal_energy_kwh": 720
          },
          {
            "year": 2034,
            "predicted_energy_kwh": 980,
            "ideal_energy_kwh": 700
          },
          {
            "year": 2035,
            "predicted_energy_kwh": 930,
            "ideal_energy_kwh": 680
          },
          {
            "year": 2036,
            "predicted_energy_kwh": 910,
            "ideal_energy_kwh": 660
          },
          {
            "year": 2037,
            "predicted_energy_kwh": 890,
            "ideal_energy_kwh": 640
          },
          {
            "year": 2038,
            "predicted_energy_kwh": 870,
            "ideal_energy_kwh": 620
          },
          {
            "year": 2039,
            "predicted_energy_kwh": 900,
            "ideal_energy_kwh": 600
          },
          {
            "year": 2040,
            "predicted_energy_kwh": 850,
            "ideal_energy_kwh": 580
          },
          {
            "year": 2041,
            "predicted_energy_kwh": 830,
            "ideal_energy_kwh": 560
          },
          {
            "year": 2042,
            "predicted_energy_kwh": 810,
            "ideal_energy_kwh": 540
          },
          {
            "year": 2043,
            "predicted_energy_kwh": 790,
            "ideal_energy_kwh": 520
          },
          {
            "year": 2044,
            "predicted_energy_kwh": 770,
            "ideal_energy_kwh": 500
          },
          {
            "year": 2045,
            "predicted_energy_kwh": 800,
            "ideal_energy_kwh": 480
          },
          {
            "year": 2046,
            "predicted_energy_kwh": 750,
            "ideal_energy_kwh": 460
          },
          {
            "year": 2047,
            "predicted_energy_kwh": 730,
            "ideal_energy_kwh": 440
          },
          {
            "year": 2048,
            "predicted_energy_kwh": 710,
            "ideal_energy_kwh": 420
          },
          {
            "year": 2049,
            "predicted_energy_kwh": 690,
            "ideal_energy_kwh": 400
          },
          {
            "year": 2050,
            "predicted_energy_kwh": 650,
            "ideal_energy_kwh": 380
          }
        ]
      };

      const staticCarbonData2023 = {
        "main_chart": {
          "labels": [
            "2024-01-31",
            "2024-02-28",
            "2024-03-31",
            "2024-04-30",
            "2024-05-31",
            "2024-06-30",
            "2024-07-31",
            "2024-08-31",
            "2024-09-30",
            "2024-10-31",
            "2024-11-30",
            "2024-12-31"
          ],
          "values": [
            0.8,
            0.7,
            0.9,
            0.8,
            0.9,
            0.8,
            1.0,
            0.9,
            1.0,
            0.7,
            0.8,
            1.0
          ]
        },
        "areas_of_concern": [
          {
            "title": "High Carbon Footprint in July, September, and December",
            "problem": "The months of July, September, and December recorded the highest carbon footprint of 1.0 tons each.",        
            "data": {
              "type": "bar",
              "labels": [
                "2024-07-31",
                "2024-09-30",
                "2024-12-31"
              ],
              "values": [
                1.0,
                1.0,
                1.0
              ]
            },
            "conclusion": "The high carbon footprint during these months could be attributed to increased energy usage possibly due to cooling/heating demands, holiday lighting, or increased school activities requiring more energy."
          }
        ],
        "personalized_recommendations": [
          "Conduct an energy audit to identify key areas of high energy consumption during July, September, and December. Implement measures such as optimizing HVAC systems, using energy-efficient lighting, and scheduling energy-intensive activities during off-peak hours.",
          "Promote awareness programs within the school to encourage energy-saving behaviors among students and staff, particularly during high usage months."
        ],
        "strengths": [
          {
            "title": "Low Carbon Footprint in February and October",
            "achievement": "February and October recorded the lowest carbon footprint of 0.7 tons each.",
            "data": {
              "labels": [
                "2024-02-28",
                "2024-10-31"
              ],
              "values": [
                0.7,
                0.7
              ]
            },
            "conclusion": "These months have lower energy demands likely due to moderate weather conditions reducing the need for heating or cooling. This shows effective management of energy consumption during these periods."
          }
        ],
        "predictions": [
          {
            "year": 2024,
            "predicted_carbon_tons": 0.85,
            "ideal_carbon_tons": 0.70
          },
          {
            "year": 2025,
            "predicted_carbon_tons": 0.83,
            "ideal_carbon_tons": 0.68
          },
          {
            "year": 2026,
            "predicted_carbon_tons": 0.87,
            "ideal_carbon_tons": 0.66
          },
          {
            "year": 2027,
            "predicted_carbon_tons": 0.80,
            "ideal_carbon_tons": 0.64
          },
          {
            "year": 2028,
            "predicted_carbon_tons": 0.78,
            "ideal_carbon_tons": 0.62
          },
          {
            "year": 2029,
            "predicted_carbon_tons": 0.82,
            "ideal_carbon_tons": 0.60
          },
          {
            "year": 2030,
            "predicted_carbon_tons": 0.77,
            "ideal_carbon_tons": 0.58
          },
          {
            "year": 2031,
            "predicted_carbon_tons": 0.75,
            "ideal_carbon_tons": 0.56
          },
          {
            "year": 2032,
            "predicted_carbon_tons": 0.73,
            "ideal_carbon_tons": 0.54
          },
          {
            "year": 2033,
            "predicted_carbon_tons": 0.71,
            "ideal_carbon_tons": 0.52
          },
          {
            "year": 2034,
            "predicted_carbon_tons": 0.74,
            "ideal_carbon_tons": 0.50
          },
          {
            "year": 2035,
            "predicted_carbon_tons": 0.70,
            "ideal_carbon_tons": 0.48
          },
          {
            "year": 2036,
            "predicted_carbon_tons": 0.68,
            "ideal_carbon_tons": 0.46
          },
          {
            "year": 2037,
            "predicted_carbon_tons": 0.66,
            "ideal_carbon_tons": 0.44
          },
          {
            "year": 2038,
            "predicted_carbon_tons": 0.64,
            "ideal_carbon_tons": 0.42
          },
          {
            "year": 2039,
            "predicted_carbon_tons": 0.67,
            "ideal_carbon_tons": 0.40
          },
          {
            "year": 2040,
            "predicted_carbon_tons": 0.63,
            "ideal_carbon_tons": 0.38
          },
          {
            "year": 2041,
            "predicted_carbon_tons": 0.61,
            "ideal_carbon_tons": 0.36
          },
          {
            "year": 2042,
            "predicted_carbon_tons": 0.59,
            "ideal_carbon_tons": 0.34
          },
          {
            "year": 2043,
            "predicted_carbon_tons": 0.57,
            "ideal_carbon_tons": 0.32
          },
          {
            "year": 2044,
            "predicted_carbon_tons": 0.55,
            "ideal_carbon_tons": 0.30
          },
          {
            "year": 2045,
            "predicted_carbon_tons": 0.58,
            "ideal_carbon_tons": 0.28
          },
          {
            "year": 2046,
            "predicted_carbon_tons": 0.54,
            "ideal_carbon_tons": 0.26
          },
          {
            "year": 2047,
            "predicted_carbon_tons": 0.52,
            "ideal_carbon_tons": 0.24
          },
          {
            "year": 2048,
            "predicted_carbon_tons": 0.50,
            "ideal_carbon_tons": 0.22
          },
          {
            "year": 2049,
            "predicted_carbon_tons": 0.48,
            "ideal_carbon_tons": 0.21
          },
          {
            "year": 2050,
            "predicted_carbon_tons": 0.45,
            "ideal_carbon_tons": 0.20
          }
        ]
      };


    const useStaticData = true; // Set to false to enable API fetching, true when testing

    // Initialize the analysis
    generateAnalysis();

    // Download PDF event listener
    downloadPdfBtn.addEventListener('click', () => {
        downloadAnalysisAsPDF();
    });

    // Helper sleep function
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function generateAnalysis() {
        try {
            showLoadingScreen();

            let data;
            if (useStaticData) {
                // Introduce a 3-second delay
                await sleep(3000); // 3000 milliseconds = 3 seconds

                // Select static data based on year and chartType
                if (chartType === 'energy') {
                    if (year === 2023) {
                        data = staticEnergyData2023;
                    } else if (year === 2024) {
                        data = staticEnergyData2024;
                    } else {
                        throw new Error('Static data for the selected year and chart type is not available.');
                    }
                } else if (chartType === 'carbon') {
                    if (year === 2023) {
                        data = staticCarbonData2023;
                    } else if (year === 2024) {
                        data = staticCarbonData2024; // Assuming you have staticCarbonData2024 defined similarly
                    } else {
                        throw new Error('Static data for the selected year and chart type is not available.');
                    }
                } else {
                    throw new Error('Invalid chartType. Must be "energy" or "carbon".');
                }
            } else {
                // Call backend API to get analysis data
                const response = await fetch(`/api/analyse-chart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ schoolId, year, chartType }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch analysis.');
                }

                data = await response.json();
            }

            // Display the analysis
            displayAnalysis(data);

            hideLoadingScreen();
        } catch (error) {
            console.error('Error generating analysis:', error);
            hideLoadingScreen();
            analysisContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        }
    }

    function displayAnalysis(analysisData) {
        if (!analysisData) {
            analysisContainer.innerHTML = '<div class="alert alert-warning">No analysis data available.</div>';
            return;
        }

        // Build the HTML content
        let htmlContent = '';

        // Display Main Chart
        if (analysisData.main_chart) {
            htmlContent += `
                <h2>Main Chart</h2>
                <canvas id="mainChart"></canvas>
            `;
        }

        // Display Areas of Concern
        if (analysisData.areas_of_concern && analysisData.areas_of_concern.length > 0) {
            htmlContent += '<h2>Areas of Concern</h2>';

            analysisData.areas_of_concern.forEach((area, index) => {
                htmlContent += `
                    <div class="area-of-concern">
                        <h3>${area.title}</h3>
                        <p>${area.problem}</p>
                        <p>${area.conclusion}</p>
                        <canvas id="areaChart${index}"></canvas>
                    </div>
                `;
            });
        }

        // Display Personalized Recommendations
        if (analysisData.personalized_recommendations && analysisData.personalized_recommendations.length > 0) {
            htmlContent += `
                <h2>Personalized Recommendations</h2>
                <ul>
                    ${analysisData.personalized_recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            `;
        }

        // Display Strengths
        if (analysisData.strengths && analysisData.strengths.length > 0) {
            htmlContent += '<h2>Strengths</h2>';

            analysisData.strengths.forEach((strength, index) => {
                htmlContent += `
                    <div class="strength">
                        <h3>${strength.title}</h3>
                        <p>${strength.achievement}</p>
                        <p>${strength.conclusion}</p>
                        <canvas id="strengthChart${index}"></canvas>
                    </div>
                `;
            });
        }

        // Display Predictions
        if (analysisData.predictions && analysisData.predictions.length > 0) {
            htmlContent += '<h2>Predictions</h2>';

            htmlContent += `
                <canvas id="predictionChart"></canvas>
            `;
        }

        // Set the HTML content
        analysisContainer.innerHTML = htmlContent;

        // Now that the HTML is set, the canvas elements exist in the DOM.
        // We can render the charts.

        // Render Main Chart
        if (analysisData.main_chart) {
            renderMainChart('mainChart', analysisData.main_chart);
        }

        // Render charts for Areas of Concern
        if (analysisData.areas_of_concern) {
            analysisData.areas_of_concern.forEach((area, index) => {
                renderAreaChart(`areaChart${index}`, area.data);
            });
        }

        // Render charts for Strengths
        if (analysisData.strengths) {
            analysisData.strengths.forEach((strength, index) => {
                renderStrengthChart(`strengthChart${index}`, strength.data);
            });
        }

        // Render Prediction Chart
        if (analysisData.predictions) {
            renderPredictionChart('predictionChart', analysisData.predictions);
        }

        analysisOutput.classList.remove('hidden');
        downloadPdfBtn.classList.remove('hidden'); // Show the download button
    }

    function downloadAnalysisAsPDF() {
        const analysisContent = document.getElementById('analysisContainer');

        // Define PDF options
        const opt = {
            margin:       0.5,
            filename:     'Analysis.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate and save the PDF
        html2pdf().set(opt).from(analysisContent).save();
    }

    function renderMainChart(canvasId, data) {
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
                    label: chartType === 'energy' ? 'Energy Usage (kWh)' : 'Carbon Footprint (tons)',
                    data: data.values,
                    backgroundColor: chartType === 'energy' ? 'rgba(54, 162, 235, 0.6)' : 'rgba(75, 192, 192, 0.6)',
                    borderColor: chartType === 'energy' ? 'rgba(54, 162, 235, 1)' : 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
            },
        });
    }

    function renderAreaChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id ${canvasId} not found.`);
            return;
        }
        const ctx = canvas.getContext('2d');

        let chartTypeOption = data.type || 'bar';

        new Chart(ctx, {
            type: chartTypeOption,
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Values',
                    data: data.values,
                    backgroundColor: data.backgroundColor || 'rgba(255, 99, 132, 0.6)',
                    borderColor: data.borderColor || 'rgba(255,99,132,1)',
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

    function renderPredictionChart(canvasId, predictions) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id ${canvasId} not found.`);
            return;
        }
        const ctx = canvas.getContext('2d');

        const labels = predictions.map(p => `${p.year}`);
        const actualData = predictions.map(p => chartType === 'energy' ? p.predicted_energy_kwh : p.predicted_carbon_tons);
        const idealData = predictions.map(p => chartType === 'energy' ? p.ideal_energy_kwh : p.ideal_carbon_tons);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Actual ${chartType === 'energy' ? 'Energy Usage (kWh)' : 'Carbon Emissions (tons)'}`,
                        data: actualData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: false,
                    },
                    {
                        label: `Ideal ${chartType === 'energy' ? 'Energy Usage (kWh)' : 'Carbon Emissions (tons)'}`,
                        data: idealData,
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
                maintainAspectRatio: true,
            },
        });
    }

    function showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'block';
        analysisOutput.classList.add('hidden');
    }

    function hideLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'none';
        analysisOutput.classList.remove('hidden');
    }
});
