const express = require("express");
const path = require("path");
const tasksRouter = require("./routes/tasks");
const { initializeDatabase } = require("./db/database");

const PORT = 3000;
const application = express();

application.use(express.json());
application.use(express.urlencoded({ extended: true }));

application.use((request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
    if (request.method === "OPTIONS") {
        return response.sendStatus(200);
    }
    next();
});

application.use(express.static(path.join(__dirname, "public")));

application.use("/tasks", tasksRouter);

initializeDatabase(() => {
    application.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});