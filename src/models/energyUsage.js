// models/energyUsage.js
const sql = require("mssql");
const dbConfig = require("../database/dbConfig");

class EnergyUsage {
    constructor(id, school_id, month, energy_kwh, avg_temperature_c, timestamp) {
        this.id = id;
        this.school_id = school_id;
        this.month = month;
        this.energy_kwh = energy_kwh;
        this.avg_temperature_c = avg_temperature_c;
        this.timestamp = timestamp;
    }

    static toEnergyUsageObj(row) {
        return new EnergyUsage(
            row.id,
            row.school_id,
            row.month,
            row.energy_kwh,
            row.avg_temperature_c,
            row.timestamp
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

    static async getAllEnergyUsage() {
        const result = (await this.query("SELECT * FROM EnergyUsage")).recordset;
        return result.length ? result.map((x) => this.toEnergyUsageObj(x)) : null;
    }

    static async getEnergyUsageBySchool(schoolId) {
        const params = { "schoolId": schoolId };
        const result = (await this.query(
            "SELECT * FROM EnergyUsage WHERE school_id = @schoolId ORDER BY timestamp DESC",
            params
        )).recordset;
        return result.length ? result.map((x) => this.toEnergyUsageObj(x)) : null;
    }

    static async createEnergyUsage(data) {
        const params = {
            "school_id": data.school_id,
            "month": data.month,
            "energy_kwh": data.energy_kwh,
            "avg_temperature_c": data.avg_temperature_c,
            "timestamp": new Date()
        };

        const result = await this.query(`
            INSERT INTO EnergyUsage (school_id, month, energy_kwh, avg_temperature_c, timestamp)
            VALUES (@school_id, @month, @energy_kwh, @avg_temperature_c, @timestamp);
            SELECT SCOPE_IDENTITY() AS id;
        `, params);

        return result.recordset[0].id;
    }

    static async getMonthlyEnergyUsage(schoolId, year) {
        const params = { "schoolId": schoolId, "year": year };
        const result = (await this.query(`
            SELECT month, energy_kwh, avg_temperature_c
            FROM EnergyUsage
            WHERE school_id = @schoolId 
            AND YEAR(timestamp) = @year
            ORDER BY timestamp
        `, params)).recordset;
        return result.length ? result : null;
    }

    static async getAvailableYears(schoolId) {
        const params = { "schoolId": schoolId };
        const result = await this.query(`
            SELECT DISTINCT YEAR(timestamp) as year
            FROM EnergyUsage
            WHERE school_id = @schoolId
            ORDER BY year DESC
        `, params);
        return result.recordset.map(row => row.year);
    }
}

module.exports = EnergyUsage;