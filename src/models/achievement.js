const sql = require("mssql")
const dbConfig = require("../database/dbConfig")


class Achievement {
    constructor(achievement_id, name, category, description, target_value, points) {
        this.achievement_id = achievement_id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.target_value = target_value;
        this.points = points;
    }

    static toAchievementObj(row) {
        return new Achievement(
            row.achievement_id,  
            row.name,
            row.category,
            row.description,
            row.target_value,
            row.points
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

    static async getAllAchievements() {
        const result = (await this.query("SELECT * FROM Achievements")).recordset;
        return result.length ? result.map((x) => this.toAchievementObj(x)) : null;
    }

    static async getAchievementById(id){
        const params = {"id": id}
        const result = (await this.query(
            "SELECT * FROM Achievements WHERE achievement_id = @achievement_id", 
            params
        )).recordset
        return result ? this.toAchievementObj(result) : null
    }

    static async createAchievement(newAchievementData){ {
        const params = {
            "achievement_id": newAchievementData.achievement_id,
            "name": newAchievementData.name,
            "category": newAchievementData.category,
            "description": newAchievement.description,
            "target_value": newAchievementData.target_value,
            "points": newAchievementData.points,
        }
        const result = await this.query(`
            INSERT INTO Achievements (name, category, description, target_value, points)
            VALUES (@name, @description, @target_value, @points);
            SELECT SCOPE_IDENTITY() AS achievement_id;
        `, params)
        const newId = result.recordset[0].id
        return await this.getAchievementById(newId)
        }
    }

    static async updateAchievement(id, newAchievementData) {
        const params = {
            "achievement_id": newAchievementData.achievement_id,
            "name": newCampaignData.name,
            "category": newAchievementData.category,
            "description": newCampaignData.description,
            "target_value": newAchievementData.target_value,
            "points": newAchievementData.points,
        }
        await this.query(`
            UPDATE Achievements
            SET name = @name, category = @category, description = @description, target_value = @target_value, points = @points
            WHERE achievement_id = @achievement_id
        `, params)
        return await this.getAchievementById(id)
    }

    static async deleteAchievement(id) {
        const params = {"achievement_id": achievement_id}
        await this.query("DELETE FROM Achievements WHERE achievement_id = @achievement_id", params)
    }
}

module.exports = Achievement;