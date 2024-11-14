require('dotenv').config();
const OpenAI = require('openai'); // Import OpenAI
const EnergyUsage = require('../models/energyUsage');
const CarbonFootprint = require('../models/carbonFootprint');
const EnergyBreakdown = require('../models/energyBreakdown');
const School = require('../models/school');
const Report = require('../models/report');

const recommendationsController = require('./recommendationsController');
const predictionsController = require('./predictionsController');

module.exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.getAllReports();
        res.json({ reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'An error occurred while fetching the reports.' });
    }
};

module.exports.getReportById = async (req, res) => {
    try {
        const reportId = parseInt(req.params.reportId);
        const report = await Report.getReportById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const recommendationData = report.recommendation_data;
        const predictionData = report.prediction_data;

        res.json({
            report,
            recommendationData,
            predictionData,
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'An error occurred while fetching the report.' });
    }
};

module.exports.generateReport = async (req, res) => {
    try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        const openai = new OpenAI(OPENAI_API_KEY); 
        const aiModel = "gpt-4o"; 

        const schoolId = parseInt(req.params.schoolId);
        const year = parseInt(req.query.year) || new Date().getFullYear();

        // Fetch school details
        const school = await School.getSchoolById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'School not found' });
        }

        // Fetch energy usage data for the specified year
        const energyUsages = await EnergyUsage.getMonthlyEnergyUsage(schoolId, year);

        // Fetch carbon footprint data for the specified year
        const carbonFootprints = await CarbonFootprint.getYearlyCarbonFootprint(schoolId, year);

        if (!energyUsages || !carbonFootprints) {
            return res.status(404).json({ error: 'Energy usage or carbon footprint data not found for this year' });
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

          // Generate Recommendations
        const recommendationData = await generateRecommendationsData(schoolId, year);

          // Generate Predictions
        const predictionData = await generatePredictionsData(schoolId);

        // Prepare the messages for OpenAI API
        const messages = [
            {
                role: 'system',
                content: 'You are an expert in environmental sustainability, energy efficiency, and data analysis.',
            },
            {
                role: 'user',
                content: generatePrompt(school.school_name, year, energyUsages, carbonFootprints, energyBreakdowns, recommendationData, predictionData),
            },
        ];

        // Call OpenAI API to generate the report
        const completion = await openai.chat.completions.create({
            model: aiModel,
            messages,
            temperature: 1.0,
            max_tokens: 3500,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const aiResponse = completion.choices[0].message.content;
        const reportContent = aiResponse.trim();
        console.log('AI Response:', aiResponse);   
         // Save the report to the database with recommendation and prediction data
        const report = await Report.createReport(schoolId, year, reportContent, recommendationData, predictionData);

        // Return the generated report
        res.json({
            report: reportContent,
            recommendationData,
            predictionData
        });

    } catch (error) {
        console.error('Error generating report via OpenAI:', error);
        res.status(500).json({ error: 'An error occurred while generating the report.' });
    }
};

// Add this new controller method
module.exports.createReport = async (req, res) => {
    try {
        const { schoolId, year, content, recommendationData, predictionData } = req.body;

        // Validate inputs
        if (!schoolId || !year || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create report using the Report model
        const report = await Report.createReport(
            schoolId,
            year,
            content,
            recommendationData,
            predictionData
        );

        res.status(201).json({
            success: true,
            message: 'Report saved successfully',
            report
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ 
            error: 'An error occurred while saving the report.',
            details: error.message 
        });
    }
};

function generatePrompt(schoolName, year, energyUsages, carbonFootprints, energyBreakdowns, recommendationData, predictionData) {
    // Prepare data tables in HTML format
    const energyUsageTable = generateEnergyUsageTable(energyUsages);
    const carbonFootprintTable = generateCarbonFootprintTable(carbonFootprints);
    const energyBreakdownText = generateEnergyBreakdownText(energyBreakdowns);

    // Prepare recommendations and predictions
    const recommendationsText = generateRecommendationsText(recommendationData);
    const predictionsText = generatePredictionsText(predictionData);

    // Prepare the prompt
    return `
Using the data provided below, generate a comprehensive energy consumption and carbon footprint report for ${schoolName} for the year ${year}. The report should:

- Include Data Tables (Energy Usage, Carbon Footprint, Energy Breakdown).
- Incorporate the generated Recommendations.
- Incorporate the generated Predictions.
- Provide additional analysis and comments to create a comprehensive report.
- Focus on helping the school reach net-zero overall emissions by 2050.
- Include relevant graphs and charts where appropriate.

Please format the report using the following HTML template, filling in the sections accordingly based on the data and insights provided:

<pre>
<div id="reportOutput" class="report">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${schoolName} Sustainability Report ${year}</title>
    <style>
        /* Add any necessary CSS styles */
    </style>

    <h1>${schoolName} Sustainability Report ${year}</h1>

    <p>[Provide a summary that highlights key insights, data trends, and the overall objective of reaching net-zero emissions.]</p>

    <h2>Energy Consumption Overview</h2>
    ${energyUsageTable}
    <p>[Provide insights and observations about the energy consumption patterns, including correlations with temperature or other factors.]</p>

    <h2>Carbon Footprint Overview</h2>
    ${carbonFootprintTable}
    <p>[Provide insights on carbon emissions trends and implications for reaching net-zero goals.]</p>

    <h2>Energy Breakdown</h2>
    ${energyBreakdownText}

    <h2>Recommendations</h2>
    ${recommendationsText}

    <h2>Predictions</h2>
    ${predictionsText}

    <h2>Additional Analysis</h2>
    <p>[Provide any additional comments, analysis, or insights to enhance the comprehensiveness of the report.]</p>

    <h2>Conclusion</h2>
    <p>[Summarize key points and reinforce the school's commitment to reaching net-zero emissions.]</p>
</div>
</pre>

**Data Provided:**

**School Name**: ${schoolName}

**Instructions:**

- Replace placeholders like \`[Provide a summary...]\` with appropriate content based on the data provided.
- Ensure that the report is professional, well-organized, and tailored to help the school achieve its sustainability objectives.
- Focus on giving insights and predictions based on the data.
- Emphasize recommendations for improvements to help the school reach net-zero emissions.
- Include data visualizations where appropriate (you can reference the canvas elements or include placeholders for charts).

Please output only the HTML code for the report, following the format above, without additional explanations.
    `;
}

// Helper functions to format data into HTML
function generateEnergyUsageTable(energyUsages) {
    const rows = energyUsages.map(eu => `
        <tr>
            <td>${eu.month}</td>
            <td>${eu.energy_kwh.toFixed(2)}</td>
            <td>${eu.avg_temperature_c.toFixed(1)}</td>
        </tr>
    `).join('');

    return `
    <table>
        <thead>
            <tr>
                <th>Month</th>
                <th>Energy Usage (kWh)</th>
                <th>Average Temperature (°C)</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
    `;
}

function generateCarbonFootprintTable(carbonFootprints) {
    const rows = carbonFootprints.map(cf => `
        <tr>
            <td>${cf.timestamp.toISOString().split('T')[0]}</td>
            <td>${cf.total_carbon_tons.toFixed(2)}</td>
        </tr>
    `).join('');

    return `
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Total Carbon Emissions (tons)</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
    `;
}

function generateEnergyBreakdownText(energyBreakdowns) {
    if (energyBreakdowns.length === 0) {
        return '<p>Energy breakdown data is currently unavailable.</p>';
    }

    return energyBreakdowns.map(eb => `
        <h3>${eb.month}</h3>
        <ul>
            ${eb.breakdowns.map(b => `<li>${b.category}: ${b.percentage}%</li>`).join('')}
        </ul>
    `).join('');
}

function generateRecommendationsText(recommendationData) {
    if (!recommendationData) {
        return '<p>No recommendations data available.</p>';
    }

    // Format the recommendations into HTML
    let htmlContent = '';

    // Green Score
    htmlContent += `
        <h3>Green Score: ${recommendationData.green_score.score}</h3>
        <p>${recommendationData.green_score.summary}</p>
    `;

    // Areas of Concern
    htmlContent += '<h3>Areas of Concern</h3>';
    recommendationData.areas_of_concern.forEach((area, index) => {
        htmlContent += `
            <div class="area-of-concern">
                <h4>${area.title}</h4>
                <p>${area.problem}</p>
                <p>${area.conclusion}</p>
                <div class="chart-placeholder" data-chart-type="areaOfConcern" data-index="${index}"></div>
            </div>
        `;
    });

    // Personalized Recommendations
    htmlContent += `
        <h3>Personalized Recommendations</h3>
        <ul>
            ${recommendationData.personalized_recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    `;

    // Strengths
    htmlContent += '<h3>Strengths</h3>';
    recommendationData.strengths.forEach((strength, index) => {
        htmlContent += `
            <div class="strength">
                <h4>${strength.title}</h4>
                <p>${strength.achievement}</p>
                <p>${strength.conclusion}</p>
                <div class="chart-placeholder" data-chart-type="strength" data-index="${index}"></div>
            </div>
        `;
    });

    // Path to Net Zero
    htmlContent += `
        <h3>Path to Net Zero</h3>
        <ul>
            ${recommendationData.path_to_net_zero.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;

    return htmlContent;
}


function generatePredictionsText(predictionData) {
    if (!predictionData) {
        return '<p>No predictions data available.</p>';
    }

    // Format the predictions into HTML
    let htmlContent = '';

    // Predicted Energy Usage and Carbon Emissions
    htmlContent += `
        <h3>Predicted Energy Usage and Carbon Emissions until 2050</h3>
        <div id="predictedEnergyChartContainer"></div>
        <div id="predictedCarbonChartContainer"></div>>
        <p>The following charts illustrate the predicted energy usage and carbon emissions for the school until 2050.</p>
    `;

    // Net Zero Estimation
    htmlContent += `
        <h3>Net Zero Estimation</h3>
        <p>Current Status: ${predictionData.net_zero_estimation.current_status}</p>
        <p>Estimated Year to Net Zero: ${predictionData.net_zero_estimation.estimated_year_to_net_zero}</p>
    `;

    return htmlContent;
}

// Functions to generate recommendations and predictions data
async function generateRecommendationsData(schoolId, year) {
    try {
        // Simulate a request object
        const req = {
            body: {
                schoolId,
                year,
            }
        };

        // Simulate a response object
        const res = {
            json: function(data) {
                this.data = data;
            }
        };

        await recommendationsController.generateRecommendations(req, res);

        if (res.data && res.data.recommendationData) {
            return res.data.recommendationData;
        } else {
            throw new Error('Failed to generate recommendations data.');
        }
    } catch (error) {
        console.error('Error generating recommendations data:', error);
        return null;
    }
}

async function generatePredictionsData(schoolId) {
    try {
        // Simulate a request object
        const req = {
            body: {
                schoolId,
            }
        };

        // Simulate a response object
        const res = {
            json: function(data) {
                this.data = data;
            }
        };

        await predictionsController.generatePrediction(req, res);

        if (res.data) {
            return res.data;
        } else {
            throw new Error('Failed to generate predictions data.');
        }
    } catch (error) {
        console.error('Error generating predictions data:', error);
        return null;
    }
}


module.exports.getReportBySchoolAndYear = async (req, res) => {
    try {
        const schoolId = parseInt(req.params.schoolId);
        const year = parseInt(req.query.year) || new Date().getFullYear();

        // Fetch report from database
        const report = await Report.getReportBySchoolAndYear(schoolId, year);

        if (!report) {
            return res.status(404).json({ error: 'Report not found for the specified school and year' });
        }

        // Generate recommendations and predictions data
        const recommendationData = await generateRecommendationsData(schoolId, year);
        const predictionData = await generatePredictionsData(schoolId);

        res.json({
            report: report.content,
            recommendationData,
            predictionData
        });

    } catch (error) {
        console.error('Error retrieving report:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the report.' });
    }
};
