// models/energyBreakdown.js
const sql = require("mssql");
const dbConfig = require("../database/dbConfig");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class EnergyBreakdown {
    constructor(id, energyusage_id, location, category, timestamp, percentage) {
        this.id = id;
        this.energyusage_id = energyusage_id;
        this.location = location;
        this.category = category;
        this.timestamp = timestamp;
        this.percentage = percentage;
    }

    static toEnergyBreakdownObj(row) {
        return new EnergyBreakdown(
            row.id,
            row.energyusage_id,
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

    static async getAllEnergyBreakdown() {
        const result = (await this.query("SELECT * FROM EnergyBreakdown")).recordset;
        return result.length ? result.map((x) => this.toEnergyBreakdownObj(x)) : null;
    }

    static async getEnergyBreakdownByUsage(energyUsageId) {
        const params = { "energyUsageId": energyUsageId };
        const result = (await this.query(
            "SELECT * FROM EnergyBreakdown WHERE energyusage_id = @energyUsageId",
            params
        )).recordset;
        return result.length ? result.map((x) => this.toEnergyBreakdownObj(x)) : null;
    }

    static async getEnergyBreakdownBySchool(schoolId) {
        const params = { "schoolId": schoolId };
        const result = await this.query(`
            SELECT eb.*
            FROM EnergyBreakdown eb
            JOIN EnergyUsage eu ON eb.energyusage_id = eu.id
            WHERE eu.school_id = @schoolId
        `, params);

        return result.recordset.length ? result.recordset.map((x) => this.toEnergyBreakdownObj(x)) : null;
    }

    static async getEnergyBreakdownPerYearBySchool(schoolId, year) {
        const params = { schoolId, year };
        const result = await this.query(`
            SELECT 
                EB.location, 
                EB.category, 
                EB.percentage, 
                EU.[month] AS month
            FROM EnergyBreakdown EB
            JOIN EnergyUsage EU ON EB.energyusage_id = EU.id
            WHERE EU.school_id = @schoolId AND YEAR(EU.timestamp) = @year
            ORDER BY EU.timestamp
        `, params);
        return result.recordset.map(row => ({
            location: row.location,
            category: row.category,
            percentage: row.percentage,
            month: row.month
        }));
    }
    
    static async createEnergyBreakdown(data) {
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

    static categoryPrompts = {
        Lighting: `You are an energy efficiency expert. Analyze the following lighting data and generate NEW, unique recommendations:
    
            Current Metrics:
            - Average Daily Use: 10 hours
            - After-Hours Use: Hallway and lobby lights remain on 2 hours past school hours
            
            Generate 3 specific, actionable recommendations to improve energy efficiency.
            Format your response exactly like this:
    
            <strong>AI Recommendations:</strong><br>
            1. [First unique recommendation]<br>
            2. [Second unique recommendation]<br>
            3. [Third unique recommendation]<br>`,
    
        HVAC: `You are an energy efficiency expert. Analyze the following HVAC data and generate NEW, unique recommendations:
    
            Current Metrics:
            - Daily Operating Hours: 18 hours
            - Monthly Energy Usage: 1,500 kWh
            - Average Temperature: 22°C
            - Peak Demands: Heating demand reaches 65 kW and cooling peaks at 50 kW
            
            Generate 3 specific, actionable recommendations to improve HVAC efficiency.
            Format your response exactly like this:
    
            <strong>AI Recommendations:</strong><br>
            1. [First unique recommendation]<br>
            2. [Second unique recommendation]<br>
            3. [Third unique recommendation]<br>`,
    
        Refrigeration: `You are an energy efficiency expert. Analyze the following refrigeration data and generate NEW, unique recommendations:
    
            Current Metrics:
            - Monthly Energy Use: 180 kWh
            - Temperature Control: 4°C for refrigeration, -18°C for freezing
            - Usage Patterns: Doors opened 12-30 times per day
            
            Generate 3 specific, actionable recommendations to improve efficiency.
            Format your response exactly like this:
    
            <strong>AI Recommendations:</strong><br>
            1. [First unique recommendation]<br>
            2. [Second unique recommendation]<br>
            3. [Third unique recommendation]<br>`,
    
        Computers: `You are an energy efficiency expert. Analyze the following computer usage data and generate NEW, unique recommendations:
    
            Current Metrics:
            - Average Daily Usage: 6 hours
            - Power Consumption: Desktops consume 120W per unit, laptops 50W
            - Standby Power Use: 15 minutes inactivity threshold, 90% coverage
            - Monthly Lab Consumption: 300 kWh
            
            Generate 3 specific, actionable recommendations to improve efficiency.
            Format your response exactly like this:
    
            <strong>AI Recommendations:</strong><br>
            1. [First unique recommendation]<br>
            2. [Second unique recommendation]<br>
            3. [Third unique recommendation]<br>`,
    
        Equipment: `You are an energy efficiency expert. Analyze the following equipment data and generate NEW, unique recommendations:
    
            Current Metrics:
            - Operating Hours: 5 hours daily
            - Energy Consumption: 10% of total energy use
            - Usage Pattern: Peak during lab hours
            - Maintenance: Bimonthly servicing
            
            Generate 3 specific, actionable recommendations to improve efficiency.
            Format your response exactly like this:
    
            <strong>AI Recommendations:</strong><br>
            1. [First unique recommendation]<br>
            2. [Second unique recommendation]<br>
            3. [Third unique recommendation]<br>`,
    
        Appliances: `You are an energy efficiency expert. Analyze the following appliance data and generate NEW, unique recommendations:
    
            Current Metrics:
            - Daily Usage: 3 hours
            - Energy Efficiency: 15% reduction from efficient models
            - Monthly Usage: 200 kWh
            
            Generate 3 specific, actionable recommendations to improve efficiency.
            Format your response exactly like this:
    
            <strong>AI Recommendations:</strong><br>
            1. [First unique recommendation]<br>
            2. [Second unique recommendation]<br>
            3. [Third unique recommendation]<br>`,
    
        FoodWasteManagement: `You are an energy efficiency expert. Analyze the following waste management data and generate NEW, unique recommendations:
    
            Current Metrics:
            - Weekly Waste: 30kg
            - Disposal: Daily bin emptying, weekly composting
            - Energy Usage: Minimal, mostly manual processes
            
            Generate 3 specific, actionable recommendations to improve efficiency.
            Format your response exactly like this:
    
            <strong>AI Recommendations:</strong><br>
            1. [First unique recommendation]<br>
            2. [Second unique recommendation]<br>
            3. [Third unique recommendation]<br>`
    };

    static async generateRecommendations(prompt) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            
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
}
module.exports = EnergyBreakdown;
