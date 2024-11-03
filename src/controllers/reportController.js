require('dotenv').config();
const OpenAI = require('openai'); // Import OpenAI
const EnergyUsage = require('../models/energyUsage');
const CarbonFootprint = require('../models/carbonFootprint');
const EnergyBreakdown = require('../models/energyBreakdown');
const School = require('../models/school');
const Report = require('../models/report');

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
        res.json({ report });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'An error occurred while fetching the report.' });
    }
};


module.exports.generateReport = async (req, res) => {
    try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        const openai = new OpenAI(OPENAI_API_KEY); 
        const aiModel = "gpt-3.5-turbo"; 

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

        // Prepare the messages for OpenAI API
        const messages = [
            {
                role: 'system',
                content: 'You are an expert in energy sustainability.',
            },
            {
                role: 'user',
                content: generatePrompt(school.school_name, year, energyUsages, carbonFootprints, energyBreakdowns),
            },
        ];

        // Call OpenAI API to generate the report
        const completion = await openai.chat.completions.create({
            model: aiModel,
            messages,
            temperature: 1.0,
            max_tokens: 1500,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const aiResponse = completion.choices[0].message.content;
        const reportContent = aiResponse.trim();

        // Save the report to the database
        const report = await Report.createReport(schoolId, year, reportContent);

        // Return the generated report
        res.json({ report: reportContent });

    } catch (error) {
        console.error('Error generating report via OpenAI:', error);
        res.status(500).json({ error: 'An error occurred while generating the report.' });
    }
};

// Helper function to generate the prompt
function generatePrompt(schoolName, year, energyUsages, carbonFootprints, energyBreakdowns) {
    // Generate table rows for energy usage
    const energyUsageRows = energyUsages.map(eu => `
        <tr>
            <td>${eu.month}</td>
            <td>${eu.energy_kwh.toFixed(2)}</td>
            <td>${eu.avg_temperature_c.toFixed(1)}</td>
        </tr>
    `).join('');

    // Generate table rows for carbon footprint
    const carbonFootprintRows = carbonFootprints.map(cf => `
        <tr>
            <td>${cf.timestamp.toISOString().split('T')[0]}</td>
            <td>${cf.total_carbon_tons.toFixed(2)}</td>
        </tr>
    `).join('');

    // Prepare energy breakdown text if available
    let energyBreakdownText;
    if (energyBreakdowns && energyBreakdowns.length > 0) {
        energyBreakdownText = energyBreakdowns.map(eb => `
            <p>Month: ${eb.month}</p>
            <ul>
                ${eb.breakdowns.map(b => `<li>${b.category}: ${b.percentage}%</li>`).join('')}
            </ul>
        `).join('');
    } else {
        energyBreakdownText = 'Energy breakdown data is currently unavailable.';
    }

    // Prepare the prompt
    return `
Using the data provided below, generate a comprehensive energy consumption and carbon footprint report for the school year ${year}. The report should:

- Summarize data insights.
- Make custom recommendations for areas of improvement.
- Suggest ways to make measurable reductions.
- Outline strategies for tracking progress toward sustainability goals.
- Focus on helping the school reach net-zero overall emissions.

Please format the report using the following HTML template, tweaking it accordingly based on the data and insights:

<pre>
<div id="reportOutput" class="report">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${schoolName} Energy Consumption and Carbon Footprint Report ${year}</title>
    <style>
        /* Your CSS styles */
    </style>

    <h1>${schoolName} Energy Consumption and Carbon Footprint Report ${year}</h1>

    <h2>Executive Summary</h2>
    <p>[Provide a summary that highlights key insights, data trends, and the overall objective of reaching net-zero emissions.]</p>

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
            <!-- Populate with energy usage data -->
            ${energyUsageRows}
        </tbody>
    </table>
    <p>[Provide insights and observations about the energy consumption patterns, including correlations with temperature or other factors.]</p>

    <h2>Carbon Footprint Overview</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Total Carbon Emissions (tons)</th>
            </tr>
        </thead>
        <tbody>
            <!-- Populate with carbon footprint data -->
            ${carbonFootprintRows}
        </tbody>
    </table>
    <p>[Provide insights on carbon emissions trends and implications for reaching net-zero goals.]</p>

    <h2>Energy Breakdown</h2>
    ${energyBreakdownText}

    <h2>Recommendations</h2>
    <ul>
        <li>[Custom recommendation 1 to reduce energy consumption and carbon emissions.]</li>
        <li>[Custom recommendation 2 focusing on measurable reductions and improvements.]</li>
        <li>[Additional recommendations tailored to the school's context.]</li>
    </ul>

    <h2>Monitoring Progress</h2>
    <p>[Outline strategies for tracking progress toward sustainability goals, including key metrics and monitoring tools.]</p>

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

Please output only the HTML code for the report, following the format above, without additional explanations.
    `;
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

        res.json({ report: report.content });

    } catch (error) {
        console.error('Error retrieving report:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the report.' });
    }
};
