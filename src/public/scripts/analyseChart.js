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
    let selectedMonth = 6;
    let currentAreaChart = null; // For managing area chart instance
window.areaChartInstances = {}; // For managing multiple area chart instances
    const colorMapping = {
        "Lighting": "#3498db",
        "Computers": "#5bc7a0",
        "HVAC": "#9b59b6",
        "Equipment": "#f1c40f",
        "Refrigeration": "#ff7f50",
        "Appliances": "#e74c3c",
        "Food Waste Management": "#FFC0CB",
        "Sound Equipment": "#c5c6c7"
    };

    // Update the page title based on the chart type
    if (chartType === 'energy') {
        analysisTitle.textContent = `Energy Usage Analysis for ${year}`;
    } else if (chartType === 'carbon') {
        analysisTitle.textContent = `Carbon Footprint Analysis for ${year}`;
    } else {
        analysisTitle.textContent = `Chart Analysis`;
    }

    async function fetchEnergyBreakdownData() {
      let response = await fetch(`/energy-breakdowns/school/${schoolId}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              //'Authorization': `Bearer ${token}` // Include the token in the Authorization header
          }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      let Edata = await response.json();
      return Edata;
  }
    
    
    const staticEnergyData2024  = {
      "main_chart": {
        "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        "values": [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350],
        "temperature": [22, 21, 23, 20, 19, 25, 28, 27, 24, 22, 21, 23], 
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
    { "year": 2024, "predicted_energy_kwh": 1100, "ideal_energy_kwh": 900,  "without_recommendations_kwh": 1300 },
    { "year": 2025, "predicted_energy_kwh": 1080, "ideal_energy_kwh": 880,  "without_recommendations_kwh": 1280 },
    { "year": 2026, "predicted_energy_kwh": 1120, "ideal_energy_kwh": 860,  "without_recommendations_kwh": 1350 },
    { "year": 2027, "predicted_energy_kwh": 1050, "ideal_energy_kwh": 840,  "without_recommendations_kwh": 1320 },
    { "year": 2028, "predicted_energy_kwh": 1030, "ideal_energy_kwh": 820,  "without_recommendations_kwh": 1380 },
    { "year": 2029, "predicted_energy_kwh": 1070, "ideal_energy_kwh": 800,  "without_recommendations_kwh": 1400 },
    { "year": 2030, "predicted_energy_kwh": 1020, "ideal_energy_kwh": 780,  "without_recommendations_kwh": 1450 },
    { "year": 2031, "predicted_energy_kwh": 990,  "ideal_energy_kwh": 760,  "without_recommendations_kwh": 1420 },
    { "year": 2032, "predicted_energy_kwh": 970,  "ideal_energy_kwh": 740,  "without_recommendations_kwh": 1470 },
    { "year": 2033, "predicted_energy_kwh": 950,  "ideal_energy_kwh": 720,  "without_recommendations_kwh": 1490 },
    { "year": 2034, "predicted_energy_kwh": 980,  "ideal_energy_kwh": 700,  "without_recommendations_kwh": 1510 },
    { "year": 2035, "predicted_energy_kwh": 930,  "ideal_energy_kwh": 680,  "without_recommendations_kwh": 1480 },
    { "year": 2036, "predicted_energy_kwh": 910,  "ideal_energy_kwh": 660,  "without_recommendations_kwh": 1530 },
    { "year": 2037, "predicted_energy_kwh": 890,  "ideal_energy_kwh": 640,  "without_recommendations_kwh": 1550 },
    { "year": 2038, "predicted_energy_kwh": 870,  "ideal_energy_kwh": 620,  "without_recommendations_kwh": 1520 },
    { "year": 2039, "predicted_energy_kwh": 900,  "ideal_energy_kwh": 600,  "without_recommendations_kwh": 1570 },
    { "year": 2040, "predicted_energy_kwh": 850,  "ideal_energy_kwh": 580,  "without_recommendations_kwh": 1600 },
    { "year": 2041, "predicted_energy_kwh": 830,  "ideal_energy_kwh": 560,  "without_recommendations_kwh": 1580 },
    { "year": 2042, "predicted_energy_kwh": 810,  "ideal_energy_kwh": 540,  "without_recommendations_kwh": 1620 },
    { "year": 2043, "predicted_energy_kwh": 790,  "ideal_energy_kwh": 520,  "without_recommendations_kwh": 1650 },
    { "year": 2044, "predicted_energy_kwh": 770,  "ideal_energy_kwh": 500,  "without_recommendations_kwh": 1600 },
    { "year": 2045, "predicted_energy_kwh": 800,  "ideal_energy_kwh": 480,  "without_recommendations_kwh": 1630 },
    { "year": 2046, "predicted_energy_kwh": 750,  "ideal_energy_kwh": 460,  "without_recommendations_kwh": 1680 },
    { "year": 2047, "predicted_energy_kwh": 730,  "ideal_energy_kwh": 440,  "without_recommendations_kwh": 1700 },
    { "year": 2048, "predicted_energy_kwh": 710,  "ideal_energy_kwh": 420,  "without_recommendations_kwh": 1650 },
    { "year": 2049, "predicted_energy_kwh": 690,  "ideal_energy_kwh": 400,  "without_recommendations_kwh": 1720 },
    { "year": 2050, "predicted_energy_kwh": 650,  "ideal_energy_kwh": 380,  "without_recommendations_kwh": 1750 }
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
            { "year": 2024, "predicted_carbon_tons": 0.80, "ideal_carbon_tons": 0.68,  "without_recommendations_carbon_tons": 0.85 },
            { "year": 2025, "predicted_carbon_tons": 0.83, "ideal_carbon_tons": 0.68,  "without_recommendations_carbon_tons": 0.88 },
            { "year": 2026, "predicted_carbon_tons": 0.87, "ideal_carbon_tons": 0.66,  "without_recommendations_carbon_tons": 0.90 },
            { "year": 2027, "predicted_carbon_tons": 0.80, "ideal_carbon_tons": 0.64,  "without_recommendations_carbon_tons": 0.85 },
            { "year": 2028, "predicted_carbon_tons": 0.78, "ideal_carbon_tons": 0.62,  "without_recommendations_carbon_tons": 0.83 },
            { "year": 2029, "predicted_carbon_tons": 0.82, "ideal_carbon_tons": 0.60,  "without_recommendations_carbon_tons": 0.87 },
            { "year": 2030, "predicted_carbon_tons": 0.77, "ideal_carbon_tons": 0.58,  "without_recommendations_carbon_tons": 0.90 },
            { "year": 2031, "predicted_carbon_tons": 0.75, "ideal_carbon_tons": 0.56,  "without_recommendations_carbon_tons": 0.88 },
            { "year": 2032, "predicted_carbon_tons": 0.73, "ideal_carbon_tons": 0.54,  "without_recommendations_carbon_tons": 0.91 },
            { "year": 2033, "predicted_carbon_tons": 0.71, "ideal_carbon_tons": 0.52,  "without_recommendations_carbon_tons": 0.89 },
            { "year": 2034, "predicted_carbon_tons": 0.74, "ideal_carbon_tons": 0.50,  "without_recommendations_carbon_tons": 0.92 },
            { "year": 2035, "predicted_carbon_tons": 0.70, "ideal_carbon_tons": 0.48,  "without_recommendations_carbon_tons": 0.90 },
            { "year": 2036, "predicted_carbon_tons": 0.68, "ideal_carbon_tons": 0.46,  "without_recommendations_carbon_tons": 0.93 },
            { "year": 2037, "predicted_carbon_tons": 0.66, "ideal_carbon_tons": 0.44,  "without_recommendations_carbon_tons": 0.95 },
            { "year": 2038, "predicted_carbon_tons": 0.64, "ideal_carbon_tons": 0.42,  "without_recommendations_carbon_tons": 0.94 },
            { "year": 2039, "predicted_carbon_tons": 0.67, "ideal_carbon_tons": 0.40,  "without_recommendations_carbon_tons": 0.96 },
            { "year": 2040, "predicted_carbon_tons": 0.63, "ideal_carbon_tons": 0.38,  "without_recommendations_carbon_tons": 0.98 },
            { "year": 2041, "predicted_carbon_tons": 0.61, "ideal_carbon_tons": 0.36,  "without_recommendations_carbon_tons": 0.97 },
            { "year": 2042, "predicted_carbon_tons": 0.59, "ideal_carbon_tons": 0.34,  "without_recommendations_carbon_tons": 0.99 },
            { "year": 2043, "predicted_carbon_tons": 0.57, "ideal_carbon_tons": 0.32,  "without_recommendations_carbon_tons": 1.00 },
            { "year": 2044, "predicted_carbon_tons": 0.55, "ideal_carbon_tons": 0.30,  "without_recommendations_carbon_tons": 0.98 },
            { "year": 2045, "predicted_carbon_tons": 0.58, "ideal_carbon_tons": 0.28,  "without_recommendations_carbon_tons": 1.02 },
            { "year": 2046, "predicted_carbon_tons": 0.54, "ideal_carbon_tons": 0.26,  "without_recommendations_carbon_tons": 1.05 },
            { "year": 2047, "predicted_carbon_tons": 0.52, "ideal_carbon_tons": 0.24,  "without_recommendations_carbon_tons": 1.07 },
            { "year": 2048, "predicted_carbon_tons": 0.50, "ideal_carbon_tons": 0.22,  "without_recommendations_carbon_tons": 1.04 },
            { "year": 2049, "predicted_carbon_tons": 0.48, "ideal_carbon_tons": 0.21,  "without_recommendations_carbon_tons": 1.10 },
            { "year": 2050, "predicted_carbon_tons": 0.45, "ideal_carbon_tons": 0.20,  "without_recommendations_carbon_tons": 1.12 }
        ]
      };

      const monthlyAnalysis = {
        0: { // January
            title: "January Energy Usage Analysis",
            problem: "High energy consumption due to winter heating demands.",
            conclusion: "January shows significant HVAC usage (30%) due to frigid temperatures requiring substantial heating. Computer usage (25%) reflects increased remote learning during winter breaks, while efficient LED lighting systems help maintain lower lighting percentages (12%) despite shorter daylight hours."
        },
        1: { // February
            title: "February Energy Usage Analysis",
            problem: "Continued high heating requirements in winter month.",
            conclusion: "February maintains high HVAC usage (28%) due to winter temperatures. Computer and lighting demands remain significant due to indoor activities and shorter daylight hours."
        },
        2: { // March
            title: "March Energy Usage Analysis",
            problem: "Transition month with varied energy demands.",
            conclusion: "March shows balanced energy distribution with increased auditorium and gym usage (15%) due to spring sports and events. Laboratory energy usage spikes from science fair activities."
        },
        3: { // April
            title: "April Energy Usage Analysis",
            problem: "Moderate energy usage with changing seasonal demands.",
            conclusion: "April demonstrates more balanced HVAC requirements (29%) with mild temperatures. Computer usage (24%) remains high due to end-of-term activities."
        },
        4: { // May
            title: "May Energy Usage Analysis",
            problem: "Increasing cooling demands as summer approaches.",
            conclusion: "May shows rising HVAC usage (31%) as temperatures increase. Extended daylight hours help moderate lighting needs, while computer usage rises with end-of-year testing."
        },
        5: { // June
            title: "June Energy Usage Analysis",
            problem: "Peak summer cooling requirements.",
            conclusion: "June experiences peak HVAC demands (34%) due to summer heat. Extended library hours for study groups increase lighting usage (20%), while computer usage (28%) rises with digital learning activities."
        },
        6: { // July
            title: "July Energy Usage Analysis",
            problem: "High summer cooling energy consumption.",
            conclusion: "July maintains high HVAC usage (29%) for cooling. Reduced occupancy during summer break helps moderate overall energy consumption in classrooms and common areas."
        },
        7: { // August
            title: "August Energy Usage Analysis",
            problem: "Continued summer cooling needs with preparation for new term.",
            conclusion: "August shows significant HVAC usage (25%) for cooling, with increased activity in preparation for the new academic year."
        },
        8: { // September
            title: "September Energy Usage Analysis",
            problem: "Balanced energy needs with full school activities.",
            conclusion: "September shows diverse energy usage patterns with increased gym activities (31.43%) and significant cafeteria operations (25.71%) as full school schedule resumes."
        },
        9: { // October
            title: "October Energy Usage Analysis",
            problem: "Transitional energy requirements with varied activities.",
            conclusion: "October demonstrates high laboratory usage (50%) due to intensive academic activities. HVAC requirements (30%) remain significant with changing temperatures."
        },
        10: { // November
            title: "November Energy Usage Analysis",
            problem: "Increasing heating requirements as winter approaches.",
            conclusion: "November shows rising HVAC demands (28%) with colder temperatures. Classroom energy usage increases with more indoor activities."
        },
        11: { // December
            title: "December Energy Usage Analysis",
            problem: "Peak winter heating demands with holiday activities.",
            conclusion: "December experiences highest HVAC usage (35%) due to winter temperatures. Increased lighting (22%) and appliance usage (6%) reflect holiday event preparations."
        }
    };

const monthlyAnalysisCarbon = {
    0: { // January
        title: "January Carbon Footprint Analysis",
        problem: "High carbon emissions due to increased transportation and food-related activities during winter.",
        conclusion: "January exhibits elevated carbon emissions primarily from transportation and food sectors. Implementing sustainable transportation options and enhancing food sustainability can significantly reduce the school's carbon footprint."
    },
    1: { // February
        title: "February Carbon Footprint Analysis",
        problem: "Consistent high emissions from transportation and waste generation during winter months.",
        conclusion: "February maintains high carbon emissions due to sustained transportation needs and increased waste from indoor activities. Introducing carpooling programs and comprehensive recycling can mitigate these emissions."
    },
    2: { // March
        title: "March Carbon Footprint Analysis",
        problem: "Fluctuating emissions with transitional weather affecting transportation and food consumption patterns.",
        conclusion: "March shows variable carbon emissions as weather transitions impact transportation choices and food consumption. Promoting biking and reducing food waste are effective strategies for this period."
    },
    3: { // April
        title: "April Carbon Footprint Analysis",
        problem: "Decreasing emissions with the onset of spring but increased waste from school events.",
        conclusion: "April experiences a reduction in carbon emissions due to milder weather but sees a rise in waste from spring events. Sustainable event planning and enhanced recycling are crucial for maintaining low emissions."
    },
    4: { // May
        title: "May Carbon Footprint Analysis",
        problem: "Rising emissions as transportation needs increase with outdoor activities and end-of-year events.",
        conclusion: "May sees an uptick in carbon emissions driven by increased transportation for outdoor activities and events. Encouraging the use of public transportation and reducing single-use plastics can help control these emissions."
    },
    5: { // June
        title: "June Carbon Footprint Analysis",
        problem: "Peak emissions from summer transportation and increased waste from summer programs.",
        conclusion: "June records peak carbon emissions due to extensive transportation for summer programs and higher waste generation. Implementing carbon-neutral travel initiatives and effective waste management practices are essential."
    },
    6: { // July
        title: "July Carbon Footprint Analysis",
        problem: "Sustained high emissions during summer break due to ongoing transportation and limited oversight of waste.",
        conclusion: "July maintains elevated carbon emissions with reduced oversight during summer break. Continuing sustainable transportation programs and monitoring waste disposal can mitigate these emissions."
    },
    7: { // August
        title: "August Carbon Footprint Analysis",
        problem: "Variable emissions with preparation for the new academic year affecting transportation and food sourcing.",
        conclusion: "August shows fluctuating carbon emissions as the school prepares for the new term. Promoting eco-friendly preparation practices and sourcing local food can effectively reduce the carbon footprint."
    },
    8: { // September
        title: "September Carbon Footprint Analysis",
        problem: "Increased emissions from full school activities resuming and higher transportation usage.",
        conclusion: "September experiences a rise in carbon emissions with the return of full school schedules and increased transportation. Implementing virtual learning options and enhancing recycling programs are key strategies for reduction."
    },
    9: { // October
        title: "October Carbon Footprint Analysis",
        problem: "High emissions due to intensive transportation for events and increased food-related activities.",
        conclusion: "October records high carbon emissions from intensive transportation for events and increased food-related activities. Sustainable event planning and promoting plant-based meals can significantly lower emissions."
    },
    10: { // November
        title: "November Carbon Footprint Analysis",
        problem: "Rising emissions with approaching winter affecting transportation and food waste.",
        conclusion: "November sees an upward trend in carbon emissions as winter approaches, impacting transportation and increasing food waste. Encouraging sustainable transportation and implementing waste reduction programs are vital."
    },
    11: { // December
        title: "December Carbon Footprint Analysis",
        problem: "Peak emissions from holiday-related transportation and increased waste from celebrations.",
        conclusion: "December experiences the highest carbon emissions due to holiday transportation and increased waste from celebrations. Implementing carbon-neutral holiday practices and effective waste management are essential for emission control."
    }
};
  

    const monthlyRecommendations = {
      0: { // January
          recommendations: [
              {
                  title: "Optimize HVAC Settings",
                  actions: [
                      "Smart Thermostat Implementation: Install smart thermostats in all classrooms and common areas to automatically adjust temperatures based on occupancy and time of day.",
                      "Temperature Scheduling: Set lower heating temperatures during non-school hours and weekends to reduce unnecessary HVAC usage.",
                      "Regular Maintenance: Schedule HVAC maintenance checks to ensure systems are running efficiently, preventing energy wastage due to malfunctioning equipment."
                  ]
              },
              {
                  title: "Enhance Remote Learning Efficiency",
                  actions: [
                      "Power Management Software: Deploy software that automatically puts computers into sleep mode after periods of inactivity.",
                      "Device Audits: Conduct monthly audits to identify and deactivate unused devices, minimizing idle energy consumption."
                  ]
              },
              {
                  title: "Leverage Natural Light",
                  actions: [
                      "Window Management: Encourage teachers to utilize natural light by keeping blinds open during daylight hours and minimizing the use of artificial lighting.",
                      "Daylight Sensors: Install daylight sensors in classrooms to automatically dim or turn off lights when sufficient natural light is available."
                  ]
              },
              {
                  title: "Student and Staff Awareness Campaign",
                  actions: [
                      "Energy Conservation Workshops: Organize workshops to educate students and staff on best practices for energy conservation during winter.",
                      "Energy Champions Program: Designate student and staff energy champions to monitor and promote energy-saving behaviors within their respective areas."
                  ]
              }
          ]
      },
      1: { // February
          recommendations: [
              {
                  title: "Advanced HVAC Control",
                  actions: [
                      "Zone Heating: Implement zone heating in areas with fluctuating occupancy to ensure energy is not wasted heating unoccupied spaces.",
                      "Insulation Upgrades: Enhance insulation in classrooms and common areas to retain heat and reduce HVAC demand."
                  ]
              },
              {
                  title: "Efficient Computer Usage",
                  actions: [
                      "Power Down Protocols: Establish protocols for powering down computers at the end of each school day.",
                      "Energy-Efficient Hardware: Transition to energy-efficient computers and peripherals to lower overall energy consumption."
                  ]
              },
              {
                  title: "Lighting Optimization",
                  actions: [
                      "Motion-Activated Lighting: Install motion sensors in less frequently used areas such as storage rooms and corridors to automatically turn off lights when not in use.",
                      "LED Retrofit: Retrofit older lighting fixtures with LED bulbs to maintain low lighting energy percentages."
                  ]
              },
              {
                  title: "Winter Event Planning",
                  actions: [
                      "Energy-Efficient Event Setup: Plan winter events with energy efficiency in mind, such as using energy-saving decorations and minimizing the use of high-energy equipment.",
                      "Centralized Heating for Events: Utilize centralized heating systems for large gatherings to ensure efficient temperature control without overusing HVAC systems."
                  ]
              }
          ]
      },
      2: { // March
          recommendations: [
              {
                  title: "Event-Based Energy Management",
                  actions: [
                      "Pre-Event Energy Audits: Conduct energy audits before major events to identify and implement energy-saving measures.",
                      "Event Scheduling: Schedule energy-intensive events during times when energy demand is lower, balancing overall usage."
                  ]
              },
              {
                  title: "Laboratory Energy Efficiency",
                  actions: [
                      "Efficient Equipment Use: Encourage the use of energy-efficient laboratory equipment and ensure all devices are turned off when not in use.",
                      "Scheduled Shutdowns: Implement scheduled shutdowns of laboratory HVAC and lighting systems during non-operational hours."
                  ]
              },
              {
                  title: "Gym and Auditorium Optimization",
                  actions: [
                      "Energy-Efficient Equipment: Upgrade gym equipment to energy-efficient models that consume less power.",
                      "Lighting Control Systems: Install programmable lighting control systems in auditoriums to adjust lighting levels based on activity and time of day."
                  ]
              },
              {
                  title: "Spring Sports Energy Conservation",
                  actions: [
                      "Flexible HVAC Settings: Adjust HVAC settings in the gym based on the season and actual usage during sports activities.",
                      "Energy-Efficient Practices: Promote energy-efficient practices among coaches and sports staff, such as turning off equipment immediately after use."
                  ]
              }
          ]
      },
      3: { // April
          recommendations: [
              {
                  title: "Seasonal HVAC Adjustment",
                  actions: [
                      "Gradual Temperature Shifts: Gradually adjust HVAC settings as temperatures begin to moderate, preventing sudden spikes in energy usage.",
                      "Energy Recovery Systems: Install energy recovery ventilators (ERVs) to reclaim energy from exhaust air, improving HVAC efficiency."
                  ]
              },
              {
                  title: "End-of-Term Activity Management",
                  actions: [
                      "Computer Lab Scheduling: Optimize computer lab schedules to ensure maximum usage efficiency, reducing idle time and energy wastage.",
                      "Device Recycling Programs: Implement device recycling programs to ensure old or inefficient computers are replaced with energy-efficient models."
                  ]
              },
              {
                  title: "Lighting Optimization",
                  actions: [
                      "Daylight Harvesting: Utilize daylight harvesting techniques to maximize natural light usage in classrooms and minimize artificial lighting needs.",
                      "LED Maintenance: Regularly maintain LED lighting systems to ensure they operate at optimal efficiency."
                  ]
              },
              {
                  title: "Energy-Saving Competitions",
                  actions: [
                      "Classroom Energy Challenges: Organize competitions among classrooms to reduce energy usage, incentivizing students and teachers to adopt energy-saving practices.",
                      "Reward Systems: Provide rewards such as certificates or eco-friendly prizes for the most energy-efficient classrooms."
                  ]
              }
          ]
      },
      4: { // May
          recommendations: [
              {
                  title: "Proactive Cooling Measures",
                  actions: [
                      "Dynamic HVAC Controls: Utilize dynamic HVAC controls that adjust cooling based on real-time temperature data and occupancy levels.",
                      "Energy-Efficient Cooling Systems: Invest in high-efficiency cooling systems and regularly maintain existing HVAC units to ensure peak performance."
                  ]
              },
              {
                  title: "Library Energy Optimization",
                  actions: [
                      "Smart Lighting Systems: Implement smart lighting systems in the library that adjust brightness based on natural light availability and occupancy.",
                      "Ventilation Efficiency: Enhance library ventilation systems to maintain air quality without overusing HVAC cooling."
                  ]
              },
              {
                  title: "Digital Learning Efficiency",
                  actions: [
                      "Virtual Classrooms: Promote virtual classrooms and online resources to reduce the number of physical devices in use, thereby lowering energy consumption.",
                      "Energy-Efficient Devices: Ensure all computers and digital learning tools are energy-efficient models and are properly maintained."
                  ]
              },
              {
                  title: "Study Group Scheduling",
                  actions: [
                      "Staggered Study Groups: Schedule study groups at different times to distribute energy usage more evenly throughout the day.",
                      "Resource Allocation: Allocate study resources efficiently to prevent overuse of lighting and HVAC systems during peak study times."
                  ]
              }
          ]
      },
      5: { // June
          recommendations: [
              {
                  title: "Peak HVAC Management",
                  actions: [
                      "Dynamic HVAC Controls: Utilize dynamic HVAC controls that adjust cooling based on real-time temperature data and occupancy levels.",
                      "Energy-Efficient Cooling Systems: Invest in high-efficiency cooling systems and regularly maintain existing HVAC units to ensure peak performance."
                  ]
              },
              {
                  title: "Library Energy Optimization",
                  actions: [
                      "Smart Lighting Systems: Implement smart lighting systems in the library that adjust brightness based on natural light availability and occupancy.",
                      "Ventilation Efficiency: Enhance library ventilation systems to maintain air quality without overusing HVAC cooling."
                  ]
              },
              {
                  title: "Digital Learning Efficiency",
                  actions: [
                      "Virtual Classrooms: Promote virtual classrooms and online resources to reduce the number of physical devices in use, thereby lowering energy consumption.",
                      "Energy-Efficient Devices: Ensure all computers and digital learning tools are energy-efficient models and are properly maintained."
                  ]
              },
              {
                  title: "Study Group Scheduling",
                  actions: [
                      "Staggered Study Groups: Schedule study groups at different times to distribute energy usage more evenly throughout the day.",
                      "Resource Allocation: Allocate study resources efficiently to prevent overuse of lighting and HVAC systems during peak study times."
                  ]
              }
          ]
      },
      6: { // July
          recommendations: [
              {
                  title: "Summer Break Energy Conservation",
                  actions: [
                      "Reduced HVAC Operation: Lower HVAC settings during summer break when occupancy is minimal, ensuring only essential areas remain cooled.",
                      "Dormant Mode for Classrooms: Implement a dormant mode for classrooms, where non-essential systems are turned off or set to energy-saving modes."
                  ]
              },
              {
                  title: "Common Area Cooling Efficiency",
                  actions: [
                      "Shared Cooling Zones: Consolidate cooling in common areas such as libraries and cafeterias where occupancy remains higher during summer.",
                      "Ventilation Adjustments: Adjust ventilation rates in common areas to optimize cooling without overusing HVAC systems."
                  ]
              },
              {
                  title: "Energy-Efficient Summer Programs",
                  actions: [
                      "Eco-Friendly Summer Camps: Design summer programs with energy efficiency in mind, using facilities that are already cooled and minimizing the need for additional cooling.",
                      "Sustainability Workshops: Incorporate sustainability workshops into summer programs to educate participants on energy conservation practices."
                  ]
              },
              {
                  title: "Regular Energy Audits",
                  actions: [
                      "Summer Energy Audits: Conduct energy audits during summer break to identify and address any inefficiencies in the school’s cooling systems.",
                      "Maintenance Scheduling: Schedule preventive maintenance for HVAC systems during low-occupancy periods to ensure optimal performance when the school reopens."
                  ]
              }
          ]
      },
      7: { // August
          recommendations: [
              {
                  title: "Efficient Pre-Term Cooling",
                  actions: [
                      "Early Cooling Initiatives: Begin pre-cooling facilities before the new term starts to maintain comfortable temperatures without overburdening HVAC systems during peak heat.",
                      "Temperature Gradients: Implement temperature gradients in different zones to balance cooling needs based on usage patterns during preparation."
                  ]
              },
              {
                  title: "Preparation Phase Energy Management",
                  actions: [
                      "Staggered Preparation Schedules: Stagger preparation activities to spread out energy usage and prevent peak demand periods.",
                      "Energy-Efficient Setup Practices: Use energy-efficient practices when setting up classrooms and common areas, such as turning off lights and equipment when not in use."
                  ]
              },
              {
                  title: "HVAC System Upgrades",
                  actions: [
                      "System Assessments: Assess the current HVAC systems for potential upgrades that can enhance cooling efficiency and reduce energy consumption.",
                      "Implement Upgrades: Prioritize and implement upgrades that offer the highest energy savings and performance improvements."
                  ]
              },
              {
                  title: "Staff Training for Energy Efficiency",
                  actions: [
                      "Energy Management Training: Provide training sessions for staff involved in preparation activities to ensure they follow energy-efficient practices.",
                      "Best Practices Documentation: Develop and distribute documentation outlining best practices for energy conservation during the preparation phase."
                  ]
              }
          ]
      },
      8: { // September
          recommendations: [
              {
                  title: "Gym Energy Optimization",
                  actions: [
                      "Energy-Efficient Gym Equipment: Upgrade to energy-efficient gym equipment that reduces power consumption during physical activities.",
                      "Optimal Scheduling: Schedule gym activities during cooler parts of the day to minimize HVAC load and take advantage of natural cooling."
                  ]
              },
              {
                  title: "Cafeteria Energy Management",
                  actions: [
                      "Refrigeration Efficiency: Install energy-efficient refrigeration units and ensure regular maintenance to maintain optimal performance.",
                      "Appliance Upgrades: Replace older kitchen appliances with energy-efficient models to lower overall energy consumption in the cafeteria."
                  ]
              },
              {
                  title: "Full School Schedule Efficiency",
                  actions: [
                      "Smart Scheduling: Use energy management software to align school schedules with energy usage patterns, reducing peak demand.",
                      "Automated Systems: Implement automated lighting and HVAC systems that adjust based on class schedules and occupancy."
                  ]
              },
              {
                  title: "Enhanced Monitoring and Feedback",
                  actions: [
                      "Real-Time Energy Monitoring: Utilize real-time energy monitoring tools to track gym and cafeteria usage, identifying areas for improvement.",
                      "Feedback Loops: Establish feedback loops with gym and cafeteria staff to continuously identify and implement energy-saving measures."
                  ]
              }
          ]
      },
      9: { // October
          recommendations: [
              {
                  title: "Laboratory Energy Efficiency",
                  actions: [
                      "Energy-Efficient Lab Equipment: Invest in energy-efficient laboratory equipment to reduce power consumption during intensive academic activities.",
                      "Scheduled Equipment Shutdowns: Implement scheduled shutdowns for lab equipment when not in use to minimize unnecessary energy usage."
                  ]
              },
              {
                  title: "HVAC System Optimization",
                  actions: [
                      "Temperature Set Points Adjustment: Adjust temperature set points based on the transitional weather to optimize HVAC performance without overcooling or overheating.",
                      "Ventilation Rate Control: Control ventilation rates in laboratories to ensure adequate air quality while minimizing HVAC energy consumption."
                  ]
              },
              {
                  title: "Intensive Academic Activities Management",
                  actions: [
                      "Energy Planning for Events: Plan intensive academic events with energy conservation in mind, such as utilizing natural light during lab activities.",
                      "Resource Allocation: Allocate resources efficiently to ensure energy is only used where necessary during peak academic periods."
                  ]
              },
              {
                  title: "Sustainability Integration in Academics",
                  actions: [
                      "Green Lab Practices: Promote green lab practices, such as using energy-efficient lighting and equipment, recycling materials, and minimizing waste.",
                      "Student Involvement: Engage students in energy-saving initiatives within laboratories, fostering a culture of sustainability and responsibility."
                  ]
              }
          ]
      },
      10: { // November
          recommendations: [
              {
                  title: "Pre-Winter HVAC Preparation",
                  actions: [
                      "System Inspections: Conduct comprehensive HVAC system inspections to ensure readiness for the upcoming winter months.",
                      "Thermostat Calibration: Calibrate thermostats to maintain optimal heating without excessive energy consumption."
                  ]
              },
              {
                  title: "Classroom Energy Management",
                  actions: [
                      "Energy-Saving Classroom Layouts: Arrange classroom layouts to maximize natural heat retention and minimize heat loss.",
                      "Window Insulation: Apply insulating films or thermal curtains to classroom windows to reduce heat loss and improve HVAC efficiency."
                  ]
              },
              {
                  title: "Indoor Activity Energy Efficiency",
                  actions: [
                      "Multi-Purpose Spaces: Designate multi-purpose spaces for indoor activities to concentrate heating and reduce the need to heat multiple areas.",
                      "Energy-Efficient Activity Scheduling: Schedule indoor activities during times when heating systems are already in use, maximizing energy efficiency."
                  ]
              },
              {
                  title: "Energy-Efficient Heating Solutions",
                  actions: [
                      "Supplementary Heating Systems: Implement supplementary heating solutions, such as space heaters with programmable settings, to reduce reliance on central HVAC systems.",
                      "Heat Recovery Ventilation: Install heat recovery ventilation systems to reclaim heat from exhaust air, enhancing overall heating efficiency."
                  ]
              }
          ]
      },
      11: { // December
          recommendations: [
              {
                  title: "Peak Heating Demand Management",
                  actions: [
                      "Temperature Zoning: Implement temperature zoning to ensure only occupied areas are heated, preventing energy waste in unused spaces.",
                      "Energy-Efficient Heating Upgrades: Upgrade to high-efficiency heating systems to manage peak demands more effectively."
                  ]
              },
              {
                  title: "Holiday Lighting Efficiency",
                  actions: [
                      "LED Holiday Lights: Use LED holiday lights, which consume significantly less energy than traditional incandescent bulbs.",
                      "Automated Lighting Timers: Install timers to ensure holiday lights are only on during designated hours, preventing unnecessary energy usage."
                  ]
              },
              {
                  title: "Appliance Usage Optimization",
                  actions: [
                      "Energy-Efficient Appliances: Encourage the use of energy-efficient appliances during holiday event preparations and upgrade older appliances where feasible.",
                      "Appliance Maintenance: Perform regular maintenance on cafeteria and kitchen appliances to ensure they operate efficiently during peak usage periods."
                  ]
              },
              {
                  title: "Holiday Event Energy Planning",
                  actions: [
                      "Energy-Efficient Event Design: Design holiday events with energy conservation in mind, such as using natural lighting and minimizing the use of high-energy decorations.",
                      "Event Scheduling Coordination: Coordinate event schedules to align with optimal HVAC and lighting usage, reducing peak energy loads."
                  ]
              },
              {
                  title: "Post-Holiday Energy Recovery",
                  actions: [
                      "Energy Recovery Post-Events: Implement energy recovery techniques post-holiday events to reclaim and reuse excess energy generated during high-usage periods.",
                      "Feedback and Improvement: Collect feedback from staff and students on energy usage during holiday events to identify areas for improvement and implement best practices for future events."
                  ]
              }
          ]
      }
  };
  const monthlyRecommendationsCarbon = {
    0: { // January
        recommendations: [
            {
                title: "Promote Sustainable Transportation",
                actions: [
                    "Encourage carpooling among staff and students to reduce the number of vehicles commuting to school.",
                    "Implement a bike-to-school program by providing secure bike racks and organizing bike safety workshops."
                ]
            },
            {
                title: "Enhance Food Sustainability",
                actions: [
                    "Introduce more plant-based meal options in the cafeteria to lower carbon emissions from meat production.",
                    "Partner with local farms to source fresh, locally-produced food, reducing transportation-related emissions."
                ]
            },
            {
                title: "Implement Comprehensive Recycling Programs",
                actions: [
                    "Set up clearly labeled recycling bins in all classrooms and common areas to increase recycling rates.",
                    "Conduct monthly waste audits to identify areas for improvement and reduce overall waste generation."
                ]
            }
        ]
    },
    1: { // February
        recommendations: [
            {
                title: "Reduce Transportation Emissions",
                actions: [
                    "Organize virtual parent-teacher meetings to minimize travel-related emissions.",
                    "Provide incentives for using public transportation, such as subsidized bus passes for students."
                ]
            },
            {
                title: "Minimize Food Waste",
                actions: [
                    "Implement a 'Trayless Lunch' system to encourage students to take only what they can consume.",
                    "Start a composting program for cafeteria waste to reduce methane emissions from landfills."
                ]
            },
            {
                title: "Sustainable Procurement",
                actions: [
                    "Purchase eco-friendly school supplies, such as recycled paper and non-toxic cleaning products.",
                    "Reduce single-use plastics by eliminating plastic cutlery and encouraging reusable containers."
                ]
            }
        ]
    },
    2: { // March
        recommendations: [
            {
                title: "Eco-Friendly School Events",
                actions: [
                    "Host virtual events or limit the number of in-person participants to reduce transportation emissions.",
                    "Use digital invitations and materials instead of printed ones to decrease paper waste."
                ]
            },
            {
                title: "Encourage Walking Programs",
                actions: [
                    "Start a 'Walking School Bus' where groups of students walk together to school, supervised by adults.",
                    "Organize monthly walk-to-school days to promote walking as a sustainable transportation option."
                ]
            },
            {
                title: "Enhance Indoor Air Quality",
                actions: [
                    "Use indoor plants to improve air quality and absorb carbon dioxide within school buildings.",
                    "Ensure proper ventilation in all classrooms to maintain a healthy environment."
                ]
            }
        ]
    },
    3: { // April
        recommendations: [
            {
                title: "Implement Energy-Efficient Practices in Transportation",
                actions: [
                    "Transition school buses to electric or hybrid models to reduce diesel emissions.",
                    "Regularly maintain transportation vehicles to ensure they run efficiently and emit fewer pollutants."
                ]
            },
            {
                title: "Sustainable Gardening Programs",
                actions: [
                    "Establish a school garden to grow vegetables and educate students about sustainable agriculture.",
                    "Use compost from cafeteria waste to enrich garden soil, closing the loop on organic waste."
                ]
            },
            {
                title: "Reduce Digital Carbon Footprint",
                actions: [
                    "Optimize digital platforms to be energy-efficient, such as reducing server loads and using green hosting services.",
                    "Educate students and staff on responsible digital usage to minimize unnecessary data storage and transmission."
                ]
            }
        ]
    },
    4: { // May
        recommendations: [
            {
                title: "Promote Renewable Energy Use",
                actions: [
                    "Install solar panels on school buildings to generate clean energy and reduce reliance on fossil fuels.",
                    "Educate the school community about the benefits of renewable energy and how to support its adoption."
                ]
            },
            {
                title: "Enhance Waste Reduction Strategies",
                actions: [
                    "Introduce reusable water bottles and provide refill stations to decrease single-use plastic waste.",
                    "Organize monthly clean-up drives in and around the school to promote a culture of cleanliness and responsibility."
                ]
            },
            {
                title: "Foster Sustainable Transportation Choices",
                actions: [
                    "Provide secure storage for bicycles to encourage biking to school.",
                    "Offer training sessions on eco-friendly driving practices for staff who commute by car."
                ]
            }
        ]
    },
    5: { // June
        recommendations: [
            {
                title: "Conduct Carbon Footprint Audits",
                actions: [
                    "Perform annual carbon footprint assessments to identify major sources of emissions and track progress.",
                    "Share audit results with the school community to foster transparency and collective responsibility."
                ]
            },
            {
                title: "Encourage Sustainable Extracurricular Activities",
                actions: [
                    "Promote eco-clubs and sustainability-focused student organizations.",
                    "Incorporate sustainability themes into sports and arts programs to broaden engagement."
                ]
            },
            {
                title: "Optimize School Transportation Routes",
                actions: [
                    "Analyze and redesign school bus routes to minimize mileage and fuel consumption.",
                    "Collaborate with local transportation authorities to implement more efficient public transit options for students."
                ]
            }
        ]
    },
    6: { // July
        recommendations: [
            {
                title: "Plan for Sustainable Summer Breaks",
                actions: [
                    "Encourage staff to participate in local environmental initiatives during summer months.",
                    "Provide guidelines for minimizing energy and resource use while the school is on break."
                ]
            },
            {
                title: "Implement Green Landscaping Practices",
                actions: [
                    "Use native plants in school landscaping to reduce water usage and support local ecosystems.",
                    "Install rain gardens to manage stormwater runoff and decrease flooding risks."
                ]
            },
            {
                title: "Promote Carbon-Neutral Travel for School Trips",
                actions: [
                    "Offset carbon emissions from school trips by investing in carbon offset projects.",
                    "Choose eco-friendly transportation methods, such as buses or trains, over individual car travel."
                ]
            }
        ]
    },
    7: { // August
        recommendations: [
            {
                title: "Sustainable Back-to-School Initiatives",
                actions: [
                    "Encourage the use of digital textbooks and resources to reduce paper usage.",
                    "Organize clothing swaps or donations to minimize textile waste and promote reuse."
                ]
            },
            {
                title: "Implement Eco-Friendly Classroom Practices",
                actions: [
                    "Use reusable materials for classroom activities instead of disposable ones.",
                    "Promote the use of double-sided printing to conserve paper."
                ]
            },
            {
                title: "Enhance Sustainable Transportation Options",
                actions: [
                    "Introduce a school-wide challenge to reduce car usage, rewarding classes that achieve the highest reductions.",
                    "Collaborate with local bike shops to provide discounted bikes or maintenance services for students and staff."
                ]
            }
        ]
    },
    8: { // September
        recommendations: [
            {
                title: "Promote Virtual Learning to Reduce Travel",
                actions: [
                    "Continue offering hybrid learning options to decrease the need for daily commuting.",
                    "Provide necessary resources and support for effective virtual participation."
                ]
            },
            {
                title: "Implement Sustainable Event Planning",
                actions: [
                    "Use digital invitations and materials for school events to minimize paper waste.",
                    "Choose venues and vendors that prioritize sustainability and eco-friendly practices."
                ]
            },
            {
                title: "Enhance Recycling and Composting Programs",
                actions: [
                    "Expand recycling and composting facilities to cover more areas of the school.",
                    "Educate students and staff on proper sorting and disposal of recyclable and compostable materials."
                ]
            }
        ]
    },
    9: { // October
        recommendations: [
            {
                title: "Reduce Transportation-Related Emissions",
                actions: [
                    "Implement a 'Green Bus' initiative by using biodiesel or electric buses for school transportation.",
                    "Encourage walking or biking for short distances to school, supported by safe routes and infrastructure."
                ]
            },
            {
                title: "Sustainable Food Practices",
                actions: [
                    "Introduce a farm-to-table program where students participate in growing and preparing meals.",
                    "Reduce the use of single-use plastics in the cafeteria by switching to biodegradable or reusable containers."
                ]
            },
            {
                title: "Promote Energy-Efficient Behaviors",
                actions: [
                    "Organize awareness campaigns about the importance of turning off lights and electronics when not in use.",
                    "Set up reminder systems or incentives for students and staff to adopt energy-efficient habits."
                ]
            }
        ]
    },
    10: { // November
        recommendations: [
            {
                title: "Encourage Carbon-Neutral Holidays",
                actions: [
                    "Promote virtual holiday events to reduce travel-related emissions.",
                    "Organize tree-planting activities or other carbon-offset initiatives as part of holiday celebrations."
                ]
            },
            {
                title: "Optimize School Operations for Sustainability",
                actions: [
                    "Conduct regular assessments of school operations to identify and implement carbon reduction strategies.",
                    "Encourage the use of sustainable office supplies and materials among administrative staff."
                ]
            },
            {
                title: "Foster a Culture of Sustainability",
                actions: [
                    "Incorporate sustainability topics into the curriculum across all subjects.",
                    "Recognize and reward classes or individuals who demonstrate exceptional commitment to reducing carbon emissions."
                ]
            }
        ]
    },
    11: { // December
        recommendations: [
            {
                title: "Implement Sustainable Holiday Practices",
                actions: [
                    "Use LED lights and energy-efficient decorations for holiday events.",
                    "Encourage the use of reusable or eco-friendly gift wrap materials."
                ]
            },
            {
                title: "Host Carbon Reduction Workshops",
                actions: [
                    "Organize workshops for staff and students on ways to reduce personal and collective carbon footprints.",
                    "Provide training on sustainable practices that can be carried forward into the new year."
                ]
            },
            {
                title: "Evaluate and Plan for Future Sustainability Goals",
                actions: [
                    "Review the year's carbon footprint data to assess the effectiveness of implemented strategies.",
                    "Set new carbon reduction targets and develop action plans for the upcoming year based on insights gained."
                ]
            },
            {
                title: "Promote Virtual Participation for End-of-Year Events",
                actions: [
                    "Offer virtual attendance options for end-of-year meetings and celebrations to minimize travel emissions.",
                    "Provide digital certificates and awards to recognize achievements in sustainability."
                ]
            }
        ]
    }
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
    
      let htmlContent = '';

          // Add the main title section
        htmlContent += `
        <div class="analysis-header pdf-only">
            <h1 class="main-title">${analysisTitle.textContent}</h1>
        </div>
    `;
        
        // Main Chart and Areas of Concern grouped together
      htmlContent += '<div class="main-section">';
    
      // Display Main Chart
      if (analysisData.main_chart) {
          htmlContent += `
              <div class="main-chart-container">
                  <canvas id="mainChart"></canvas>
              </div>
          `;
      }

      // Modify the Areas of Concern section
      if (chartType === 'energy') {
        htmlContent += `
            <div class="areas-text-container">
                <div class="area-of-concern" id="monthlyAnalysisText">
                    <h3>${monthlyAnalysis[selectedMonth].title}</h3>
                    <p>${monthlyAnalysis[selectedMonth].problem}</p>
                    <p>${monthlyAnalysis[selectedMonth].conclusion}</p>
                </div>
            </div>
        `;
      } else if (chartType === 'carbon') {
        // Use monthlyAnalysisCarbon for carbon footprint analysis
        htmlContent += `
            <div class="areas-text-container">
                <div class="area-of-concern" id="monthlyAnalysisText">
                    <h3>${monthlyAnalysisCarbon[selectedMonth].title}</h3>
                    <p>${monthlyAnalysisCarbon[selectedMonth].problem}</p>
                    <p>${monthlyAnalysisCarbon[selectedMonth].conclusion}</p>
                </div>
            </div>
        `;
    } else {
        // Fallback for other chart types
        if (analysisData.areas_of_concern && analysisData.areas_of_concern.length > 0) {
            htmlContent += `
                <div class="areas-text-container">
                    ${analysisData.areas_of_concern.map(area => `
                        <div class="area-of-concern">
                            <h3>${area.title}</h3>
                            <p>${area.problem}</p>
                            <p>${area.conclusion}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
      htmlContent += '</div>'; // Close main-section
  
    // Areas of Concern Charts and Recommendations
    if (analysisData.areas_of_concern && analysisData.areas_of_concern.length > 0) {
      htmlContent += `
          <div class="chart-section-container">
              ${analysisData.areas_of_concern.map((area, index) => `
                  <div class="chart-section">
                      <canvas id="areaChart${index}"></canvas>
                  </div>
              `).join('')}
          </div>
      `;
  }
  
       // Display Personalized Recommendations
       if (chartType === 'energy') {
        const recommendations = monthlyRecommendations[selectedMonth].recommendations;
        htmlContent += `
            <div class="recommendations-section">
                <h2>Personalized Recommendations</h2>
                ${recommendations.map(rec => `
                    <div class="recommendation-category">
                        <h3>${rec.title}</h3>
                        <ul>
                            ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        if (analysisData.personalized_recommendations && analysisData.personalized_recommendations.length > 0) {
            htmlContent += `
                <div class="recommendations-section">
                    <h2>Personalized Recommendations</h2>
                    <ul>
                        ${analysisData.personalized_recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }

      // Display Strengths in their own section
      if (analysisData.strengths && analysisData.strengths.length > 0) {
          htmlContent += '<div class="strengths-section">';
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
          htmlContent += '</div>';
      }
  
      // Display Predictions in their own section
      if (analysisData.predictions && analysisData.predictions.length > 0) {
        htmlContent += `
            <div class="predictions-section">
            <h2>This is the predicted ${chartType === 'energy' ? 'energy usage' : 'carbon emissions'} forecast if recommendations are implemented.</h2>
            <canvas id="predictionChartWithRec"></canvas>
            <p>As seen from the graph, the recommendations will help reduce the ${chartType === 'energy' ? 'energy usage' : 'carbon emissions'} over the years.</p>
        </div>
        <div class="predictions-section">
            <h2>This is the predicted ${chartType === 'energy' ? 'energy usage' : 'carbon emissions'} forecast if recommendations are not implemented.</h2>
            <canvas id="predictionChartWithoutRec"></canvas>
            <p>As seen from the graph, if recommendations are not implemented, ${chartType === 'energy' ? 'energy usage' : 'carbon emissions'} will increase over the years.</p>
        </div>
        `;
    }

  
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

        // Render Prediction Charts
        if (analysisData.predictions) {
          renderPredictionChart('predictionChartWithRec', analysisData.predictions, true); // With Recommendations
          renderPredictionChart('predictionChartWithoutRec', analysisData.predictions, false); // Without Recommendations
        }


        analysisOutput.classList.remove('hidden');
        downloadPdfBtn.classList.remove('hidden'); // Show the download button
    }
    
    function downloadAnalysisAsPDF() {
      const analysisContent = document.getElementById('analysisContainer');
      
      // Add PDF export class
      analysisContent.classList.add('pdf-export');
      
      // Resize charts before PDF generation
      const charts = document.querySelectorAll('canvas');
      charts.forEach(chart => {
          chart.style.height = '500px';
          chart.style.width = '100%';
      });
  
      // Define PDF options
      const opt = {
          margin: [0.25, 0.25, 0.25, 0.25],
          filename: 'Analysis.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
              scale: 2,
              letterRendering: true,
              useCORS: true,
              scrollY: -window.scrollY
          },
          jsPDF: { 
              unit: 'in', 
              format: 'letter', 
              orientation: 'portrait'
          },
          pagebreak: { 
              mode: ['avoid-all', 'css', 'legacy'],
              before: '.chart-section-container, .predictions-section'
          }
      };
  
      // Generate and save the PDF
      html2pdf().set(opt).from(analysisContent).save()
          .then(() => {
              // Remove PDF export class and reset chart sizes
              analysisContent.classList.remove('pdf-export');
              charts.forEach(chart => {
                  chart.style.height = '500px';
                  chart.style.width = '100%';
              });
          });
  }

  function renderMainChart(canvasId, data) {
    console.log('Rendering chart with data:', data);

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element with id "${canvasId}" not found.`);
        return;
    }
    const ctx = canvas.getContext('2d');

    // Convert full date labels to month abbreviations
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels = data.labels.map(label => {
        // If the label is already a month name, find its index
        const monthIndex = monthNames.findIndex(month => label.startsWith(month));
        if (monthIndex !== -1) {
            return monthNames[monthIndex];
        }
        // Otherwise, try to parse it as a date
        const date = new Date(label);
        return monthNames[date.getMonth()];
    });

    // Destroy existing chart instance if it exists
    if (window.mainChartInstance) {
        window.mainChartInstance.destroy();
    }

    if (chartType === 'energy') {
        // Energy Usage Chart (Bar + Line for temperature)
        const datasets = [
            {
                label: 'Energy (kWh)',
                type: 'bar',
                data: data.values,
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
                yAxisID: 'y1',
            }
        ];

        // Add temperature dataset if temperature data exists
        if (data.temperature) {
            datasets.push({
                label: 'Temperature (°C)',
                type: 'line',
                data: data.temperature,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                yAxisID: 'y2',
                tension: 0,
            });
        }

        window.mainChartInstance = new Chart(ctx, {
            type: 'bar',  // Add this line to specify the base chart type
            data: {
                labels: monthLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                onClick: async (event, elements) => {
                  if (elements && elements.length > 0) {
                      const clickedIndex = elements[0].index;
                      
                      // Update selected month
                      selectedMonth = clickedIndex;
                      
                      // Highlight the clicked bar by updating backgroundColor
                      const dataset = window.mainChartInstance.data.datasets[0];
                      dataset.backgroundColor = data.values.map((_, index) => 
                          index === clickedIndex 
                              ? 'rgba(255, 159, 64, 0.8)' // Highlighted bar
                              : 'rgba(255, 159, 64, 0.5)' // Normal bars
                      );
                      window.mainChartInstance.update();
                      // Update the analysis text
                      const analysisText = document.getElementById('monthlyAnalysisText');
                      if (analysisText) {
                          analysisText.innerHTML = `
                              <h3>${monthlyAnalysis[selectedMonth].title}</h3>
                              <p>${monthlyAnalysis[selectedMonth].problem}</p>
                              <p>${monthlyAnalysis[selectedMonth].conclusion}</p>
                          `;
                      }
                              // Update Personalized Recommendations
                      const recommendationsSection = document.querySelector('.recommendations-section');
                      if (recommendationsSection) {
                          const recommendations = monthlyRecommendations[selectedMonth].recommendations;
                          recommendationsSection.innerHTML = `
                              <h2>Personalized Recommendations</h2>
                              ${recommendations.map(rec => `
                                  <div class="recommendation-category">
                                      <h3>${rec.title}</h3>
                                      <ul>
                                          ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                                      </ul>
                                  </div>
                              `).join('')}
                          `;
                      }          
                      // Update area of concern chart
                      const canvas = document.querySelector('[id^="areaChart"]');
                      if (canvas) {
                          await renderAreaChart(canvas.id, data);
                      }
                  }
              },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y + (context.dataset.yAxisID === 'y2' ? ' °C' : ' kWh');
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: Math.max(...data.values) * 1.2,
                        ticks: {
                            callback: function(value) {
                                return value + ' kWh';
                            },
                            font: {
                                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                                size: 11
                            }
                        },
                        title: {
                            display: true,
                            text: 'Energy Usage (kWh)'
                        }
                    },
                    y2: data.temperature ? {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: Math.max(...data.temperature) * 1.2,
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '°C';
                            },
                            font: {
                                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                                size: 11
                            }
                        },
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    } : undefined,
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        },
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        });
    }   else if (chartType === 'carbon') {
       // Carbon Footprint Chart (Bar)
        if (!data.values) {
            console.error('Missing "values" data for carbon chart.');
            return;
        }

        const datasets = [{
            label: 'Carbon Footprint (tonnes)',
            data: data.values,
            backgroundColor: 'rgba(91, 199, 160, 0.6)', // Slightly more opaque for bars
            borderColor: '#5bc7a0',
            borderWidth: 1,
            barThickness: 'flex', // Automatically adjust bar width
            maxBarThickness: 50, // Maximum width of bars
        }];


        window.mainChartInstance = new Chart(ctx, {
            type: 'bar',  // Add this line to specify the chart type
            data: {
                labels: monthLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                onClick: async (event, elements) => {
                    if (elements && elements.length > 0) {
                        const clickedIndex = elements[0].index;
                        
                        // Update selected month
                        selectedMonth = clickedIndex;
                        
                        // Highlight the clicked bar by updating backgroundColor
                        const dataset = window.mainChartInstance.data.datasets[0];
                        dataset.backgroundColor = data.values.map((_, index) => 
                            index === clickedIndex 
                                ? '#5bc7a0' // Highlighted bar
                                : 'rgba(91, 199, 160, 0.6)' // Normal bars
                        );
                        window.mainChartInstance.update();
    
                        // Update the analysis text
                        const analysisText = document.getElementById('monthlyAnalysisText');
                        if (analysisText) {
                            analysisText.innerHTML = `
                                <h3>${monthlyAnalysisCarbon[selectedMonth].title}</h3>
                                <p>${monthlyAnalysisCarbon[selectedMonth].problem}</p>
                                <p>${monthlyAnalysisCarbon[selectedMonth].conclusion}</p>
                            `;
                        }
    
                        // Update Personalized Recommendations
                        const recommendationsSection = document.querySelector('.recommendations-section');
                        if (recommendationsSection) {
                            const recommendations = monthlyRecommendationsCarbon[selectedMonth].recommendations;
                            recommendationsSection.innerHTML = `
                                <h2>Personalized Recommendations</h2>
                                ${recommendations.map(rec => `
                                    <div class="recommendation-category">
                                        <h3>${rec.title}</h3>
                                        <ul>
                                            ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            `;
                        }          
    
                        // Update area of concern chart
                        const canvas = document.querySelector('[id^="areaChart"]');
                        if (canvas) {
                            await renderAreaChart(canvas.id, data);
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y + ' tonnes';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(...data.values) * 1.2,
                        ticks: {
                            callback: function(value) {
                                return value + ' tonnes';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Carbon Footprint (tonnes)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        });
    } else {
        console.error(`Unsupported chart type: "${chartType}". Expected "energy" or "carbon".`);
    }
}

async function renderAreaChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
      console.error(`Canvas element with id "${canvasId}" not found.`);
      return;
  }
  const ctx = canvas.getContext('2d');

    // Destroy existing chart instance if it exists
    if (window.areaChartInstances[canvasId]) {
        window.areaChartInstances[canvasId].destroy();
        delete window.areaChartInstances[canvasId];
    }


  if (chartType === 'energy') {
    try {
      const fetchedData = await fetchEnergyBreakdownData();
        
      // Filter data by year and selected month
      const filteredData = fetchedData.filter(item => {
          const date = new Date(item.timestamp);
          return date.getFullYear() === year && date.getMonth() === selectedMonth;
      });

      // Aggregate data by category
      const aggregated = {};
      filteredData.forEach(item => {
          if (!aggregated[item.category]) {
              aggregated[item.category] = 0;
          }
          aggregated[item.category] += parseFloat(item.percentage);
      });
      
      const chartData = {
          Label: Object.keys(aggregated),
          Percentage: Object.values(aggregated)
      };

      // Update or create the title
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
      
      // Look for existing title or create new one
      let title = canvas.previousElementSibling;
      if (!title || !title.classList.contains('chart-title')) {
          title = document.createElement('h4');
          title.classList.add('chart-title');
          canvas.parentNode.insertBefore(title, canvas);
      }
      title.textContent = `Energy Breakdown for ${monthNames[selectedMonth]} ${year}`;

        // Create pie chart
        window.areaChartInstances[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartData.Label,
                datasets: [{
                    data: chartData.Percentage,
                    backgroundColor: chartData.Label.map(category => colorMapping[category] || '#c5c6c7'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                        }
                    },
                    datalabels: {  // Add this plugin for showing percentages on the chart
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 12
                        },
                        formatter: (value, ctx) => {
                            const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = (value * 100 / sum).toFixed(1) + '%';
                            return percentage;
                        },
                        anchor: 'center',
                        align: 'center',
                        offset: 0
                    }
                }
            },
            plugins: [ChartDataLabels]  // Enable the datalabels plugin
        });

        title.style.textAlign = 'center';
        canvas.parentNode.insertBefore(title, canvas);

    } catch (error) {
        console.error('Error creating energy breakdown pie chart:', error);
    }
} else if (chartType === 'carbon') {
    try {
        // Create title
        let title = canvas.previousElementSibling;
        if (!title || !title.classList.contains('chart-title')) {
            title = document.createElement('h4');
            title.classList.add('chart-title');
            canvas.parentNode.insertBefore(title, canvas);
        }
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        title.textContent = `Daily Carbon Emissions for ${monthNames[selectedMonth]} ${year}`;

        // Generate daily data for the selected month
        const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
        const dailyLabels = Array.from({length: daysInMonth}, (_, i) => i + 1);
        
        // Generate daily values with some variation
        const baseValue = data.values[selectedMonth];
        const dailyValues = dailyLabels.map(() => {
            // Add random variation of ±15% to the monthly average
            const variation = (Math.random() - 0.5) * 0.3;
            return baseValue * (1 + variation);
        });

        // Create line chart for carbon data
        window.areaChartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dailyLabels,
                datasets: [{
                    label: 'Carbon Emissions (tonnes)',
                    data: dailyValues,
                    borderColor: '#5bc7a0',
                    backgroundColor: 'rgba(91, 199, 160, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#5bc7a0',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#5bc7a0'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Carbon: ${context.parsed.y.toFixed(3)} tonnes`;
                            },
                            title: function(context) {
                                return `${monthNames[selectedMonth]} ${context[0].label}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Day of Month'
                        },
                        ticks: {
                            callback: function(value) {
                                // Only show labels for every 5th day and the last day
                                return value % 5 === 0 || value === dailyLabels.length ? value : '';
                            },
                            maxRotation: 0, // Keep labels horizontal
                            autoSkip: false // Don't automatically skip labels
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Carbon Emissions (tonnes)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(3) + ' tonnes';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        title.style.textAlign = 'center';
    } catch (error) {
        console.error('Error creating carbon breakdown line chart:', error);
    }
  }
}


// Helper functions from dashboard.js
function filterDataByYear(fetchedData, selectedYear) {
  return fetchedData.filter(item => new Date(item.timestamp).getFullYear() === selectedYear);
}

function filterDataByLocation(fetchedData, selectedLocation) {
  if (selectedLocation === "all_locations") {
      return fetchedData;
  }
  return fetchedData.filter(item => item.school_id === selectedLocation);
}

function aggregateData(filteredData) {
  const aggregated = {};
  
  filteredData.forEach(item => {
      if (!aggregated[item.category]) {
          aggregated[item.category] = item.percentage;
      }
  });

  return {
      Label: Object.keys(aggregated),
      Percentage: Object.values(aggregated)
  };
}
// Fallback function for static data
function renderStaticEnergyPieChart(ctx, data) {
  currentAreaChart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: data.data.labels,
          datasets: [{
              data: data.data.values,
              backgroundColor: data.data.labels.map(label => colorMapping[label] || '#c5c6c7'),
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.5,
          plugins: {
              legend: {
                  position: 'right',
                  labels: {
                      font: {
                          size: 12
                      }
                  }
              },
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} kWh (${percentage}%)`;
                      }
                  }
              }
          }
      }
  });
}

function renderStrengthChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
      console.error(`Canvas element with id ${canvasId} not found.`);
      return;
  }
  const ctx = canvas.getContext('2d');

    // Define month names array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Process labels based on chart type
    const chartLabels = chartType === 'carbon' 
        ? data.labels.map(label => {
            const date = new Date(label);
            return monthNames[date.getMonth()];
          })
        : data.labels; // Keep original labels for energy chart

 new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: chartType === 'energy' ? 'Energy Usage (kWh)' : 'Carbon Emissions (tonnes)',
                data: data.values,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += chartType === 'energy' 
                                    ? `${context.parsed.y} kWh`
                                    : `${context.parsed.y.toFixed(3)} tonnes`;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    },
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return chartType === 'energy'
                                ? `${value} kWh`
                                : `${value.toFixed(3)} tonnes`;
                        }
                    },
                    title: {
                        display: true,
                        text: chartType === 'energy' ? 'Energy Usage (kWh)' : 'Carbon Emissions (tonnes)'
                    }
                }
            }
        }
    });
}

function renderPredictionChart(canvasId, predictions, withRecommendations = true) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
      console.error(`Canvas element with id ${canvasId} not found.`);
      return;
  }
  const ctx = canvas.getContext('2d');

  const labels = predictions.map(p => `${p.year}`);
    let actualData, idealData;

    if (withRecommendations) {
        actualData = predictions.map(p => chartType === 'energy' ? p.predicted_energy_kwh : p.predicted_carbon_tons);
    } else {
        actualData = predictions.map(p => chartType === 'energy' 
            ? p.without_recommendations_kwh 
            : p.without_recommendations_carbon_tons  // Changed this line
        );
    }
    
    idealData = predictions.map(p => chartType === 'energy' ? p.ideal_energy_kwh : p.ideal_carbon_tons);

    // Determine dataset labels based on scenario
    const actualLabel = withRecommendations 
        ? `Predicted ${chartType === 'energy' ? 'Energy Usage (kWh)' : 'Carbon Emissions (tons)'}`
        : `Predicted (No Recommendations) ${chartType === 'energy' ? 'Energy Usage (kWh)' : 'Carbon Emissions (tons)'}`;
    
    const idealLabel = `Ideal ${chartType === 'energy' ? 'Energy Usage (kWh)' : 'Carbon Emissions (tons)'}`;

  
    new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [
              {
                  label: actualLabel,
                  data: actualData,
                  backgroundColor: withRecommendations ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 99, 132, 0.6)', // Different color for distinction
                  borderColor: withRecommendations ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
                  borderWidth: 2,
                  fill: false,
                  tension: 0, // Straight lines
              },
              {
                  label: idealLabel,
                  data: idealData,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 2,
                  fill: false,
                  borderDash: [5, 5], // Dashed line
                  tension: 0, // Straight lines
              },
          ],
      },
      options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.5,
          plugins: {
              legend: {
                  display: true,
                  position: 'top',
              },
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                              label += ': ';
                          }
                          if (context.parsed.y !== null) {
                              label += context.parsed.y + (chartType === 'energy' ? ' kWh' : ' tons');
                          }
                          return label;
                      }
                  }
              }
          },
          scales: {
              x: { // Replaces 'xAxes' with 'x'
                  title: {
                      display: true,
                      text: 'Year'
                  },
                  ticks: {
                      font: {
                          size: 11
                      }
                  }
              },
              y: { // Replaces 'yAxes' with 'y'
                  beginAtZero: true,
                  title: {
                      display: true,
                      text: chartType === 'energy' ? 'Energy Usage (kWh)' : 'Carbon Emissions (tons)'
                  },
                  ticks: {
                      callback: function(value) {
                          return chartType === 'energy' ? `${value} kWh` : `${value} tons`;
                      },
                      font: {
                          size: 11
                      }
                  }
              }
          }
      }
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

