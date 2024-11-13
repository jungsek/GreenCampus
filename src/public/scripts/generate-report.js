// scripts/generate-report.js

document.addEventListener('DOMContentLoaded', () => {
    const generateReportBtn = document.getElementById('generateReportBtn');
    const yearSelect = document.getElementById('year');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const reportOutput = document.getElementById('reportOutput');
    // Flag to toggle between static and dynamic data
    const useStaticData = true; // Set to false to enable API fetching

    const staticReportData2024 = {
        green_score: {
            score: 75,
            summary: "Lincoln High School demonstrates moderate sustainability performance with effective energy management in certain months, but there are key areas needing improvement, particularly in reducing energy consumption and carbon emissions during peak periods."
        },
        areas_of_concern: [
            {
                title: "High Energy Consumption in July",
                problem: "July has the highest energy consumption at 1500 kWh.",
                data: {
                    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    values: [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350]
                },
                conclusion: "The high energy usage in July is likely due to increased air conditioning demands as a result of the high average temperature of 30.0°C."
            },
            {
                title: "High Carbon Emissions in July and December",
                problem: "Carbon emissions peaked at 1.00 tons in both July and December.",
                data: {
                    labels: ["2024-01-31", "2024-02-28", "2024-03-31", "2024-04-30", "2024-05-31", "2024-06-30", "2024-07-31", "2024-08-31", "2024-09-30", "2024-10-31", "2024-11-30", "2024-12-31"],
                    values: [0.80, 0.70, 0.90, 0.80, 0.90, 0.80, 1.00, 0.90, 1.00, 0.70, 0.80, 1.00]
                },
                conclusion: "The spikes in carbon emissions in July and December are linked to high energy consumption, possibly due to air conditioning and heating needs, respectively."
            }
        ],
        personalized_recommendations: [
            "Implement energy-efficient air conditioning systems and promote their usage during peak temperature months to reduce consumption.",
            "Introduce solar panels or other renewable energy sources to offset energy usage, particularly during high-demand months like July.",
            "Encourage behavior changes such as turning off unnecessary lights and equipment during peak consumption periods."
        ],
        strengths: [
            {
                title: "Low Energy Consumption in April",
                achievement: "April recorded the lowest energy consumption at 1100 kWh.",
                data: {
                    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    values: [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350]
                },
                conclusion: "The lower energy usage in April may be attributed to moderate weather conditions and efficient energy management practices."
            },
            {
                title: "Low Carbon Emissions in February and October",
                achievement: "February and October had the lowest carbon emissions at 0.70 tons each.",
                data: {
                    labels: ["2024-01-31", "2024-02-28", "2024-03-31", "2024-04-30", "2024-05-31", "2024-06-30", "2024-07-31", "2024-08-31", "2024-09-30", "2024-10-31", "2024-11-30", "2024-12-31"],
                    values: [0.80, 0.70, 0.90, 0.80, 0.90, 0.80, 1.00, 0.90, 1.00, 0.70, 0.80, 1.00]
                },
                conclusion: "Effective energy management and favorable weather conditions contributed to the reduced carbon emissions in these months."
            }
        ],
        path_to_net_zero: [
            "Adopt a school-wide energy reduction plan focusing on energy efficiency and conservation measures.",
            "Invest in renewable energy projects, such as solar panels, to reduce reliance on non-renewable energy sources.",
            "Implement a comprehensive carbon tracking system to monitor progress and identify further reduction opportunities.",      
            "Encourage a culture of sustainability among students and staff through education and awareness programs."
        ],
        predictions: [
            {
                year: 2024,
                predicted_energy_kwh: 1100,
                ideal_energy_kwh: 900,
                predicted_carbon_tons: 0.85,
                ideal_carbon_tons: 0.70
            },
            {
                year: 2025,
                predicted_energy_kwh: 1080,
                ideal_energy_kwh: 880,
                predicted_carbon_tons: 0.83,
                ideal_carbon_tons: 0.68
            },
            {
                year: 2026,
                predicted_energy_kwh: 1120,
                ideal_energy_kwh: 860,
                predicted_carbon_tons: 0.87,
                ideal_carbon_tons: 0.66
            },
            {
                year: 2027,
                predicted_energy_kwh: 1050,
                ideal_energy_kwh: 840,
                predicted_carbon_tons: 0.80,
                ideal_carbon_tons: 0.64
            },
            {
                year: 2028,
                predicted_energy_kwh: 1030,
                ideal_energy_kwh: 820,
                predicted_carbon_tons: 0.78,
                ideal_carbon_tons: 0.62
            },
            {
                year: 2029,
                predicted_energy_kwh: 1070,
                ideal_energy_kwh: 800,
                predicted_carbon_tons: 0.82,
                ideal_carbon_tons: 0.60
            },
            {
                year: 2030,
                predicted_energy_kwh: 1020,
                ideal_energy_kwh: 780,
                predicted_carbon_tons: 0.77,
                ideal_carbon_tons: 0.58
            },
            {
                year: 2031,
                predicted_energy_kwh: 990,
                ideal_energy_kwh: 760,
                predicted_carbon_tons: 0.75,
                ideal_carbon_tons: 0.56
            },
            {
                year: 2032,
                predicted_energy_kwh: 970,
                ideal_energy_kwh: 740,
                predicted_carbon_tons: 0.73,
                ideal_carbon_tons: 0.54
            },
            {
                year: 2033,
                predicted_energy_kwh: 950,
                ideal_energy_kwh: 720,
                predicted_carbon_tons: 0.71,
                ideal_carbon_tons: 0.52
            },
            {
                year: 2034,
                predicted_energy_kwh: 980,
                ideal_energy_kwh: 700,
                predicted_carbon_tons: 0.74,
                ideal_carbon_tons: 0.50
            },
            {
                year: 2035,
                predicted_energy_kwh: 930,
                ideal_energy_kwh: 680,
                predicted_carbon_tons: 0.70,
                ideal_carbon_tons: 0.48
            },
            {
                year: 2036,
                predicted_energy_kwh: 910,
                ideal_energy_kwh: 660,
                predicted_carbon_tons: 0.68,
                ideal_carbon_tons: 0.46
            },
            {
                year: 2037,
                predicted_energy_kwh: 890,
                ideal_energy_kwh: 640,
                predicted_carbon_tons: 0.66,
                ideal_carbon_tons: 0.44
            },
            {
                year: 2038,
                predicted_energy_kwh: 870,
                ideal_energy_kwh: 620,
                predicted_carbon_tons: 0.64,
                ideal_carbon_tons: 0.42
            },
            {
                year: 2039,
                predicted_energy_kwh: 900,
                ideal_energy_kwh: 600,
                predicted_carbon_tons: 0.67,
                ideal_carbon_tons: 0.40
            },
            {
                year: 2040,
                predicted_energy_kwh: 850,
                ideal_energy_kwh: 580,
                predicted_carbon_tons: 0.63,
                ideal_carbon_tons: 0.38
            },
            {
                year: 2041,
                predicted_energy_kwh: 830,
                ideal_energy_kwh: 560,
                predicted_carbon_tons: 0.61,
                ideal_carbon_tons: 0.36
            },
            {
                year: 2042,
                predicted_energy_kwh: 810,
                ideal_energy_kwh: 540,
                predicted_carbon_tons: 0.59,
                ideal_carbon_tons: 0.34
            },
            {
                year: 2043,
                predicted_energy_kwh: 790,
                ideal_energy_kwh: 520,
                predicted_carbon_tons: 0.57,
                ideal_carbon_tons: 0.32
            },
            {
                year: 2044,
                predicted_energy_kwh: 770,
                ideal_energy_kwh: 500,
                predicted_carbon_tons: 0.55,
                ideal_carbon_tons: 0.30
            },
            {
                year: 2045,
                predicted_energy_kwh: 800,
                ideal_energy_kwh: 480,
                predicted_carbon_tons: 0.58,
                ideal_carbon_tons: 0.28
            },
            {
                year: 2046,
                predicted_energy_kwh: 750,
                ideal_energy_kwh: 460,
                predicted_carbon_tons: 0.54,
                ideal_carbon_tons: 0.26
            },
            {
                year: 2047,
                predicted_energy_kwh: 730,
                ideal_energy_kwh: 440,
                predicted_carbon_tons: 0.52,
                ideal_carbon_tons: 0.24
            },
            {
                year: 2048,
                predicted_energy_kwh: 710,
                ideal_energy_kwh: 420,
                predicted_carbon_tons: 0.50,
                ideal_carbon_tons: 0.22
            },
            {
                year: 2049,
                predicted_energy_kwh: 690,
                ideal_energy_kwh: 400,
                predicted_carbon_tons: 0.48,
                ideal_carbon_tons: 0.21
            },
            {
                year: 2050,
                predicted_energy_kwh: 650,
                ideal_energy_kwh: 380,
                predicted_carbon_tons: 0.45,
                ideal_carbon_tons: 0.20
            }
        ],
        net_zero_estimation: {
            current_status: "65% towards net zero",
            estimated_year_to_net_zero: 2042
        }
    };

    // Static Report HTML Template
    const staticReportHTML2024 = `
    <h1>Lincoln High School Sustainability Report 2024</h1>

    <p>This report provides an in-depth analysis of the energy consumption and carbon footprint of Lincoln High School for the year 2024. Our key objective is to help the school achieve net-zero emissions by 2050. The report highlights monthly energy usage trends, identifies periods of high consumption, and offers targeted recommendations to enhance sustainability efforts.</p>  

    <h2>Energy Consumption Overview</h2>

    <table>
        <thead>
            <tr>
                <th>Month</th>
                <th>Energy Usage (kWh)</th>
                <th>Average Temperature (°C)</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>January</td><td>1300.00</td><td>26.0</td></tr>
            <tr><td>February</td><td>1200.00</td><td>25.5</td></tr>
            <tr><td>March</td><td>1400.00</td><td>28.0</td></tr>
            <tr><td>April</td><td>1100.00</td><td>27.0</td></tr>
            <tr><td>May</td><td>1150.00</td><td>26.0</td></tr>
            <tr><td>June</td><td>1250.00</td><td>29.0</td></tr>
            <tr><td>July</td><td>1500.00</td><td>30.0</td></tr>
            <tr><td>August</td><td>1400.00</td><td>29.5</td></tr>
            <tr><td>September</td><td>1300.00</td><td>26.5</td></tr>
            <tr><td>October</td><td>1200.00</td><td>24.5</td></tr>
            <tr><td>November</td><td>1250.00</td><td>23.5</td></tr>
            <tr><td>December</td><td>1350.00</td><td>22.5</td></tr>
        </tbody>
    </table>

    <p>The energy consumption at Lincoln High School shows a significant correlation with temperature changes, peaking during the hot summer month of July due to air conditioning demands. Efforts to stabilize energy usage throughout the year are necessary to manage consumption effectively.</p>

    <h2>Carbon Footprint Overview</h2>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Total Carbon Emissions (tons)</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>2024-01-31</td><td>0.80</td></tr>
            <tr><td>2024-02-28</td><td>0.70</td></tr>
            <tr><td>2024-03-31</td><td>0.90</td></tr>
            <tr><td>2024-04-30</td><td>0.80</td></tr>
            <tr><td>2024-05-31</td><td>0.90</td></tr>
            <tr><td>2024-06-30</td><td>0.80</td></tr>
            <tr><td>2024-07-31</td><td>1.00</td></tr>
            <tr><td>2024-08-31</td><td>0.90</td></tr>
            <tr><td>2024-09-30</td><td>1.00</td></tr>
            <tr><td>2024-10-31</td><td>0.70</td></tr>
            <tr><td>2024-11-30</td><td>0.80</td></tr>
            <tr><td>2024-12-31</td><td>1.00</td></tr>
        </tbody>
    </table>

    <p>The carbon emissions pattern reflects the energy usage trends, with peaks in July and December. These peaks highlight the need for targeted interventions to reduce energy demands during these periods to progress towards net-zero goals.</p>        

    <h2>Energy Breakdown</h2>
    <!-- January -->
    <h3>January</h3>
    <ul>
        <li>Heating and lighting were primary energy uses.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>37.50</td>
            </tr>
            <tr>
                <td>HVAC (Heating, Ventilation, and Air Conditioning)</td>
                <td>18.75</td>
            </tr>
            <tr>
                <td>Refrigeration</td>
                <td>12.50</td>
            </tr>
            <tr>
                <td>Other</td>
                <td>31.25</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1300 kWh (100%)</p>

    <!-- February -->
    <h3>February</h3>
    <ul>
        <li>Reduced heating demands led to lower energy consumption.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>28.57</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>14.29</td>
            </tr>
            <tr>
                <td>Computers</td>
                <td>28.57</td>
            </tr>
            <tr>
                <td>Other</td>
                <td>28.57</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1200 kWh (100%)</p>

    <!-- March -->
    <h3>March</h3>
    <ul>
        <li>Increasing temperatures started to elevate cooling needs.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>41.67</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>25.00</td>
            </tr>
            <tr>
                <td>Computers</td>
                <td>16.67</td>
            </tr>
            <tr>
                <td>Refrigeration</td>
                <td>8.33</td>
            </tr>
            <tr>
                <td>Sound Equipment</td>
                <td>6.67</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1400 kWh (100%)</p>

    <!-- April -->
    <h3>April</h3>
    <ul>
        <li>Moderate climate resulted in optimal energy use efficiency.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>25.00</td>
            </tr>
            <tr>
                <td>Refrigeration</td>
                <td>25.00</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>16.67</td>
            </tr>
            <tr>
                <td>Lighting (Hallway)</td>
                <td>6.25</td>
            </tr>
            <tr>
                <td>Other</td>
                <td>27.08</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1100 kWh (100%)</p>

    <!-- May -->
    <h3>May</h3>
    <ul>
        <li>Energy usage slightly increased with warming temperatures.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>30.00</td>
            </tr>
            <tr>
                <td>Computers</td>
                <td>30.00</td>
            </tr>
            <tr>
                <td>Lighting (Office)</td>
                <td>15.00</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>15.00</td>
            </tr>
            <tr>
                <td>Lighting (Hallway)</td>
                <td>10.00</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1150 kWh (100%)</p>

    <!-- June -->
    <h3>June</h3>
    <ul>
        <li>Cooling needs contributed to increased energy consumption.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>25.00</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>25.00</td>
            </tr>
            <tr>
                <td>Refrigeration</td>
                <td>25.00</td>
            </tr>
            <tr>
                <td>Lighting (Hallway)</td>
                <td>6.25</td>
            </tr>
            <tr>
                <td>Other</td>
                <td>18.75</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1250 kWh (100%)</p>

    <!-- July -->
    <h3>July</h3>
    <ul>
        <li>Peak energy usage due to air conditioning.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>42.86</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>26.32</td>
            </tr>
            <tr>
                <td>Lighting (Auditorium)</td>
                <td>26.32</td>
            </tr>
            <tr>
                <td>Computers</td>
                <td>10.53</td>
            </tr>
            <tr>
                <td>HVAC (Laboratory)</td>
                <td>15.79</td>
            </tr>
            <tr>
                <td>Appliances (Cafeteria)</td>
                <td>10.53</td>
            </tr>
            <tr>
                <td>Lighting (Hallway)</td>
                <td>5.25</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1500 kWh (100%)</p>

    <!-- August -->
    <h3>August</h3>
    <ul>
        <li>Consistent cooling demands kept energy usage high.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>26.67</td>
            </tr>
            <tr>
                <td>Appliances</td>
                <td>26.67</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>20.00</td>
            </tr>
            <tr>
                <td>Refrigeration</td>
                <td>20.00</td>
            </tr>
            <tr>
                <td>Lighting (Hallway)</td>
                <td>6.66</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1400 kWh (100%)</p>

    <!-- September -->
    <h3>September</h3>
    <ul>
        <li>Decreased cooling needs as temperatures began to drop.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>42.86</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>21.43</td>
            </tr>
            <tr>
                <td>Appliances</td>
                <td>7.14</td>
            </tr>
            <tr>
                <td>Lighting (Auditorium)</td>
                <td>14.29</td>
            </tr>
            <tr>
                <td>HVAC (Laboratory)</td>
                <td>14.28</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1300 kWh (100%)</p>

    <!-- October -->
    <h3>October</h3>
    <ul>
        <li>Lower energy use due to milder weather.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>40.00</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>20.00</td>
            </tr>
            <tr>
                <td>Computers</td>
                <td>25.00</td>
            </tr>
            <tr>
                <td>Lighting (Auditorium)</td>
                <td>13.33</td>
            </tr>
            <tr>
                <td>Lighting (Hallway)</td>
                <td>6.67</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1200 kWh (100%)</p>

    <!-- November -->
    <h3>November</h3>
    <ul>
        <li>Gradual increase in heating needs.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>40.00</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>20.00</td>
            </tr>
            <tr>
                <td>Lighting (Office)</td>
                <td>20.00</td>
            </tr>
            <tr>
                <td>Equipment (Gym)</td>
                <td>6.67</td>
            </tr>
            <tr>
                <td>Lighting (Auditorium)</td>
                <td>13.33</td>
            </tr>
            <tr>
                <td>Lighting (Hallway)</td>
                <td>6.67</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1250 kWh (100%)</p>

    <!-- December -->
    <h3>December</h3>
    <ul>
        <li>High energy usage due to heating demands.</li>
    </ul>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Percentage of Total Energy Usage (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lighting</td>
                <td>40.00</td>
            </tr>
            <tr>
                <td>HVAC</td>
                <td>20.00</td>
            </tr>
            <tr>
                <td>Refrigeration</td>
                <td>13.33</td>
            </tr>
            <tr>
                <td>Lighting (Hallway)</td>
                <td>6.67</td>
            </tr>
            <tr>
                <td>Other</td>
                <td>20.00</td>
            </tr>
        </tbody>
    </table>
    <p><strong>Total Energy Usage:</strong> 1350 kWh (100%)</p>

    <!-- Areas of Concern -->
    <h3>Areas of Concern</h3>
    ${staticReportData2024.areas_of_concern.map((area, index) => `
        <div class="area-of-concern">
            <h4>${area.title}</h4>
            <p>${area.problem}</p>
            <p>${area.conclusion}</p>
            <div class="chart-placeholder" data-chart-type="areaOfConcern" data-index="${index}"></div>
        </div>
    `).join('')}

    <p><strong>Total Energy Usage:</strong> 100%</p>

    <!-- Personalized Recommendations -->
    <h3>Personalized Recommendations</h3>
    <ul>
        ${staticReportData2024.personalized_recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>

    <!-- Strengths -->
    <h3>Strengths</h3>
    ${staticReportData2024.strengths.map((strength, index) => `
        <div class="strength">
            <h4>${strength.title}</h4>
            <p>${strength.achievement}</p>
            <p>${strength.conclusion}</p>
            <div class="chart-placeholder" data-chart-type="strength" data-index="${index}"></div>
        </div>
    `).join('')}

    <p><strong>Total Carbon Emissions:</strong> 100%</p>

    <!-- Path to Net Zero -->
    <h3>Path to Net Zero</h3>
    <ul>
        ${staticReportData2024.path_to_net_zero.map(step => `<li>${step}</li>`).join('')}
    </ul>

    <!-- Predictions -->
    <h2>Predictions</h2>
    <h3>Predicted Energy Usage and Carbon Emissions until 2050</h3>
    <div id="predictedEnergyChartContainer"></div>
    <div id="predictedCarbonChartContainer"></div>
    <p>The following charts illustrate the predicted energy usage and carbon emissions for the school until 2050.</p>      

    <!-- Net Zero Estimation -->
    <h3>Net Zero Estimation</h3>
    <p>Current Status: ${staticReportData2024.net_zero_estimation.current_status}</p>
    <p>Estimated Year to Net Zero: ${staticReportData2024.net_zero_estimation.estimated_year_to_net_zero}</p>

    <h2>Additional Analysis</h2>
    <p>Achieving net-zero emissions will require a multifaceted approach, including infrastructure upgrades, policy changes, and fostering a sustainability-focused culture among students and staff. Future planning should also consider potential technological advancements and funding opportunities for renewable energy projects.</p>

    <h2>Conclusion</h2>
    <p>Lincoln High School is on a positive path towards sustainability, with key strengths in energy management during moderate months. However, addressing high energy and carbon emissions during extreme temperature periods will be crucial. By implementing recommended actions, the school can significantly progress towards its net-zero emissions target, leading the way in environmental responsibility and sustainability education.</p>
    `;

    // Chart Data for Areas of Concern and Strengths
    const chartData = {
        areas_of_concern: staticReportData2024.areas_of_concern.map(area => area.data),
        strengths: staticReportData2024.strengths.map(strength => strength.data)
    };

    // Chart Data for Predictions
    const predictionChartData = {
        energy: staticReportData2024.predictions,
        carbon: staticReportData2024.predictions
    };
    
    // Function to simulate a delay (e.g., 3 seconds)
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
            if (useStaticData) {
                // Simulate a 3-second data fetching delay
                await delay(3000);

                // Only generate the report if the selected year is 2024
                if (year === 2024) {
                    displayReport(staticReportHTML2024);
                } else {
                    displayError('Report data for the selected year is not available.');
                }
            } else {            
                // Generate Report with schoolId and year
                const report = await generateReport(schoolId, year);
                // Display the report
                displayReport(report);
            }
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
        if (useStaticData) {
            // Initialize Areas of Concern Charts
            chartData.areas_of_concern.forEach((area, index) => {
                const placeholder = document.querySelector(`.chart-placeholder[data-chart-type="areaOfConcern"][data-index="${index}"]`);
                if (placeholder) {
                    const canvas = document.createElement('canvas');
                    placeholder.appendChild(canvas);
                    renderAreaOfConcernChart(canvas, area);
                }
            });
    
            // Initialize Strengths Charts
            chartData.strengths.forEach((strength, index) => {
                const placeholder = document.querySelector(`.chart-placeholder[data-chart-type="strength"][data-index="${index}"]`);
                if (placeholder) {
                    const canvas = document.createElement('canvas');
                    placeholder.appendChild(canvas);
                    renderStrengthChart(canvas, strength);
                }
            });
    
            // Initialize Prediction Charts
            const energyChartContainer = document.getElementById('predictedEnergyChartContainer');
            if (energyChartContainer) {
                const canvas = document.createElement('canvas');
                canvas.height = 400; // Optional: Set desired height
                energyChartContainer.appendChild(canvas);
                renderPredictedEnergyChart(canvas, predictionChartData.energy);
            }
    
            const carbonChartContainer = document.getElementById('predictedCarbonChartContainer');
            if (carbonChartContainer) {
                const canvas = document.createElement('canvas');
                canvas.height = 400; // Optional: Set desired height
                carbonChartContainer.appendChild(canvas);
                renderPredictedCarbonChart(canvas, predictionChartData.carbon);
            }
        } else {
            // Initialize Recommendation Charts
            if (recommendationData) {
                initRecommendationCharts();
            }

            // Initialize Prediction Charts
            if (predictionData) {
                initPredictionCharts();
            }
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
