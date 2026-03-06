const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DATABASE_PATH = path.join(__dirname, "todo.db");

const databaseConnection = new sqlite3.Database(DATABASE_PATH, (error) => {
    if (error) {
        console.error("Error opening database:", error.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

function initializeDatabase(callback) {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT,
            completed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    databaseConnection.run(createTableQuery, (error) => {
        if (error) {
            console.error("Error creating table:", error.message);
        } else {
            console.log("Database initialized.");
            callback();
        }
    });
}

module.exports = { databaseConnection, initializeDatabase };