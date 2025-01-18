const sql = require("mssql");
const dbConfig = require("../database/dbConfig");

class Event {
    constructor(id, school_id, name, description, date, carbonfootprint_id, energyusage_id) {
        this.id = id;
        this.school_id = school_id;
        this.name = name;
        this.description = description;
        this.date = date;
        this.carbonfootprint_id = carbonfootprint_id;
        this.energyusage_id = energyusage_id;
    }

    static toEventObj(row) {
        return new Event(
            row.id,
            row.school_id,
            row.name,
            row.description,
            row.date,
            row.carbonfootprint_id,
            row.energyusage_id
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

    static async getAllEvents() {
        const result = (await this.query("SELECT * FROM Events ORDER BY date DESC")).recordset;
        return result.length ? result.map((x) => this.toEventObj(x)) : null;
    }

    static async getEventById(id) {
        const params = { id };
        const result = (await this.query("SELECT * FROM Events WHERE id = @id", params)).recordset;
        return result.length ? this.toEventObj(result[0]) : null;
    }

    static async getEventsBySchool(school_id) {
        const params = { school_id };
        const result = (await this.query("SELECT * FROM Events WHERE school_id = @school_id", params)).recordset;
        return result.length ? result.map((x) => this.toEventObj(x)) : null;
    }

    static async createEvent(newEventData) {
        const params = {
            school_id: newEventData.school_id,
            name: newEventData.name,
            description: newEventData.description,
            date: newEventData.date,
            carbonfootprint_id: newEventData.carbonfootprint_id,
            energyusage_id: newEventData.energyusage_id,
        };
        const result = await this.query(
            `INSERT INTO Events (school_id, name, description, date, carbonfootprint_id, energyusage_id)
            VALUES (@school_id, @name, @description, @date, @carbonfootprint_id, @energyusage_id);
            SELECT SCOPE_IDENTITY() AS id;`,
            params
        );
        const newId = result.recordset[0].id;
        return await this.getEventById(newId);
    }

    static async updateEvent(id, newEventData) {
        const params = {
            id,
            name: newEventData.name,
            description: newEventData.description,
            date: newEventData.date,
            carbonfootprint_id: newEventData.carbonfootprint_id,
            energyusage_id: newEventData.energyusage_id,
        };
        await this.query(
            `UPDATE Events
            SET name = @name, description = @description, date = @date, carbonfootprint_id = @carbonfootprint_id, energyusage_id = @energyusage_id
            WHERE id = @id`,
            params
        );
        return await this.getEventById(id);
    }

    static async deleteEvent(id) {
        const params = { id };
        await this.query("DELETE FROM Events WHERE id = @id", params);
    }

    static async getPastEvents() {
        const result = (await this.query("SELECT * FROM Events WHERE date <= GETDATE() ORDER BY date DESC")).recordset;
        return result.length ? result.map((x) => this.toEventObj(x)) : null;
    }

    static async getFutureEvents() {
        const result = (await this.query("SELECT * FROM Events WHERE date > GETDATE() ORDER BY date ASC")).recordset;
        return result.length ? result.map((x) => this.toEventObj(x)) : null;
    }
}

module.exports = Event;
