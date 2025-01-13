
const sql = require("mssql");
const dbConfig = require("../database/dbConfig");

class CarbonBreakdown {
    constructor(id, carbonfootprint_id, category, timestamp, percentage) {
        this.id = id;
        this.carbonfootprint_id = carbonfootprint_id;
        this.category = category;
        this.timestamp = timestamp;
        this.percentage = percentage;
    }

    static toCarbonBreakdownObj(row) {
        return new CarbonBreakdown(
            row.id,
            row.carbonfootprint_id,
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
