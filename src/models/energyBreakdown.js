// models/energyBreakdown.js
const sql = require("mssql");
const dbConfig = require("../database/dbConfig");

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

    
}

module.exports = EnergyBreakdown;
