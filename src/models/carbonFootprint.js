// models/carbonFootprint.js
const sql = require("mssql")
const dbConfig = require("../database/dbConfig")
const fs = require("fs");

class CarbonFootprint {
    constructor(id, school_id, total_carbon_tons, timestamp) {
        this.id = id;
        this.school_id = school_id;
        this.total_carbon_tons = total_carbon_tons;
        this.timestamp = timestamp;
    }

    static toCarbonFootprintObj(row) {
        return new CarbonFootprint(
            row.id, 
            row.school_id, 
            row.total_carbon_tons, 
            row.timestamp
        )
    }

    static async query(queryString, params) {
        const connection = await sql.connect(dbConfig);
        const request = connection.request();

        if (params) {
            for (const [key, value] of Object.entries(params)) {
                request.input(key, value)
            }
        }
        const result = await request.query(queryString);

        connection.close();
        return result
    }

    static async exceptSelectQuery(columnExclude, queryString, params) {
        let sql = `
        SELECT * INTO #TempTable
        FROM (${queryString}) AS a
        `
        columnExclude.forEach(e => {
            sql += `
                ALTER TABLE #TempTable
                DROP COLUMN ${e}
                `
        });
        sql += "SELECT * FROM #TempTable"
        const result = await this.query(sql, params)
        await this.query("IF OBJECT_ID('#TempTable', 'U') IS NOT NULL DROP TABLE #TempTable")
        return result
    }

    static async getAllCarbonFootprints() {
        const result = (await this.query("SELECT * FROM CarbonFootprint ORDER BY timestamp DESC")).recordset
        return result.length ? result.map((x) => this.toCarbonFootprintObj(x)) : null
    }

    static async getCarbonFootprintById(id) {
        const params = {"id": id}
        const result = (await this.query("SELECT * FROM CarbonFootprint WHERE id = @id", params)).recordset[0]
        return result ? this.toCarbonFootprintObj(result) : null
    }

    static async getCarbonFootprintsBySchool(school_id) {
        const params = {"school_id": school_id}
        const result = (await this.query(
            "SELECT * FROM CarbonFootprint WHERE school_id = @school_id ORDER BY timestamp DESC", 
            params
        )).recordset
        return result.length ? result.map((x) => this.toCarbonFootprintObj(x)) : null
    }

    static async getYearlyCarbonFootprint(school_id, year) {
        const params = {
            "school_id": school_id,
            "year": year
        }
        const result = (await this.query(`
            SELECT id, school_id, total_carbon_tons, timestamp
            FROM CarbonFootprint
            WHERE school_id = @school_id 
            AND YEAR(timestamp) = @year
            ORDER BY timestamp
        `, params)).recordset
        return result.length ? result.map((x) => this.toCarbonFootprintObj(x)) : null
    }

    static async createCarbonFootprint(school_id, total_carbon_tons) {
        const params = {
            "school_id": school_id,
            "total_carbon_tons": total_carbon_tons,
            "timestamp": new Date()
        }
        const result = await this.query(`
            INSERT INTO CarbonFootprint (school_id, total_carbon_tons, timestamp)
            VALUES (@school_id, @total_carbon_tons, @timestamp);
            SELECT SCOPE_IDENTITY() AS id;
        `, params)
        const newId = result.recordset[0].id
        return await this.getCarbonFootprintById(newId)
    }

    static async updateCarbonFootprint(id, total_carbon_tons) {
        const params = {
            "id": id,
            "total_carbon_tons": total_carbon_tons
        }
        await this.query(`
            UPDATE CarbonFootprint 
            SET total_carbon_tons = @total_carbon_tons
            WHERE id = @id
        `, params)
        return await this.getCarbonFootprintById(id)
    }

    static async deleteCarbonFootprint(id) {
        const params = {"id": id}
        await this.query("DELETE FROM CarbonFootprint WHERE id = @id", params)
    }
}

module.exports = CarbonFootprint;