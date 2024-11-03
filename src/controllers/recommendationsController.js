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
            max_tokens: 1000,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const aiResponse = completion.choices[0].message.content;
        const recommendationContent = aiResponse.trim();


        // Return the generated HTML recommendations
        res.json({ recommendation: recommendationContent });


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

    // Now, prepare the enhanced prompt with detailed instructions
    return `
Based on the data summary below and considering Singapore's national climate target to achieve "net zero emissions by 2050" as part of our Long-Term Low-Emissions Development Strategy (LEDS), generate a comprehensive sustainability analysis. This analysis should include:

1. **Green Score:** Assign a score out of 100 indicating the school's sustainability performance. A score of 90 and above is excellent, showing proximity to achieving Net Zero Emissions. Provide a short summary explaining the reasoning behind the score.

2. **Areas of Concern:** Identify key areas that need improvement, such as the month with the highest emissions or the location with the highest energy consumption. For each area of concern:
   - Highlight the problem.
   - Display the relevant data.
   - Provide a conclusion, reasoning, and in-depth explanation of the factors contributing to this concern.
   - Talk about the months, periods, and locations where the issue is most prominent.

3. **Personalized Recommendations:** Offer specific, actionable recommendations to address each area of concern. Ensure that the recommendations are task-specific, personalized to the school's context, and include explanations for their effectiveness.

4. **Strengths:** Highlight areas where the school performed well, such as months with the lowest emissions or effective energy management in certain locations. For each strength:
   - Highlight the achievement.
   - Display the relevant data.
   - Provide a conclusion and in-depth explanation of why this is a strength.

5. **Path to Net Zero:** Outline how the school can achieve net-zero emissions, including sustainable practices to be adopted, strategies for measurable reductions, and methods for tracking progress toward sustainability goals.

**Data Summary:**

${summary}

Please format the recommendations using the following HTML template, ensuring that all placeholders are replaced with the appropriate content based on the data and insights provided. The HTML should be well-structured, professional, and tailored to help the school achieve its sustainability objectives.

<pre>
<div id="recommendationsOutput" class="recommendations">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${schoolName} Sustainability Recommendations ${year}</title>

    <h1>${schoolName} Sustainability Recommendations ${year}</h1>

    <h2>Green Score: <span id="greenScore"></span></h2>
    <p>[Provide a short summary explaining the reasoning behind the Green Score.]</p>

    <h2>Areas of Concern</h2>
    <div id="areasOfConcern">
        <!-- Populate with detailed areas of concern -->
        <p>[Detailed explanation of Area]</p>
        <!-- Add more areas as needed -->
    </div>

    <h2>Personalized Recommendations</h2>
    <ul id="personalizedRecommendations">
        <!-- Populate with specific recommendations -->
        <li>[Recommendation]</li>
        <!-- Add more recommendations as needed -->
    </ul>

    <h2>Strengths</h2>
    <div id="strengths">
        <!-- Populate with detailed strengths -->
        <p>[Detailed explanation of Strength]</p>
        <!-- Add more strengths as needed -->
    </div>

    <h2>Path to Net Zero</h2>
    <ul id="paths">
        <li>[Outline strategies, sustainable practices, and methods for tracking progress toward net-zero emissions in point form.]</li>
    </ul>
</div>
</pre>

Ensure that the HTML is complete, well-formatted, and replaces all placeholders with the relevant content based on the analysis.
`;
}