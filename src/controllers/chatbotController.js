const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ======================================================
// STATIC DATA OBJECTS (provided)
// ======================================================

const staticEnergyData2024 = {
  "main_chart": {
    "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "values": [1300, 1200, 1400, 1100, 1150, 1250, 1500, 1400, 1300, 1200, 1250, 1350],
    "temperature": [22, 21, 23, 20, 19, 25, 28, 27, 24, 22, 21, 23]
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
      "problem": "The carbon footprint for Lincoln High School peaked at 1.0 tonnes in July, September, and December 2024.",
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
      "achievement": "The school's carbon footprint was at its lowest at 0.7 tonnes in February and October 2024.",
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

// ======================================================
// GLOBAL VARIABLES (assistant and thread)
// ======================================================
let assistant;
let thread;

// ======================================================
// Helper: Delete Existing Assistant (if any)
// ======================================================
const deleteExistingAssistant = async () => {
  try {
    const assistants = await openai.beta.assistants.list();
    const existingAssistant = assistants.data.find(a => a.name === "GreenCampus Assistant");
    if (existingAssistant) {
      await openai.beta.assistants.del(existingAssistant.id);
      console.log('Existing assistant deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting existing assistant:', error);
  }
};

// ======================================================
// Helper: Initialize Assistant with Instructions
// ======================================================
const initializeAssistant = async () => {
  try {
    await deleteExistingAssistant();
    // Use a single-quoted string so no unintended interpolation occurs.
    assistant = await openai.beta.assistants.create({
      name: "GreenCampus Assistant",
      instructions: 'You are a helpful assistant for GreenCampus, specializing in environmental and energy data analysis.\n' +
      'Format your responses using markdown with proper headings, bullet points, and numbered lists where appropriate.\n' +
      'Structure the information clearly and use **bold text** for important points.\n\n' +
      'For carbon footprint analysis:\n' +
      '- ALWAYS use the total carbon footprint from context.energyData.carbonFootprint.\n' +
      '- Calculate peak months using context.carbonData.main_chart.values.\n' +
      '- Format numbers as, e.g., "25 tonnes CO₂" (not 25.0 or 25 tons CO₂e).\n' +
      '- Use month names (e.g. July, September, December) for labels.\n' +
      '- Recommendations MUST come from context.carbonData.personalized_recommendations.\n\n' +
      'For energy usage analysis:\n' +
      '- Use the data provided in context.energyData.chartData (which is based on staticEnergyData2024).\n' +
      '- Do not include any net-zero progress information in this response.\n' +
      '- Structure your output similar to the carbon footprint response with sections for:\n' +
      '    • **Current Status** (showing the current energy usage),\n' +
      '    • **Net Energy Usage Trend** (to be represented by a chart),\n' +
      '    • **Analysis and Recommendations** with:\n' +
      '         - **🎯 Key Findings**,\n' +
      '         - **📈 Peak Energy Usage**,\n' +
      '         - **💡 Recommendations**.\n\n' +
      'For net zero queries, provide a combined high-level overview:\n' +
      '- Include current carbon footprint, current energy usage, and net zero progress,\n' +
      '- And details such as "Remaining to Reach Net Zero" and "Next Steps."\n\n' +
      'For data visualization, use special placeholders:\n' +
      '- <chart-placeholder-energy> for energy usage charts,\n' +
      '- <chart-placeholder-carbon> for carbon footprint charts,\n' +
      '- <chart-placeholder-breakdown> for energy breakdown charts.\n\n' +
      'For carbon footprint queries, follow this template exactly:\n\n' +
      '# Carbon Footprint Analysis\n\n' +
      '## Current Status\n' +
      'Our current carbon footprint shows varying levels throughout the year, with notable peaks during specific months.\n\n' +
      '### Net Carbon Footprint Trend\n' +
      '<chart-placeholder-carbon>\n\n' +
      '&nbsp;\n\n' +
      '## Analysis and Recommendations\n\n' +
      '### 🎯 Key Findings\n' +
      'Provide a concise summary of the factors contributing to the current carbon footprint.\n\n' +
      '### 📈 Peak Carbon Months\n' +
      'Highest carbon footprint of {maxValue} tonnes CO₂ was recorded in: {peakMonths}\n\n' +
      '### 💡 Recommendations\n' +
      'List actionable recommendations based on the data provided.\n\n' +
      'For campaign ideas, you MUST EXACTLY follow this template without any deviation:\n\n' +
      '# New Campaign Ideas\n\n' +
      '## Eco-Warriors Initiative\n' +
      'Students will lead weekly environmental audits of their classrooms and create action plans for improvement. The initiative empowers students to take direct responsibility for their environmental impact while developing leadership skills.\n' +
      '**Points:** 4\n\n' +
      '## Green Transportation Challenge\n' +
      'Participants will track and reduce their carbon footprint by choosing eco-friendly transportation methods for their daily commute. Students will use a mobile app to log their green transportation choices and compete for monthly rewards.\n' +
      '**Points:** 3\n\n' +
      '## Zero-Waste Lunch Program\n' +
      'Students will participate in a month-long challenge to create zero-waste lunches using reusable containers and locally sourced foods. The program includes weekly workshops on sustainable food practices and waste reduction strategies.\n' +
      '**Points:** 5\n\n' +
      'CRITICAL RULES:\n' +
      '1. ALWAYS include exactly 3 campaigns.\n' +
      '2. Each campaign MUST have a clear, specific name.\n' +
      '3. Each campaign MUST have points between 3-5.\n' +
      '4. NEVER deviate from the exact format above.\n' +
      '5. NEVER use placeholders like [Campaign Name] – use actual names.\n' +
      '6. Make each campaign unique and different from existing campaigns.\n' +
      '7. Focus on practical, engaging ideas for students.\n' +
      '8. Campaign Description Word Limit is 20 words.',
      model: "gpt-3.5-turbo",
      tools: [{ type: "code_interpreter" }]
    });
  } catch (error) {
    console.error('Error initializing assistant:', error);
    throw error;
  }
};

// ======================================================
// Build Environmental Context using static data
// ======================================================
const buildEnvironmentalContext = async () => {
  try {
    // Use the provided static data directly.
    const energyData = staticEnergyData2024;
    const carbonData = staticCarbonData2024;
    const campaignData = await (async () => {
      return [
        {
          name: "Plant a Green Patch",
          description: "Involve students in planting a small garden or green patch within the school compound to improve air quality and aesthetics.",
          points: 5,
          signups: 0
        },
        {
          name: "Turn Off Classroom Lights",
          description: "Promote energy conservation by ensuring that classroom lights are turned off when not in use.",
          points: 4,
          signups: 1
        },
        {
          name: "Recycle Right",
          description: "Encourage students to sort and recycle waste properly. Aiming to increase recycling rates within the school.",
          points: 3,
          signups: 3
        }
      ];
    })();
    const energyBreakdown = { lighting: "400 kWh", hvac: "700 kWh", equipment: "250 kWh" };

    // Create a valid Chart.js data object for energy usage.
    const energyChartData = {
      labels: energyData.main_chart.labels,
      datasets: [{
        label: "Energy Usage (kWh)",
        data: energyData.main_chart.values,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.4,
        fill: true
      }]
    };

    const lincolnHighSchoolContext = {
      id: 1,
      name: "Lincoln High School",
      description: "A comprehensive public high school focused on STEM education.",
      principal: {
        firstName: "George",
        lastName: "Wilson",
        email: "george@noom.com"
      },
      studentExample: {
        firstName: "Toby",
        lastName: "Dean",
        email: "toby@noom.com",
        points: 0
      },
      // Energy usage records for various years (only a sample is shown; you can add more as needed)
      energyUsageRecords: {
        "2021": {
          "January": "1000 kWh", "February": "950 kWh", "March": "1100 kWh",
          "April": "1300 kWh", "May": "980 kWh", "June": "1125 kWh",
          "July": "1150 kWh", "August": "1200 kWh", "September": "1100 kWh",
          "October": "1200 kWh", "November": "1150 kWh", "December": "1250 kWh"
        },
        "2024": {
          "January": "1300 kWh", "February": "1200 kWh", "March": "1400 kWh",
          "April": "1100 kWh", "May": "1150 kWh", "June": "1250 kWh",
          "July": "1500 kWh", "August": "1400 kWh", "September": "1300 kWh",
          "October": "1200 kWh", "November": "1250 kWh", "December": "1350 kWh"
        }
        // (Additional years such as 2022, 2023, and predicted 2025 data may also be included.)
      },
      // Carbon footprint records (again, a sample for 2024)
      carbonFootprintRecords: {
        "2024": {
          "January": "0.8 tonnes CO₂", "February": "0.7 tonnes CO₂", "March": "0.9 tonnes CO₂",
          "April": "0.8 tonnes CO₂", "May": "0.9 tonnes CO₂", "June": "0.8 tonnes CO₂",
          "July": "1.0 tonnes CO₂", "August": "0.9 tonnes CO₂", "September": "1.0 tonnes CO₂",
          "October": "0.7 tonnes CO₂", "November": "0.8 tonnes CO₂", "December": "1.0 tonnes CO₂"
        }
        // (Additional years or predicted values may be included.)
      },
      // Events for Lincoln High School
      events: [
        {
          name: "Freshman Orientation 2024",
          date: "2024-01-31 12:00:00",
          description: "Welcome orientation for new students",
          carbonFootprintID: 1,
          energyUsageID: 37
        },
        {
          name: "Sports Carnival 2024",
          date: "2024-08-31 12:00:00",
          description: "Annual school sports carnival and field day",
          carbonFootprintID: 8,
          energyUsageID: 44
        },
        {
          name: "Graduation Day 2024",
          date: "2024-11-30 12:00:00",
          description: "Annual graduation ceremony for the class of 2024",
          carbonFootprintID: 11,
          energyUsageID: 47
        }
      ],
      // Active campaigns for the school
      campaigns: [
        {
          name: "Recycle Right",
          description: "Encourage students to sort and recycle waste properly. Aiming to increase recycling rates within the school.",
          points: 3,
          startDate: "2024-09-15"
        },
        {
          name: "Turn Off Classroom Lights",
          description: "Promote energy conservation by ensuring that classroom lights are turned off when not in use.",
          points: 4,
          startDate: "2024-10-01"
        },
        {
          name: "Plant a Green Patch",
          description: "Involve students in planting a small garden or green patch within the school compound to improve air quality and aesthetics.",
          points: 5,
          startDate: "2024-11-20"
        }
      ]
    };

    return {
      energyData: {
        currentMonth: {
          total: energyData.main_chart.values[11] + " kWh", // December value
          breakdown: energyBreakdown
        },
        carbonFootprint: "1 tonnes CO₂", // Updated value
        netZeroProgress: "45% reduction from baseline",
        chartData: energyChartData,
        areas_of_concern: energyData.areas_of_concern,
        personalized_recommendations: energyData.personalized_recommendations,
        strengths: energyData.strengths,
        predictions: energyData.predictions
      },
      carbonData: carbonData,
      campaignInfo: {
        active: true,
        currentCampaigns: campaignData
      },
      schoolContext: lincolnHighSchoolContext
    };
  } catch (error) {
    console.error('Error building environmental context:', error);
    return null;
  }
};

// ======================================================
// Chatbot Handler
// ======================================================
module.exports.handleChat = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    if (!assistant) await initializeAssistant();

    const context = await buildEnvironmentalContext();
    if (!context) {
      throw new Error('Failed to build environmental context');
    }

    const messageIntent = detectMessageIntent(message);

    if (messageIntent === 'active_campaigns') {
      return res.json({
        reply: `**The current active campaigns are:**\n\n[View All Campaigns](campaign.html)`,
        intent: messageIntent,
        contextData: context,
        visualizations: { showCharts: false }
      });
    }

    if (messageIntent === 'reports_query') {
      return res.json({
        reply: `# Sustainability Reports

**Generate & view sustainability reports by year:**

- Track energy usage, carbon emissions, and net-zero progress
- Download reports as PDFs
- View interactive charts and data visualizations
- Access personalized recommendations and future predictions

## Summary
The reporting system allows schools to generate comprehensive sustainability reports that analyze their environmental impact. Reports include energy consumption, carbon footprint data, and recommendations for improvement. Users can view historical data, track current performance, and see predictions up to 2050, all accessible through an interactive dashboard with downloadable PDF options.

[Generate Reports](generateReport.html)`,
        intent: messageIntent,
        contextData: context,
        visualizations: { showCharts: false }
      });
    }

    if (messageIntent === 'events_query') {
      return res.json({
        reply: `# Event Management & Impact Analysis

**Track and manage both upcoming and past events:**

- View detailed environmental impact per event:
  - Energy usage breakdown (HVAC, Lighting, Equipment, etc.)
  - Carbon footprint analysis (Energy, Food Services, Transportation, etc.)
- Generate AI-powered recommendations for sustainability improvements
- Interactive charts and visualizations for each event's impact
- CRUD operations (Create, Read, Update, Delete) for event management

## Summary
The events system allows schools to monitor and manage their events' environmental impact. Each event tracks detailed energy usage and carbon emissions with interactive visualizations. The system uses AI to analyze the data and provide actionable recommendations for improving sustainability in future events. Events are organized into upcoming and past sections for easy tracking and comparison.

[View Events](events.html)`,
        intent: messageIntent,
        contextData: context,
        visualizations: { showCharts: false }
      });
    }

    if (messageIntent === 'faq_query') {
      return res.json({
        reply: `# Frequently Asked Questions

**Quick access to common questions and answers:**

- General information
- Login help
- Data logging guidance
- Campaign information
- Report generation
- Simple Q&A format for easy reading
- Basic platform overview and functionality explanations
- User onboarding information
- Technical requirements and data input methods

## Summary
The FAQ section provides quick answers to common questions about GreenCampus, organized by topic. It covers platform basics, account management, data logging procedures, and campaign/report features. The section helps new users understand the platform's functionality and guides them through common processes using a straightforward question-and-answer format.

[View FAQ](faq.html)`,
        intent: messageIntent,
        contextData: context,
        visualizations: { showCharts: false }
      });
    }

    if (messageIntent === 'leaderboard_query') {
      return res.json({
        reply: `# Student Leaderboard

**Track student engagement and achievements:**

- View top performers in sustainability initiatives
- Track points earned through various activities
- Compare performance across different time periods
- Celebrate student achievements and milestones

## Summary
The leaderboard showcases student participation and achievements in sustainability initiatives. Students earn points through active participation in campaigns, events, and other eco-friendly activities. This gamification element encourages continued engagement and healthy competition among students.

[View Leaderboard](leaderboard.html)`,
        intent: messageIntent,
        contextData: context,
        visualizations: { showCharts: false }
      });
    }

    if (messageIntent === 'menu_query') {
      return res.json({
        reply: `# GreenCampus Menu

**Quick access to all features:**

Select any option below to get started:`,
        intent: messageIntent,
        contextData: context,
        visualizations: { showCharts: false }
      });
    }

    if (!thread) {
      thread = await openai.beta.threads.create();
    }

    const metadata = {
      intent: messageIntent,
      energyTotal: context.energyData.currentMonth.total,
      carbonFootprint: context.energyData.carbonFootprint
    };

    const fullMessage = `Context for your response:
Energy Usage: ${context.energyData.currentMonth.total}
Carbon Footprint: ${context.energyData.carbonFootprint}
Net Zero Progress: ${context.energyData.netZeroProgress}
Energy Breakdown: ${JSON.stringify(context.energyData.currentMonth.breakdown)}
Active Campaigns: ${context.campaignInfo.currentCampaigns.map(c => c.name).join(', ')}

User Query: ${message}`;

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: fullMessage,
      metadata
    });

    const runAssistantWithTimeout = async (threadId, runId, timeoutMs) => {
      const polling = (async () => {
        let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
        while (runStatus.status !== 'completed') {
          if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
            throw new Error(`Assistant run ${runStatus.status}`);
          }
          await new Promise(resolve => setTimeout(resolve, 500));
          runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
        }
        return runStatus;
      })();

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Assistant response timed out')), timeoutMs)
      );

      return Promise.race([polling, timeout]);
    };

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id
    });

    await runAssistantWithTimeout(thread.id, run.id, 30000);

    const messages = await openai.beta.threads.messages.list(thread.id, { limit: 1 });
    if (!messages.data.length || !messages.data[0].content.length) {
      throw new Error('Empty response from assistant');
    }

    const botMessage = messages.data[0].content[0].text.value;
    if (messageIntent === 'carbon_query' && !botMessage.includes('<chart-placeholder-carbon>')) {
      throw new Error('Invalid carbon footprint response format');
    }

    res.json({
      reply: botMessage,
      intent: messageIntent,
      contextData: context,
      visualizations: {
        energyChart: context.energyData.chartData,
        showCharts: (messageIntent === 'energy_query' || messageIntent === 'carbon_query')
      }
    });
  } catch (error) {
    console.error('Error in handleChat:', error);
    res.status(500).json({
      error: process.env.NODE_ENV === 'development'
        ? error.message
        : 'An error occurred while processing your request. Please try again.'
    });
  }
};

/**
 * Very basic intent detection based on keywords.
 * @param {string} message 
 * @returns {string} detected intent
 */
const detectMessageIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('new campaign') || lowerMessage.includes('campaign idea') || lowerMessage.includes('suggest campaign')) {
    return 'campaign_ideas';
  } else if (lowerMessage.includes('energy') || lowerMessage.includes('consumption') || lowerMessage.includes('usage')) {
    return 'energy_query';
  } else if (lowerMessage.includes('carbon') || lowerMessage.includes('emissions') || lowerMessage.includes('co2')) {
    return 'carbon_query';
  } else if (lowerMessage === 'active campaigns' || lowerMessage.includes('show me active campaigns') || lowerMessage.includes('current campaigns')) {
    return 'active_campaigns';
  } else if (lowerMessage.includes('campaign') || lowerMessage.includes('initiative')) {
    return 'campaign_query';
  } else if (lowerMessage.includes('net zero') || lowerMessage.includes('progress toward net zero')) {
    return 'net_zero_query';
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return 'welcome';
  } else if (lowerMessage.includes('report') || lowerMessage.includes('reports') || lowerMessage.includes('generate report')) {
    return 'reports_query';
  } else if (lowerMessage.includes('event') || lowerMessage.includes('events') || lowerMessage.includes('manage events')) {
    return 'events_query';
  } else if (lowerMessage.includes('faq') || lowerMessage.includes('help') || lowerMessage.includes('question') || lowerMessage.includes('how do i') || lowerMessage.includes('how to')) {
    return 'faq_query';
  } else if (lowerMessage.includes('leaderboard') || lowerMessage.includes('ranking') || lowerMessage.includes('top students')) {
    return 'leaderboard_query';
  } else if (lowerMessage.includes('menu') || lowerMessage.includes('show menu') || lowerMessage.includes('show options')) {
    return 'menu_query';
  }
  return 'general_query';
};

async function showWelcomeMessage() {
  const welcomeMessage = `**Welcome to GreenCampus Assistant!**
I'm here to help you with environmental and energy data analysis.

**Feel free to ask me questions like:**
"What is our current energy usage?"
"How can we reduce our carbon footprint?"
"What campaigns are running currently?"
"What's our progress toward net zero?"

**How can I assist you today?**

<div class="gc-quick-actions">
  <button class="gc-quick-action-btn" data-question="Tell me about energy usage">
    Energy Usage
  </button>
  <button class="gc-quick-action-btn" data-question="What is our carbon footprint">
    Carbon Footprint
  </button>
  <button class="gc-quick-action-btn" data-question="What's our progress toward net zero?">
    Progress To Net Zero
  </button>
  <button class="gc-quick-action-btn" data-question="Show me active campaigns">
    Active Campaigns
  </button>
  <button class="gc-quick-action-btn" data-question="Show me the leaderboard">
    Leaderboard
  </button>
  <button class="gc-quick-action-btn" data-question="Tell me about reports">
    Reports
  </button>
  <button class="gc-quick-action-btn" data-question="Show me the events">
    Events
  </button>
  <button class="gc-quick-action-btn" data-question="Show me the FAQ">
    FAQ
  </button>
</div>`;

  appendMessage(welcomeMessage, 'bot', null, 'welcome');
}
