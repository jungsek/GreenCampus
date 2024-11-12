require('dotenv').config();
const OpenAI = require('openai'); // Import OpenAI
const EnergyUsage = require('../models/energyUsage');
const CarbonFootprint = require('../models/carbonFootprint');
const EnergyBreakdown = require('../models/energyBreakdown');
const School = require('../models/school');

module.exports.generateRecommendations = async (req, res) => {
    try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        const openai = new OpenAI(OPENAI_API_KEY); 
        const aiModel = "gpt-4o"; 

        const schoolId = parseInt(req.body.schoolId);
        const year = parseInt(req.body.year);

        // Validate input parameters
        if (isNaN(schoolId) || isNaN(year)) {
            return res.status(400).json({ error: 'Invalid schoolId or year provided.' });
        }

        // Fetch school details
        const school = await School.getSchoolById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'School not found.' });
        }

        // Fetch energy usage data for the specified year
        const energyUsages = await EnergyUsage.getMonthlyEnergyUsage(schoolId, year);

        // Fetch carbon footprint data for the specified year
        const carbonFootprints = await CarbonFootprint.getYearlyCarbonFootprint(schoolId, year);

        if (!energyUsages || !carbonFootprints) {
            return res.status(404).json({ error: 'Energy usage or carbon footprint data not found for this year.' });
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

        // Prepare the prompt for OpenAI API
        const messages = [
            {
                role: 'system',
                content: 'You are an expert in environmental sustainability and data analysis.',
            },
            {
                role: 'user',
                content: generateRecommendationPrompt(school.school_name, year, energyUsages, carbonFootprints, energyBreakdowns),
            },
        ];

        // Call OpenAI API to generate the recommendations
        const completion = await openai.chat.completions.create({
            model: aiModel,
            messages,
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

   
        const aiResponse = completion.choices[0].message.content;
        console.log('AI Response:', aiResponse); 
        const parsedRecommendations = parseRecommendationResponse(aiResponse);

        // Return the recommendations to the frontend
        res.json({ recommendationData: parsedRecommendations });

    } catch (error) {
        console.error('Error generating recommendations via OpenAI:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while generating the recommendations.' });
    }
};

function generateRecommendationPrompt(schoolName, year, energyUsages, carbonFootprints, energyBreakdowns) {
    // Generate data summary
    let summary = `Yearly Sustainability Data Summary for ${schoolName} in ${year}:

Energy Usage:
`;
    energyUsages.forEach(eu => {
        summary += `- ${eu.month}: ${eu.energy_kwh.toFixed(2)} kWh, Avg Temp: ${eu.avg_temperature_c.toFixed(1)}°C\n`;
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

    return `
    Based on the data summary below and considering Singapore's national climate target to achieve "net zero emissions by 2050" as part of our Long-Term Low-Emissions Development Strategy (LEDS), generate a comprehensive sustainability analysis. This analysis should include:

1. **Green Score:** Assign a score out of 100 indicating the school's sustainability performance. A score of 90 and above is excellent, showing proximity to achieving Net Zero Emissions. Provide a short summary explaining the reasoning behind the score.

2. **Areas of Concern:** Identify key areas that need improvement, such as the month with the highest emissions or the location with the highest energy consumption. For each area of concern:
   - Highlight the problem.
   - Display the relevant data.
   - Provide a conclusion, reasoning, and in-depth explanation of the factors contributing to this concern.
   - Talk about the months, periods, and locations where the issue is most prominent.

3. **Graphs for Areas of Concern:**
   - Provide data suitable for generating graphs related to each area of concern.
   - The data should be in JSON format, including labels and values.
   - Examples of graphs:
     - Monthly Energy Usage Bar Chart.
     - Monthly Carbon Emissions Line Chart.
     - Energy Breakdown Pie Chart for specific months.

4. **Personalized Recommendations:** Offer specific, actionable recommendations to address each area of concern. Ensure that the recommendations are task-specific, personalized to the school's context, and include explanations for their effectiveness.

5. **Strengths:** Highlight areas where the school performed well, such as months with the lowest emissions or effective energy management in certain locations. For each strength:
   - Highlight the achievement.
   - Display the relevant data.
   - Provide a conclusion and in-depth explanation of why this is a strength.

6. **Path to Net Zero:** Outline how the school can achieve net-zero emissions, including sustainable practices to be adopted, strategies for measurable reductions, and methods for tracking progress toward sustainability goals.

**Data Summary:**

${summary}

**Output Instructions:**

- **Your entire response should be valid JSON matching the structure provided below.**
- **Do not include any explanations, notes, or additional text outside of the JSON.**
- **Ensure all strings are properly quoted and escape any characters that may break the JSON format.**
- **Do not include comments in the JSON output.**

**Output Format:**

Provide the analysis in **JSON format only** with the following structure. **Do not include any markdown formatting, code block delimiters, or additional text.** Ensure that all placeholders are replaced with the appropriate content based on the data and insights provided.

**JSON Structure:**

{
  "green_score": {
    "score": <number>,
    "summary": "<string>"
  },
  "areas_of_concern": [
    {
      "title": "<string>",
      "problem": "<string>",
      "data": {
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
  "path_to_net_zero": [
    "<string>",
    // ... more strategies
  ]
}

`;
}

function parseRecommendationResponse(aiResponse) {
    try {
        // Use regex to extract JSON content between the first '{' and the last '}'
        const jsonStart = aiResponse.indexOf('{');
        const jsonEnd = aiResponse.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonString = aiResponse.substring(jsonStart, jsonEnd + 1);
            const recommendationData = JSON.parse(jsonString);
            return recommendationData; // Return the parsed data
        } else {
            throw new Error('No JSON content found in AI response.');
        }
    } catch (error) {
        console.error('Error parsing AI response:', error);
        throw new Error('Failed to parse recommendations data.');
    }
}
