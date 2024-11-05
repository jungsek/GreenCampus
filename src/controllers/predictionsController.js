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
Using the data summary below, analyze the trends and make comprehensive predictions for the next 5 years of energy usage and carbon footprint for ${schoolName}.

**Data Summary:**

${summary}

**Instructions:**

1. **Net Zero Emissions Proximity:**
   - Determine how far away the school is from achieving net zero emissions based on historical data.

2. **Impact of Recommendations:**
   - Assuming the school implements recommended measures to reduce emissions, estimate how long it will take to reach net zero.

3. **Additional Criteria:**
   - Consider factors such as:
     - Annual growth or reduction rates in energy consumption and carbon emissions.
     - Seasonal variations and their impact on energy usage.
     - Efficiency improvements from new technologies.
     - Potential external factors influencing energy consumption (e.g., policy changes, climate variations).

4. **Predictions Structure:**
   - Present your predictions in the following JSON format:

    {
        "predictions": [
            {
                "year": 2025,
                "month": "January",
                "predicted_energy_kwh": 1234.56,
                "predicted_carbon_tons": 7.89
            },
            ...
        ],
        "net_zero_estimation": {
            "current_status": "X% towards net zero",
            "estimated_year_to_net_zero": 20
        }
    }

5. **Requirements:**
   - Ensure that the predictions are realistic and based on the provided data.
   - Avoid including any explanations or text outside of the JSON structure.

**Example Output:**

{
    "predictions": [
        {
            "year": 2025,
            "month": "January",
            "predicted_energy_kwh": 1200.00,
            "predicted_carbon_tons": 7.50
        },
        ...
    ],
    "net_zero_estimation": {
        "current_status": "60% towards net zero",
        "estimated_year_to_net_zero": 2045
    }
}
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
