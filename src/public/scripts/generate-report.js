// scripts/generate-report.js
guardLoginPage();

const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
const role = sessionStorage.getItem("role") || localStorage.getItem("role");

console.log('Role:', role); // Debugging log

document.addEventListener('DOMContentLoaded', () => {
    const generateReportBtn = document.getElementById('generateReportBtn');
    const yearSelect = document.getElementById('year');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const reportOutput = document.getElementById('reportOutput');
    const loadingScreen = document.getElementById('loading-screen');
    let currentAreaChart = null;
    window.areaChartInstances = {};
    if (loadingScreen) {
        console.log('Loading screen is ready');
    }
    // Flag to toggle between static and dynamic data
    const useStaticData = true; // Set to false to enable API fetching

    downloadPdfBtn.classList.add('hidden');

    const staticReportData2024 = {
        green_score: {
            score: 75,
            summary: "Lincoln High School demonstrates moderate sustainability performance with room for improvement in energy management and emission reduction, especially in warmer months."
        },
        areas_of_concern: [
            {
                title: "High Energy Usage in July",
                problem: "July recorded the highest energy consumption of the year.",
                data: {
                    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    values: [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350],
                    temperature: [22, 21, 23, 20, 19, 25, 28, 27, 24, 22, 21, 23]
                },
                conclusion: "The peak in energy usage during July can be attributed to higher average temperatures, leading to increased cooling needs. Targeting energy-efficient cooling solutions could mitigate this issue."
            },
            {
                title: "Increased Carbon Emissions in July, September, and December",
                problem: "Carbon emissions peaked in July, September, and December at 1.00 tons.",
                data: {
                    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    values: [0.80, 0.70, 0.90, 0.80, 0.90, 0.80, 1.00, 0.90, 1.00, 0.70, 0.80, 1.00]
                },
                conclusion: "Higher emissions during these months suggest a correlation with increased energy usage. Implementing renewable energy sources could help reduce the carbon footprint."
            }
        ],
        personalized_recommendations: [
            "Install energy-efficient HVAC systems to reduce energy usage during warmer months.",
            "Incorporate solar panels to offset energy consumption and reduce reliance on non-renewable sources.",
            "Implement a building management system to optimize energy usage and monitor consumption patterns.",
            "Encourage behavioral changes, such as turning off lights and equipment when not in use, to decrease energy demand."
        ],
        strengths: [
            {
                title: "Lowest Energy Usage in April",
                achievement: "April recorded the lowest energy consumption of the year.",
                data: {
                    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    values: [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350]
                },
                conclusion: "April's low energy usage indicates effective energy management, possibly due to milder weather conditions reducing the need for cooling."
            },
            {
                title: "Lowest Carbon Emissions in February and October",
                achievement: "Carbon emissions were lowest in February and October at 0.70 tons.",
                data: {
                    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    values: [0.80, 0.70, 0.90, 0.80, 0.90, 0.80, 1.00, 0.90, 1.00, 0.70, 0.80, 1.00]
                },
                conclusion: "The low emissions during these months reflect efficient energy use, likely due to decreased demand for cooling and lighting."
            }
        ],
        path_to_net_zero: [
            "Increase the installation of renewable energy sources such as solar panels to reduce dependence on non-renewable energy.",
            "Enhance energy efficiency in buildings through retrofitting and smart technology implementation.",
            "Promote sustainable transportation options for students and staff, such as carpooling and cycling.",
            "Conduct regular sustainability audits to identify areas for improvement and track progress toward goals.",
            "Engage the school community in sustainability initiatives to foster a culture of environmental responsibility."
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

    <h2>Green Score: ${staticReportData2024.green_score.score}</h2>
    <p>${staticReportData2024.green_score.summary}</p>

    <div class="report-section page-break">
        <h2>Areas of Concern</h2>
        ${staticReportData2024.areas_of_concern.map((area, index) => `
            <div class="area-of-concern-container">
                ${index === 0 ? `
                    <h3>${area.title}</h3>
                    <p>${area.problem}</p>
                    <p>High summer cooling energy consumption. 
                    July maintains high HVAC usage (29%) for cooling. Reduced occupancy during summer break helps moderate overall energy consumption in classrooms and common areas.</p>
                    <p>${area.conclusion}</p>
                    <div class="chart-wrapper">
                        <canvas id="areaChart${index}" style="max-height: 500px;"></canvas>
                    </div>
                    <h2>Energy Usage Reduction Strategies</h2>
                    <h3>Summer Break Energy Conservation</h3>
                    <p>Reduced HVAC Operation: Lower HVAC settings during summer break when occupancy is minimal, ensuring only essential areas remain cooled.
                    Dormant Mode for Classrooms: Implement a dormant mode for classrooms, where non-essential systems are turned off or set to energy-saving modes.</p>
                    <h3>Common Area Cooling Efficiency</h3>
                    <p>Shared Cooling Zones: Consolidate cooling in common areas such as libraries and cafeterias where occupancy remains higher during summer.
                    Ventilation Adjustments: Adjust ventilation rates in common areas to optimize cooling without overusing HVAC systems.</p>
                    <h3>Energy-Efficient Summer Programs</h3>
                    <p>Eco-Friendly Summer Camps: Design summer programs with energy efficiency in mind, using facilities that are already cooled and minimizing the need for additional cooling.
                    Sustainability Workshops: Incorporate sustainability workshops into summer programs to educate participants on energy conservation practices.</p>
                    <h3>Regular Energy Audits</h3>
                    <p>Summer Energy Audits: Conduct energy audits during summer break to identify and address any inefficiencies in the school's cooling systems.
                    Maintenance Scheduling: Schedule preventive maintenance for HVAC systems during low-occupancy periods to ensure optimal performance when the school reopens.</p>
                ` : `
                    <h3>${area.title}</h3>
                    <p>${area.problem}</p>
                    <p>Sustained high emissions during summer break due to ongoing transportation and limited oversight of waste.
                    July maintains elevated carbon emissions with reduced oversight during summer break. Continuing sustainable transportation programs and monitoring waste disposal can mitigate these emissions.</p>
                    <p>${area.conclusion}</p>
                    <div class="chart-wrapper">
                        <canvas id="areaChart${index}" style="max-height: 500px;"></canvas>
                    </div>
                    <h2>Carbon Emission Reduction Strategies</h2>
                    <h3>Plan for Sustainable Summer Breaks</h3>
                    <p>Encourage staff to participate in local environmental initiatives during summer months.
                    Provide guidelines for minimizing energy and resource use while the school is on break.</p>
                    <h3>Implement Green Landscaping Practices</h3>
                    <p>Use native plants in school landscaping to reduce water usage and support local ecosystems.
                    Install rain gardens to manage stormwater runoff and decrease flooding risks.</p>
                    <h3>Promote Carbon-Neutral Travel for School Trips</h3>
                    <p>Offset carbon emissions from school trips by investing in carbon offset projects.
                    Choose eco-friendly transportation methods, such as buses or trains, over individual car travel.</p>
                `}
            </div>
        `).join('')}
    </div>

    <!-- Recommendations Section -->
    <div class="report-section page-break">
        <h2>Recommendations</h2>
        <ul>
            ${staticReportData2024.personalized_recommendations.map(rec => `<li>${rec}</li><br>`).join('')}
        </ul>
    </div>

    <!-- Strengths Section -->
    <div class="report-section page-break">
        <h2>Strengths</h2>
        ${staticReportData2024.strengths.map((strength, index) => `
            <div class="strength-container">
                <h3>${strength.title}</h3>
                <p>${strength.achievement}</p>
                <p>${strength.conclusion}</p>
                <div class="chart-wrapper">
                    <canvas id="strengthChart${index}" style="max-height: 500px;"></canvas>
                </div>
            </div>
        `).join('')}
    </div>

    <!-- Path to Net Zero Section -->
    <div class="report-section page-break">
        <h2>Path to Net Zero</h2>
        <ul>
            ${staticReportData2024.path_to_net_zero.map(item => `<li>${item}</li><br>`).join('')}
        </ul>
    </div>

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

    const staticRecommendationData2024 = {
        green_score: staticReportData2024.green_score,
        areas_of_concern: staticReportData2024.areas_of_concern,
        strengths: staticReportData2024.strengths,
        path_to_net_zero: staticReportData2024.path_to_net_zero,
        personalized_recommendations: staticReportData2024.personalized_recommendations
    };
    
    const staticPredictionData2024 = {
        predictions: staticReportData2024.predictions,
        net_zero_estimation: staticReportData2024.net_zero_estimation
    };

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
                    const result = await saveReportToDatabase(schoolId, year, staticRecommendationData2024, staticPredictionData2024, staticReportHTML2024);
                    console.log(result.message); // Log the result message
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
        reportOutput.classList.add('hidden'); // Hide the report
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
        reportOutput.classList.remove('hidden'); // Make the report visible
        downloadPdfBtn.classList.remove('hidden'); // Show the download button after generating the report
    
        // Initialize charts after the report is displayed
        initCharts();
    }

    // Function to initialize charts
    function initCharts() {
        if (useStaticData) {
            // Initialize Areas of Concern Charts
            staticReportData2024.areas_of_concern.forEach((area, index) => {
                try {
                    const chartData = {
                        labels: area.data.labels,
                        values: area.data.values,
                        temperature: area.data.temperature
                    };

                    // Destroy existing chart instance if it exists
                    if (window.areaChartInstances[`areaChart${index}`]) {
                        window.areaChartInstances[`areaChart${index}`].destroy();
                    }

                    const canvas = document.getElementById(`areaChart${index}`);
                    if (canvas) {
                        canvas.height = 500; // Set fixed height
                        if (index === 0) {
                            renderEnergyChart(`areaChart${index}`, chartData);
                        } else {
                            renderCarbonChart(`areaChart${index}`, chartData);
                        }
                    }
                } catch (error) {
                    console.error('Error creating charts:', error);
                }
            });

               // Initialize Strengths Charts
            staticReportData2024.strengths.forEach((strength, index) => {
                const canvas = document.getElementById(`strengthChart${index}`);
                if (canvas) {
                    canvas.height = 500; // Set fixed height
                    renderStrengthChart(`strengthChart${index}`, strength.data);
                }
            });
    
   
            // Initialize Prediction Charts
            const energyChartContainer = document.getElementById('predictedEnergyChartContainer');
            if (energyChartContainer) {
                const canvas = document.createElement('canvas');
                canvas.height = 500;
                energyChartContainer.appendChild(canvas);
                renderPredictedEnergyChart(canvas, staticReportData2024.predictions);
            }

            const carbonChartContainer = document.getElementById('predictedCarbonChartContainer');
            if (carbonChartContainer) {
                const canvas = document.createElement('canvas');
                canvas.height = 500;
                carbonChartContainer.appendChild(canvas);
                renderPredictedCarbonChart(canvas, staticReportData2024.predictions);
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

    function renderEnergyChart(canvasId, chartData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
    
        // Debugging: Log chartData
        console.log(`Rendering Energy Chart on canvas: ${canvasId}`, chartData);
    
        // Destroy existing chart instance if it exists
        if (window.areaChartInstances[canvasId]) {
            window.areaChartInstances[canvasId].destroy();
        }
    
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthLabels = chartData.labels.map(label => {
            const monthIndex = monthNames.findIndex(month => label.startsWith(month));
            return monthNames[monthIndex !== -1 ? monthIndex : 0];
        });
    
        const config = {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Energy Usage (kWh)',
                    data: chartData.values,
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
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
                    y1: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Energy Usage (kWh)'
                        }
                    }
                }
            }
        };
    
        // Add temperature dataset if available
        if (chartData.temperature) {
            config.data.datasets.push({
                label: 'Temperature (°C)',
                data: chartData.temperature,
                type: 'line',
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                yAxisID: 'y2'
            });
    
            config.options.scales.y2 = {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Temperature (°C)'
                },
                grid: {
                    drawOnChartArea: false
                }
            };
        }
    
        try {
            window.areaChartInstances[canvasId] = new Chart(ctx, config);
        } catch (error) {
            console.error('Error initializing Energy Chart:', error);
        }
    }
  
    function renderCarbonChart(canvasId, chartData) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
  
      // Debugging: Log chartData
      console.log(`Rendering Carbon Chart on canvas: ${canvasId}`, chartData);
  
      // Destroy existing chart instance if it exists
      if (window.areaChartInstances[canvasId]) {
          window.areaChartInstances[canvasId].destroy();
      }
  
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLabels = chartData.labels.map(label => {
          // Attempt to parse the label as a date
          const date = new Date(label);
          if (!isNaN(date)) {
              const monthIndex = date.getMonth();
              return monthNames[monthIndex];
          }
          // Fallback: Check if label is a full month name
          const monthIndex = monthNames.findIndex(month => label.startsWith(month));
          return monthIndex !== -1 ? monthNames[monthIndex] : label;
      });
  
      const config = {
          type: 'line',
          data: {
              labels: monthLabels,
              datasets: [{
                  label: 'Carbon Emissions (tonnes)',
                  data: chartData.values,
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
                          text: 'Carbon Emissions (tonnes)'
                      }
                  }
              }
          }
      };
  
      try {
          window.areaChartInstances[canvasId] = new Chart(ctx, config);
      } catch (error) {
          console.error('Error initializing Carbon Chart:', error);
      }
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

        // Add a class for PDF-specific styles
        reportContent.classList.add('pdf-export');

        // Resize charts for PDF
        resizeChartsForPDF();   

        // Define PDF options
        const opt = {
            margin:       0,
            filename:     `Report_${school_name}_${ReportYear}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak: { mode: 'avoid-all', before: '.page-break' },
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
    const reportSections = document.querySelectorAll('.report-section');
    reportSections.forEach(section => {
        if (section.offsetHeight > 800) { // Adjust height as needed
            section.classList.add('page-break');
        }
    });

    // Resize charts for PDF width
    function resizeChartsForPDF() {
        const charts = document.querySelectorAll('canvas');
        charts.forEach((chart) => {
            const chartContainer = chart.parentElement;
            chart.style.width = '100%';
            chart.style.height = 'auto';
            chartContainer.style.maxWidth = '720px'; // Match PDF width
            chartContainer.style.maxHeight = '400px'; // Optional fixed height
        });
    }

    // Reset chart sizes after PDF generation
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

     // Function to save report to the database
     async function saveReportToDatabase(schoolId, year, recommendationData, predictionData, reportHTML) {
        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schoolId,
                    year,
                    content: reportHTML,
                    recommendationData,
                    predictionData
                }),
            });
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save report to the database.');
            }
    
            console.log('Report saved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error saving report:', error);
            if (error.message.includes('404')) {
                console.log('Running in demo mode - report generation successful');
                return {
                    success: true,
                    message: 'Report generated successfully (Demo Mode)'
                };
            }
            throw error;
        }
    }

    function displayError(message) {
        const reportOutput = document.getElementById('reportOutput');
        reportOutput.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
        reportOutput.classList.remove('hidden');
        downloadPdfBtn.classList.add('hidden');
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
