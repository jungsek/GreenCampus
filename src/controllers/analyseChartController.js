require('dotenv').config();
const OpenAI = require('openai'); // Import OpenAI
const EnergyUsage = require('../models/energyUsage');
const CarbonFootprint = require('../models/carbonFootprint');
const EnergyBreakdown = require('../models/energyBreakdown');
const School = require('../models/school');

module.exports.analyseChart = async (req, res) => {
    try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        const openai = new OpenAI(OPENAI_API_KEY);
        const aiModel = "gpt-4o"; // Use the appropriate model

        const { schoolId, year, chartType } = req.body;

        // Validate input parameters
        if (!schoolId || !year || !chartType) {
            return res.status(400).json({ error: 'schoolId, year, and chartType are required.' });
        }

        // Fetch school details
        const school = await School.getSchoolById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'School not found.' });
        }

        let energyUsages = [];
        let carbonFootprints = [];
        let energyBreakdowns = [];

        if (chartType === 'energy') {
            // Fetch energy usage data for the specified year
            energyUsages = await EnergyUsage.getMonthlyEnergyUsage(schoolId, year);

            // Fetch energy breakdown data for each energy usage record
            for (const eu of energyUsages) {
                let breakdowns = await EnergyBreakdown.getPercentageByCategory(eu.id);
                breakdowns = breakdowns || [];

                energyBreakdowns.push({
                    month: eu.month,
                    breakdowns: breakdowns.map(b => ({
                        category: b.category,
                        percentage: b.percentage,
                    })),
                });
            }
        } else if (chartType === 'carbon') {
            // Fetch carbon footprint data for the specified year
            carbonFootprints = await CarbonFootprint.getYearlyCarbonFootprint(schoolId, year);
        } else {
            return res.status(400).json({ error: 'Invalid chartType. Must be "energy" or "carbon".' });
        }

        // Prepare the prompt for OpenAI API
        const messages = [
            {
                role: 'system',
                content: 'You are an expert in environmental sustainability and data analysis.',
            },
            {
                role: 'user',
                content: generateAnalysisPrompt(school.school_name, year, chartType, energyUsages, carbonFootprints, energyBreakdowns),
            },
        ];

        // Call OpenAI API to generate the analysis
        const completion = await openai.chat.completions.create({
            model: aiModel,
            messages,
            temperature: 0.7,
            max_tokens: 3000,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const aiResponse = completion.choices[0].message.content;
        console.log('AI Response:', aiResponse);
        const parsedAnalysis = parseAnalysisResponse(aiResponse);

        // Return the analysis to the frontend
        res.json(parsedAnalysis);

    } catch (error) {
        console.error('Error generating analysis via OpenAI:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while generating the analysis.' });
    }
};

function generateAnalysisPrompt(schoolName, year, chartType, energyUsages, carbonFootprints, energyBreakdowns) {
    // Generate data summary
    let summary = `Sustainability Data Summary for ${schoolName} in ${year}:\n\n`;

    if (chartType === 'energy') {
        summary += `Energy Usage:\n`;
        energyUsages.forEach(eu => {
            summary += `- ${eu.month}: ${eu.energy_kwh.toFixed(2)} kWh, Avg Temp: ${eu.avg_temperature_c.toFixed(1)}°C\n`;
        });

        summary += `\nEnergy Breakdown:\n`;
        energyBreakdowns.forEach(eb => {
            summary += `- ${eb.month}: ${eb.breakdowns.map(b => `${b.category}: ${b.percentage}%`).join(', ')}\n`;
        });
    } else if (chartType === 'carbon') {
        summary += `Carbon Footprint:\n`;
        carbonFootprints.forEach(cf => {
            const date = new Date(cf.timestamp).toISOString().split('T')[0];
            summary += `- ${date}: ${cf.total_carbon_tons.toFixed(2)} tons\n`;
        });
    }

    // Prepare the prompt with the new instructions
    return `
Based on the data summary below, analyze the ${chartType === 'energy' ? 'Energy Usage' : 'Carbon Footprint'} trends for ${schoolName} in ${year}. Provide insights, identify areas of concern and strengths, and make predictions for future ${chartType === 'energy' ? 'Energy Usage' : 'Carbon Emissions'}.

**Specific Instructions:**

1. **First and Main Graph:**
   - The first and main graph should be a copy of the original ${chartType === 'energy' ? 'Energy Usage' : 'Carbon Footprint'} chart for ${year} from the Dashboard.
   - Provide the data for this chart in JSON format under "main_chart".

2. **Areas of Concern:**
   - Identify the month with the highest ${chartType === 'energy' ? 'Energy Usage' : 'Carbon Footprint'}.
   - Find out what caused this and provide reasoning and in-depth explanation of the factors contributing to this concern.
   ${chartType === 'energy' ? `
   - For Energy Usage, use the Energy Breakdown for the identified month. This should be a copy of the original Energy Breakdown pie chart for that specific month from the Dashboard.
   - Provide the data for this pie chart in JSON format under "areas_of_concern" with a "type" field set to "pie".` : ''}
   - For other areas of concern, feel free to add on.

3. **Personalized Recommendations:**
   - Offer specific, actionable recommendations to address each area of concern.
   - Ensure that the recommendations are task-specific, personalized to the school's context, and include explanations for their effectiveness.
   - Go in-depth and list out the steps the school should take.

4. **Strengths:**
   - Highlight areas where the school performed well.
   - Provide explanations and data visualizations (in JSON format) for these strengths.

5. **Predictions:**
   - Predict future ${chartType === 'energy' ? 'Energy Usage' : 'Carbon Emissions'} trends for each year until 2050.
   - Provide both actual and ideal predictions in a format suitable for charting.
   - I will provide the sample data for the predictions, just copy and use what i provide.

**Data Summary:**

${summary}

**Output Instructions:**

- **Your entire response should be valid JSON matching the structure provided below.**
- **Do not include any explanations, notes, or additional text outside of the JSON.**
- **Ensure all strings are properly quoted and escape any characters that may break the JSON format.**

**For the predictions, use this data, and separate it to Energy Usage Predictions and Carbon Footprint Predictions accordingly.**

**Sample Predictions Data (Need to separate energy usage and carbon footprint):**
{
    "predictions": [
      {
        "year": 2024,
        "predicted_energy_kwh": 1100,
        "ideal_energy_kwh": 900,
        "predicted_carbon_tons": 0.85,
        "ideal_carbon_tons": 0.70
      },
      {
        "year": 2025,
        "predicted_energy_kwh": 1080,
        "ideal_energy_kwh": 880,
        "predicted_carbon_tons": 0.83,
        "ideal_carbon_tons": 0.68
      },
      {
        "year": 2026,
        "predicted_energy_kwh": 1120,
        "ideal_energy_kwh": 860,
        "predicted_carbon_tons": 0.87,
        "ideal_carbon_tons": 0.66
      },
      {
        "year": 2027,
        "predicted_energy_kwh": 1050,
        "ideal_energy_kwh": 840,
        "predicted_carbon_tons": 0.80,
        "ideal_carbon_tons": 0.64
      },
      {
        "year": 2028,
        "predicted_energy_kwh": 1030,
        "ideal_energy_kwh": 820,
        "predicted_carbon_tons": 0.78,
        "ideal_carbon_tons": 0.62
      },
      {
        "year": 2029,
        "predicted_energy_kwh": 1070,
        "ideal_energy_kwh": 800,
        "predicted_carbon_tons": 0.82,
        "ideal_carbon_tons": 0.60
      },
      {
        "year": 2030,
        "predicted_energy_kwh": 1020,
        "ideal_energy_kwh": 780,
        "predicted_carbon_tons": 0.77,
        "ideal_carbon_tons": 0.58
      },
      {
        "year": 2031,
        "predicted_energy_kwh": 990,
        "ideal_energy_kwh": 760,
        "predicted_carbon_tons": 0.75,
        "ideal_carbon_tons": 0.56
      },
      {
        "year": 2032,
        "predicted_energy_kwh": 970,
        "ideal_energy_kwh": 740,
        "predicted_carbon_tons": 0.73,
        "ideal_carbon_tons": 0.54
      },
      {
        "year": 2033,
        "predicted_energy_kwh": 950,
        "ideal_energy_kwh": 720,
        "predicted_carbon_tons": 0.71,
        "ideal_carbon_tons": 0.52
      },
      {
        "year": 2034,
        "predicted_energy_kwh": 980,
        "ideal_energy_kwh": 700,
        "predicted_carbon_tons": 0.74,
        "ideal_carbon_tons": 0.50
      },
      {
        "year": 2035,
        "predicted_energy_kwh": 930,
        "ideal_energy_kwh": 680,
        "predicted_carbon_tons": 0.70,
        "ideal_carbon_tons": 0.48
      },
      {
        "year": 2036,
        "predicted_energy_kwh": 910,
        "ideal_energy_kwh": 660,
        "predicted_carbon_tons": 0.68,
        "ideal_carbon_tons": 0.46
      },
      {
        "year": 2037,
        "predicted_energy_kwh": 890,
        "ideal_energy_kwh": 640,
        "predicted_carbon_tons": 0.66,
        "ideal_carbon_tons": 0.44
      },
      {
        "year": 2038,
        "predicted_energy_kwh": 870,
        "ideal_energy_kwh": 620,
        "predicted_carbon_tons": 0.64,
        "ideal_carbon_tons": 0.42
      },
      {
        "year": 2039,
        "predicted_energy_kwh": 900,
        "ideal_energy_kwh": 600,
        "predicted_carbon_tons": 0.67,
        "ideal_carbon_tons": 0.40
      },
      {
        "year": 2040,
        "predicted_energy_kwh": 850,
        "ideal_energy_kwh": 580,
        "predicted_carbon_tons": 0.63,
        "ideal_carbon_tons": 0.38
      },
      {
        "year": 2041,
        "predicted_energy_kwh": 830,
        "ideal_energy_kwh": 560,
        "predicted_carbon_tons": 0.61,
        "ideal_carbon_tons": 0.36
      },
      {
        "year": 2042,
        "predicted_energy_kwh": 810,
        "ideal_energy_kwh": 540,
        "predicted_carbon_tons": 0.59,
        "ideal_carbon_tons": 0.34
      },
      {
        "year": 2043,
        "predicted_energy_kwh": 790,
        "ideal_energy_kwh": 520,
        "predicted_carbon_tons": 0.57,
        "ideal_carbon_tons": 0.32
      },
      {
        "year": 2044,
        "predicted_energy_kwh": 770,
        "ideal_energy_kwh": 500,
        "predicted_carbon_tons": 0.55,
        "ideal_carbon_tons": 0.30
      },
      {
        "year": 2045,
        "predicted_energy_kwh": 800,
        "ideal_energy_kwh": 480,
        "predicted_carbon_tons": 0.58,
        "ideal_carbon_tons": 0.28
      },
      {
        "year": 2046,
        "predicted_energy_kwh": 750,
        "ideal_energy_kwh": 460,
        "predicted_carbon_tons": 0.54,
        "ideal_carbon_tons": 0.26
      },
      {
        "year": 2047,
        "predicted_energy_kwh": 730,
        "ideal_energy_kwh": 440,
        "predicted_carbon_tons": 0.52,
        "ideal_carbon_tons": 0.24
      },
      {
        "year": 2048,
        "predicted_energy_kwh": 710,
        "ideal_energy_kwh": 420,
        "predicted_carbon_tons": 0.50,
        "ideal_carbon_tons": 0.22
      },
      {
        "year": 2049,
        "predicted_energy_kwh": 690,
        "ideal_energy_kwh": 400,
        "predicted_carbon_tons": 0.48,
        "ideal_carbon_tons": 0.21
      },
      {
        "year": 2050,
        "predicted_energy_kwh": 650,
        "ideal_energy_kwh": 380,
        "predicted_carbon_tons": 0.45,
        "ideal_carbon_tons": 0.20
      }
    ],
    "net_zero_estimation": {
      "current_status": "65% towards net zero",
      "estimated_year_to_net_zero": 2045
    }
  }

**JSON Structure:**

{
  "main_chart": {
    "labels": ["<string>", ...],
    "values": [<number>, ...]
  },
  "areas_of_concern": [
    {
      "title": "<string>",
      "problem": "<string>",
      "data": {
        "type": "<string>", // "bar", "line", "pie"
        "labels": ["<string>", ...],
        "values": [<number>, ...]
      },
      "conclusion": "<string>"
    },
    // ... more areas of concern
  ],
  "personalized_recommendations": [
    "<string>",
    // ... more recommendations
  ],
  "strengths": [
    {
      "title": "<string>",
      "achievement": "<string>",
      "data": {
        "labels": ["<string>", ...],
        "values": [<number>, ...]
      },
      "conclusion": "<string>"
    },
    // ... more strengths
  ],
  "predictions": [
    {
      "year": <integer>,
      "predicted_${chartType === 'energy' ? 'energy_kwh' : 'carbon_tons'}": <number>,
      "ideal_${chartType === 'energy' ? 'energy_kwh' : 'carbon_tons'}": <number>
    },
  ]
}
`;
}

function parseAnalysisResponse(aiResponse) {
    try {
        // Use regex to extract JSON content between the first '{' and the last '}'
        const jsonStart = aiResponse.indexOf('{');
        const jsonEnd = aiResponse.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonString = aiResponse.substring(jsonStart, jsonEnd + 1);
            const analysisData = JSON.parse(jsonString);
            return analysisData; // Return the parsed data
        } else {
            throw new Error('No JSON content found in AI response.');
        }
    } catch (error) {
        console.error('Error parsing AI response:', error);
        throw new Error('Failed to parse analysis data.');
    }
}
