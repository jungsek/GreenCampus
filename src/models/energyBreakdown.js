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
        Lighting: `Based on these lighting metrics:
            - Average Daily Use: 12 hours
            - After-Hours Use: Hallway and lobby lights remain on 2 hours past school hours.
            
            Provide energy efficiency recommendations in exactly this format (include the HTML tags):

            RECOMMENDATIONS:
            1. Consider replacing the remaining 20% of non-LED fixtures with LEDs to further reduce energy consumption.<br>
            2. Upgrade motion sensors to cover 90% of rooms for improved efficiency.<br>
            3. Ensure that lights are dimmed during non-peak hours for all rooms, especially in less-used areas.`,

        HVAC: `Based on this HVAC system data:
            - Daily Operating Hours: 16 hours
            - Monthly Energy Usage: 1500 kWh
            - Average Temperature: 23 °C
            - Peak Demands: Heating demand reaches 65 kW and cooling peaks at 50 kW.
            
            Provide energy efficiency recommendations in exactly this format (include the HTML tags):

            RECOMMENDATIONS:
            1. Upgrade to more efficient heating and cooling units.<br>
            2. Install smart thermostats for better temperature control.<br>
            3. Implement regular maintenance checks to optimize performance.<br>`,

        Refrigeration: `Based on the Refrigeration metrics:
            - Monthly Energy Usage: 180 kWh
            - Temperature Control: 4°C for refrigeration, -18°C for freezing
            - Usage Patterns: Doors opened 12-30 times per day, increasing cooling demand.
            Provide energy efficiency recommendations in exactly this format (include the HTML tags):
            RECOMMENDATIONS:
            1. Ensure refrigeration doors are only opened when necessary to avoid energy spikes.<br>
            2. Replace older units with newer, more efficient models to reduce consumption further.<br>
            3. Monitor the performance of refrigeration units and adjust settings based on usage patterns to optimize energy use.<br>`,
        
        Computers: `Based on these computer usage metrics:
            - Average Daily Usage: Computers are actively used for 6 hours daily.
            - Power Consumption: Desktops consume 120W per unit, laptops 50W.
            - Standby Power Use: Standby modes activate after 15 minutes of inactivity, covering 90% of devices.
            - Total Lab Consumption: Computer labs consume around 300 kWh monthly.
            
            Provide energy efficiency recommendations in exactly this format (include the HTML tags):

            RECOMMENDATIONS:
            1. Encourage users to fully shut down desktops after use, especially for extended periods.<br>
            2. Consider upgrading to energy-efficient computers or laptops to further reduce consumption.<br>
            3. Set up automated shutdowns after a certain period of inactivity across all devices.<br>`,
    
        Equipment: `Based on this equipment usage data:
            - Average Operating Hours: 5 hours daily, primarily during lab activities.
            - Energy Consumption: Equipment accounts for approximately 10% of total energy use, varying by type and lab schedule.
            - Usage Peaks: High usage during lab hours, minimal at other times.
            - Automation Coverage: Energy-saving automation is applied to reduce idle consumption.
            - Maintenance Schedule: Equipment is serviced bimonthly to maintain efficient operation.
            
            Provide energy efficiency recommendations in exactly this format (include the HTML tags):
    
            RECOMMENDATIONS:
            1. Extend the use of energy-saving automation to cover all lab equipment, ensuring idle times are minimized.<br>
            2. Upgrade older equipment to energy-efficient models.<br>
            3. Encourage users to shut off equipment when not in use for extended periods to prevent unnecessary consumption.<br>`,
    
        Appliances: `Based on this appliance usage data:
            - Average Daily Use: Common appliances are used for about 3 hours daily.
            - Energy Consumption: Energy-efficient models contribute to a 15% reduction in power use.
            - Total Monthly Usage: Appliances consume around 200 kWh monthly across all units.
            
            Provide energy efficiency recommendations in exactly this format (include the HTML tags):
    
            RECOMMENDATIONS:
            1. Continue to replace older appliances with newer, energy-efficient models.<br>
            2. Set timers for appliances that are frequently used for short periods to limit energy consumption.<br>
            3. Ensure that all appliances are in power-saving modes when not in use.<br>`,
    
        FoodWasteManagement: `Based on this food waste management data:
            - Average Waste Generated: About 30kg of food waste per week, with regular disposal and composting.
            - Daily Disposal Frequency: Waste bins are emptied daily, compost bins weekly.
            - Energy Use in Waste Management: Minimal direct energy use; disposal and composting are primarily manual processes.
            
            Provide energy efficiency recommendations in exactly this format (include the HTML tags):
    
            RECOMMENDATIONS:
            1. Encourage waste reduction efforts, such as better portion control, to reduce the overall food waste generated.<br>
            2. Increase the frequency of compost bin collections during peak waste generation times.<br>
            3. Explore energy-efficient ways of processing organic waste, such as using solar-powered composting systems.<br>`
    };

    static async generateRecommendations(prompt) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            throw new Error(`Failed to generate AI recommendations: ${error.message}`);
        }
    }

    static generatePrompt(category, data) {
        let prompt = this.categoryPrompts[category];
        
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            if (prompt.includes(placeholder)) {
                prompt = prompt.replace(placeholder, data[key]);
            }
        });
        
        return prompt + "\n\nRemember to format the response exactly as shown above, including the <br> tags after each recommendation.";
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

    static formatResponse(text) {
        try {
            // Extract recommendations
            let recommendations = text.split('RECOMMENDATIONS:')[1]
                ?.trim() || '';
                

            // Clean up recommendations if needed
            if (!recommendations.includes('<br>')) {
                recommendations = recommendations
                    .split('\n')
                    .filter(line => line.trim().match(/^\d+\./))
                    .join('<br>');
            }

            // Format the final response
            return {
                recommendations: recommendations ? 
                    `<strong>AI Recommendations:</strong><br>${recommendations}` : '',

            };
        } catch (error) {
            console.error('Error formatting response:', error);
            throw new Error('Failed to format recommendations');
        }
    }
}
module.exports = EnergyBreakdown;
