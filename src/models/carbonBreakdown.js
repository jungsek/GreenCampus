
const sql = require("mssql");
const dbConfig = require("../database/dbConfig");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class CarbonBreakdown {
    constructor(id, carbonfootprint_id, location, category, timestamp, percentage) {
        this.id = id;
        this.carbonfootprint_id = carbonfootprint_id;
        this.location = location;
        this.category = category;
        this.timestamp = timestamp;
        this.percentage = percentage;
    }

    static toCarbonBreakdownObj(row) {
        return new CarbonBreakdown(
            row.id,
            row.carbonfootprint_id,
            row.location,
            row.category,
            row.timestamp,
            row.percentage
        );
    }

    static async query(queryString, params) {
        const connection = await sql.connect(dbConfig);
        const request = connection.request();

        if (params) {
            for (const [key, value] of Object.entries(params)) {
                request.input(key, value);
            }
        }
        const result = await request.query(queryString);
        connection.close();
        return result;
    }

    static async getAllCarbonBreakdown() {
        const result = (await this.query("SELECT * FROM CarbonBreakdown")).recordset;
        return result.length ? result.map((x) => this.toCarbonBreakdownObj(x)) : null;
    }

    static async getCarbonBreakdownByFootprint(id) {
        const params = { "carbonFootprintId": id };
        const result = (await this.query(
            "SELECT * FROM CarbonBreakdown WHERE carbonfootprint_id = @carbonFootprintId",
            params
        )).recordset;
        return result.length ? result.map((x) => this.toCarbonBreakdownObj(x)) : null;
    }

    static async getCarbonBreakdownBySchool(schoolId) {
        const params = { "schoolId": schoolId };
        const result = await this.query(`
            SELECT eb.*
            FROM CarbonBreakdown eb
            JOIN CarbonFootprint eu ON eb.carbonfootprint_id = eu.id
            WHERE eu.school_id = @schoolId
        `, params);

        return result.recordset.length ? result.recordset.map((x) => this.toCarbonBreakdownObj(x)) : null;
    }

    static async getCarbonBreakdownPerYearBySchool(schoolId, year) {
        const params = { schoolId, year };
        const result = await this.query(`
            SELECT  
                EB.category, 
                EB.percentage, 
                EU.[month] AS month
            FROM CarbonBreakdown EB
            JOIN CarbonFootprint EU ON EB.carbonfootprint_id = EU.id
            WHERE EU.school_id = @schoolId AND YEAR(EU.timestamp) = @year
            ORDER BY EU.timestamp
        `, params);
        return result.recordset.map(row => ({
            category: row.category,
            percentage: row.percentage,
            month: row.month
        }));
    }

    static categoryPrompts = {
        EnergyUsage: `You are an energy efficiency expert. Analyze the following school energy usage data and generate NEW, unique recommendations:
    
                Current Metrics:
                - Monthly Energy Consumption: 6,000 kWh
                - Peak Energy Demand: 30 kW during school hours
                - Carbon Emissions: 3,500 kg CO2 per month
                - Major Energy Consumers: Classroom lighting, computer labs, and HVAC systems
    
                Generate 3 specific, actionable recommendations for improving energy efficiency in the school.
                Format your response exactly like this:
    
                <strong>AI Recommendations:</strong><br>
                1. [First unique recommendation]<br>
                2. [Second unique recommendation]<br>
                3. [Third unique recommendation]<br>`,
    
        FoodServices: `You are a food waste reduction specialist. Analyze the following school cafeteria data and generate NEW, unique recommendations:
    
                Current Metrics:
                - Monthly Food Waste: 300 kg
                - Carbon Footprint from Food Production: 800 kg CO2 per month
                - Average Serving Size: Excess portions observed during lunch hours
                - Waste Sources: Leftovers from student meals and kitchen overproduction
    
                Generate 3 specific, actionable recommendations to reduce food waste in the school cafeteria.
                Format your response exactly like this:
    
                <strong>AI Recommendations:</strong><br>
                1. [First unique recommendation]<br>
                2. [Second unique recommendation]<br>
                3. [Third unique recommendation]<br>`,
    
        Transportation: `You are a transportation and sustainability expert. Analyze the following school transportation data and generate NEW, unique recommendations:
    
                Current Metrics:
                - Daily Commuting Distance: 1,200 km (students and staff combined)
                - School Bus Fleet Emissions: 1,000 kg CO2 per month
                - Fleet Type: Combination of diesel-powered buses and staff vehicles
                - Alternative Transport Options: Limited bike racks and walk-to-school programs
    
                Generate 3 specific, actionable recommendations to improve transportation efficiency and reduce emissions.
                Format your response exactly like this:
    
                <strong>AI Recommendations:</strong><br>
                1. [First unique recommendation]<br>
                2. [Second unique recommendation]<br>
                3. [Third unique recommendation]<br>`,
    
        WasteManagement: `You are a waste management and recycling expert. Analyze the following school waste management data and generate NEW, unique recommendations:
    
                Current Metrics:
                - Monthly Waste Generation: 500 kg
                - Recycling Rate: 40% of total waste
                - Major Waste Sources: Paper, plastic bottles, and food packaging
                - Landfill Emissions: Moderate methane emissions due to waste disposal
    
                Generate 3 specific, actionable recommendations to improve waste management and recycling in the school.
                Format your response exactly like this:
    
                <strong>AI Recommendations:</strong><br>
                1. [First unique recommendation]<br>
                2. [Second unique recommendation]<br>
                3. [Third unique recommendation]<br>`,
    
        WaterUsage: `You are a water conservation expert. Analyze the following school water usage data and generate NEW, unique recommendations:
    
                Current Metrics:
                - Monthly Water Usage: 40,000 liters
                - Water Heating Contribution to Energy: 15% of total energy consumption
                - Average Flow Rate: High flow rates observed in sinks and showers
                - Major Usage Areas: Restrooms, science labs, and outdoor sports fields
    
                Generate 3 specific, actionable recommendations to improve water usage efficiency in the school.
                Format your response exactly like this:
    
                <strong>AI Recommendations:</strong><br>
                1. [First unique recommendation]<br>
                2. [Second unique recommendation]<br>
                3. [Third unique recommendation]<br>`
    }
    

    static async generateRecommendations(prompt) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            // Add specific formatting instructions
            const enhancedPrompt = `${prompt}
    
            IMPORTANT FORMATTING RULES:
            1. Do NOT use markdown formatting
            2. Do NOT use code blocks or backticks
            3. Do NOT include the word "html" in your response
            4. Keep recommendations short and specific
            5. Use ONLY the HTML tags shown in the example
            6. Each recommendation must end with <br>
            7. Start with <strong>AI Recommendations:</strong><br>`;
            
            const result = await model.generateContent({
                contents: [{ 
                    role: "user", 
                    parts: [{ text: enhancedPrompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 20,
                    topP: 0.8,
                    maxOutputTokens: 500,  // Reduced to encourage conciseness
                }
            });
    
            const response = await result.response;
            return response.text();
        } catch (error) {
            throw new Error(`Failed to generate AI recommendations: ${error.message}`);
        }
    }

    static extractDataFromMessage(message) {
        const data = {};
        const lines = message.split('<br>');
        
        lines.forEach(line => {
            const matches = line.match(/<strong>(.*?):<\/strong>(.*)/);
            if (matches) {
                const key = matches[1].trim().toLowerCase().replace(/\s+/g, '');
                const value = matches[2].trim();
                data[key] = value;
            }
        });
        
        return data;
    }

    static generatePrompt(category, data) {
        let prompt = this.categoryPrompts[category];
        
        // Replace placeholders with actual data
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            if (prompt.includes(placeholder)) {
                prompt = prompt.replace(placeholder, data[key]);
            }
        });
        
        return prompt;
    }

    static formatResponse(text) {
        try {
            // Remove markdown code blocks, backticks, curly braces, and unwanted characters
            let cleanText = text
                .replace(/```[^`]*```/g, '')    
                .replace(/`/g, '')              
                .replace(/html/g, '')           
                .replace(/[{}]/g, '')           // Remove any curly braces in the text
                .trim();
            
            // Ensure proper line breaks and clean any trailing punctuation
            cleanText = cleanText
                .replace(/\n/g, '')             
                .replace(/\.+(<br>)/g, '.<br>') 
                .replace(/(<br>)\.+/g, '<br>')  
                .replace(/[.,{}]+$/, '')        
                .trim()
                .replace(/}$/, '');             // Explicitly remove any trailing curly brace
                
            return {
                recommendations: cleanText,      // Add trailing comma here
            };
        } catch (error) {
            console.error('Error formatting response:', error);
            throw new Error('Failed to format recommendations');
        }
    }

    /*
    static async createCarbonBreakdown(data) {
        const params = {
            "energyusage_id": data.energyusage_id,
            "category": data.category,
            "percentage": data.percentage
        };

        const result = await this.query(`
            INSERT INTO EnergyBreakdown (energyusage_id, category, percentage)
            VALUES (@energyusage_id, @category, @percentage);
            SELECT SCOPE_IDENTITY() AS id;
        `, params);

        return result.recordset[0].id;
    }

    static async getBreakdownByCategory(energyUsageId, category) {
        const params = { "energyUsageId": energyUsageId, "category": category };
        const result = (await this.query(`
            SELECT * FROM EnergyBreakdown 
            WHERE energyusage_id = @energyUsageId AND category = @category
        `, params)).recordset;
        return result.length ? result.map((x) => this.toEnergyBreakdownObj(x)) : null;
    }

    static async getPercentageByCategory(energyUsageId) {
        const params = { "energyUsageId": energyUsageId };
        const result = (await this.query(`
            SELECT category, percentage FROM EnergyBreakdown 
            WHERE energyusage_id = @energyUsageId
        `, params)).recordset;
        return result.length ? result : null;
    }

    */
}

module.exports = CarbonBreakdown;
