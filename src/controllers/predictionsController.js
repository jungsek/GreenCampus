require('dotenv').config();
const OpenAI = require('openai'); // Import OpenAI
const EnergyUsage = require('../models/energyUsage');
const CarbonFootprint = require('../models/carbonFootprint');
const EnergyBreakdown = require('../models/energyBreakdown');
const School = require('../models/school');

module.exports.generatePrediction = async (req, res) => {
    try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        const openai = new OpenAI(OPENAI_API_KEY); 
        const aiModel = "gpt-4o"; 

        const { schoolId } = req.body;
        if (!schoolId) {
            return res.status(400).json({ error: 'schoolId is required in the request body.' });
        }

        // Fetch school details
        const school = await School.getSchoolById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'School not found.' });
        }

        // Fetch all energy usage and carbon footprint data across all years
        const energyUsages = await EnergyUsage.getAllEnergyUsage(schoolId);
        const carbonFootprints = await CarbonFootprint.getAllCarbonFootprints(schoolId);

        if (!energyUsages || !carbonFootprints) {
            return res.status(404).json({ error: 'Energy usage or carbon footprint data not found for this school.' });
        }

        // Fetch energy breakdown data for each energy usage record
        const energyBreakdowns = [];
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

        const messages =  [
            {
                role: 'system',
                content: 'You are an expert in energy sustainability and data analysis.',
            },
            {
                role: 'user',
                content: generatePredictionPrompt(school.school_name, energyUsages, carbonFootprints, energyBreakdowns),
            },
        ];

        // Call OpenAI API to generate the predictions
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
        const parsedPredictions = parsePredictionResponse(aiResponse);

        // Return the predictions to the frontend
        res.json(parsedPredictions);

    } catch (error) {
        console.error('Error generating predictions via OpenAI:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while generating the predictions.' });
    }
};


function generatePredictionPrompt(schoolName, energyUsages, carbonFootprints, energyBreakdowns) {
    // Generate data summary
    let summary = `Historical Sustainability Data Summary for ${schoolName}:

Energy Usage:
`;
    energyUsages.forEach(eu => {
        summary += `- ${eu.month} ${eu.year}: ${eu.energy_kwh.toFixed(2)} kWh, Avg Temp: ${eu.avg_temperature_c.toFixed(1)}°C\n`;
    });

    summary += `

Carbon Footprint:
`;
    carbonFootprints.forEach(cf => {
        const date = new Date(cf.timestamp).toISOString().split('T')[0];
        summary += `- ${date}: ${cf.total_carbon_tons.toFixed(2)} tons\n`;
    });

    summary += `

Energy Breakdown:
`;
    energyBreakdowns.forEach(eb => {
        summary += `- ${eb.month}: ${eb.breakdowns.map(b => `${b.category}: ${b.percentage}%`).join(', ')}\n`;
    });

    // Now, prepare the enhanced prompt with detailed instructions
    /**
     Use this prompt for new prediction

     1. **Actual Predictions:**
   - Analyze historical trends to forecast future energy usage and carbon emissions.
   - Some years may be higher, and some years may be lower. Some years may go against the steady decline and shoot up, but afterwards return back on track.
   - Incorporate any seasonal variations, growth rates, or patterns observed in the historical data.
   - Include potential fluctuations like sudden increase spikes or drops due to specific events or interventions, to reflect natural inconsistencies.
   - Ensure the actual predictions are lower than the starting value.
   - The predictions should not follow a straight-line projection but reflect realistic trends with fluctuations.
   - **Ensure that the actual predictions end at 500 kWh for energy usage and 0.4 tons for carbon emissions in the year 2050.**

    2. **Ideal Predictions:**
    - Start from the current actual values.
    - Decrease energy usage and carbon emissions steadily and more aggressively each year compared to the actual predictions.
    - **Ensure that the ideal energy usage reaches 200 kWh and ideal carbon emissions reach 0.2 tons only in the year 2050, and not before.**
    - The decline should be consistent and should not reach below 200 kWh for energy usage and 0.2 tons for carbon emissions.
    - The decline should be smooth and steady, without any sudden drops or spikes.
        
    4. **Requirements:**
    - **Ensure the ideal predictions show a consistent, steep declining trend, reaching 200 kWh for energy usage and 0.2 tons for carbon emissions only in the year 2050, and not before.**
    - **Ensure the ideal predictions do not go below 200 kWh for energy usage and 0.2 tons for carbon emissions at any point.**
    - **Ensure the actual predictions end at 500 kWh for energy usage and 0.4 tons for carbon emissions in 2050.**
    - **Ensure the actual predictions include natural inconsistencies, with fluctuations, irregularities, spikes, or drops, reflecting realistic trends.**
    - The ideal values must be lower than the actual predicted values for each corresponding year.
    - Do not include any explanations or text outside of the JSON structure.
    - The data should be suitable for plotting graphs and charts as described.
    */

    return `
Based on the historical energy usage and carbon emissions data provided for ${schoolName}, analyze the trends and make comprehensive predictions for each year until 2050.

**Specific Instructions:**
1. **For the predictions, use this data and copy it to plot the graphs**


**Sample Predictions Data**
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

2. **Net Zero Estimation:**
   - Calculate how far the school is from achieving net-zero emissions based on historical data.
   - Provide:
     - "current_status": A string indicating the percentage progress towards net zero (e.g., "60% towards net zero").
     - "estimated_year_to_net_zero": An integer year when the school is expected to achieve net-zero emissions under current trends (without additional interventions). This cannot be higher than 2050.

3. **Data Format:**
   - Provide the predictions in JSON format as an object containing:
     - "predictions": [Array of prediction objects],
     - "net_zero_estimation": {
         "current_status": string,
         "estimated_year_to_net_zero": integer
       }
   - Each prediction object in the "predictions" array should contain:
     - "year": integer,
     - "predicted_energy_kwh": number (Actual Emissions Forecast),
     - "ideal_energy_kwh": number (Ideal Emissions Forecast),
     - "predicted_carbon_tons": number (Actual Emissions Forecast),
     - "ideal_carbon_tons": number (Ideal Emissions Forecast)

4. **Requirements:**
   - Do not include any explanations or text outside of the JSON structure.
   - The data should be suitable for plotting graphs and charts as described.

**Data Summary:**

${summary}

`;
}
function parsePredictionResponse(aiResponse) {
    try {
        // Extract JSON-like content using regex
        const jsonStringMatch = aiResponse.match(/{[\s\S]*}/);
        if (!jsonStringMatch) {
            throw new Error('No JSON structure found in AI response.');
        }
        const jsonString = jsonStringMatch[0];

        // Try parsing the JSON
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (jsonError) {
            // Check if the JSON is incomplete
            console.error('Error parsing prediction response: JSON appears incomplete or malformed.', jsonError);
            return { error: 'Prediction response is incomplete or malformed. Please check the response length and ensure it fits within the token limit.' };
        }

        // Validate structure to ensure expected fields exist
        if (
            parsed.predictions &&
            Array.isArray(parsed.predictions) &&
            parsed.net_zero_estimation &&
            typeof parsed.net_zero_estimation.current_status === 'string' &&
            typeof parsed.net_zero_estimation.estimated_year_to_net_zero === 'number'
        ) {
            return parsed;
        } else {
            throw new Error('Invalid prediction format');
        }
    } catch (error) {
        console.error('Error parsing prediction response:', error);
        return { error: 'Failed to parse prediction response. Please check the format and ensure the response is complete.' };
    }
}
