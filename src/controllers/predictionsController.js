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
    return `
Based on the historical energy usage and carbon emissions data provided for ${schoolName}, analyze the trends and make comprehensive predictions for each year until 2050.

**Specific Instructions:**

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

3. **Net Zero Estimation:**
   - Calculate how far the school is from achieving net-zero emissions based on historical data.
   - Provide:
     - "current_status": A string indicating the percentage progress towards net zero (e.g., "60% towards net zero").
     - "estimated_year_to_net_zero": An integer year when the school is expected to achieve net-zero emissions under current trends (without additional interventions). This cannot be higher than 2050.

4. **Data Format:**
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

5. **Requirements:**
   - **Ensure the ideal predictions show a consistent, steep declining trend, reaching 200 kWh for energy usage and 0.2 tons for carbon emissions only in the year 2050, and not before.**
   - **Ensure the ideal predictions do not go below 200 kWh for energy usage and 0.2 tons for carbon emissions at any point.**
   - **Ensure the actual predictions end at 500 kWh for energy usage and 0.4 tons for carbon emissions in 2050.**
   - **Ensure the actual predictions include natural inconsistencies, with fluctuations, irregularities, spikes, or drops, reflecting realistic trends.**
   - The ideal values must be lower than the actual predicted values for each corresponding year.
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
