const express = require("express");
const router = express.Router();
const { databaseConnection } = require("../db/database");

// GET /tasks
router.get("/", (request, response) => {
    const filter = request.query.filter || "all";
    const page = request.query.page || 1;
    const limit = request.query.limit || 5;
    const offset = (page - 1) * limit;

    let whereClause = "";
    if (filter === "active") {
        whereClause = "WHERE completed = 0";
    } else if (filter === "completed") {
        whereClause = "WHERE completed = 1";
    }

    const countQuery = `SELECT COUNT(*) as total FROM tasks ${whereClause}`;
    const dataQuery = `SELECT * FROM tasks ${whereClause} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

    databaseConnection.get(countQuery, (countError, countRow) => {
        if (countError) {
            return response.status(500).json({ error: countError.message });
        }
        databaseConnection.all(dataQuery, (dataError, rows) => {
            if (dataError) {
                return response.status(500).json({ error: dataError.message });
            }
            response.json({
                tasks: rows,
                total: countRow.total,
                page: Number(page),
                limit: Number(limit)
            });
        });
    });
});

// POST /tasks
router.post("/", (request, response) => {
    const body = request.body;
    const text = body.text;
    const completed = body.completed ? 1 : 0;

    const insertQuery = `INSERT INTO tasks (text, completed) VALUES ('${text}', ${completed})`;

    databaseConnection.run(insertQuery, function (error) {
        if (error) {
            return response.status(500).json({ error: error.message });
        }
        const selectQuery = `SELECT * FROM tasks WHERE id = ${this.lastID}`;
        databaseConnection.get(selectQuery, (selectError, row) => {
            if (selectError) {
                return response.status(500).json({ error: selectError.message });
            }
            response.status(201).json(row);
        });
    });
});

// DELETE /tasks/completed  — должен быть ДО /:id
router.delete("/completed", (request, response) => {
    const deleteQuery = `DELETE FROM tasks WHERE completed = 1`;
    databaseConnection.run(deleteQuery, function (error) {
        if (error) {
            return response.status(500).json({ error: error.message });
        }
        response.json({ deleted: this.changes });
    });
});

// PATCH /tasks/:id
router.patch("/:id", (request, response) => {
    const taskId = request.params.id;
    const body = request.body;

    const selectQuery = `SELECT * FROM tasks WHERE id = ${taskId}`;
    databaseConnection.get(selectQuery, (selectError, existingRow) => {
        if (selectError) {
            return response.status(500).json({ error: selectError.message });
        }
        if (!existingRow) {
            return response.status(404).json({ error: "Task not found" });
        }

        const newText = body.text !== undefined ? body.text : existingRow.text;
        const newCompleted = body.completed !== undefined ? (body.completed ? 1 : 0) : existingRow.completed;

        const updateQuery = `UPDATE tasks SET text = '${newText}', completed = ${newCompleted} WHERE id = ${taskId}`;
        databaseConnection.run(updateQuery, function (updateError) {
            if (updateError) {
                return response.status(500).json({ error: updateError.message });
            }
            const refreshQuery = `SELECT * FROM tasks WHERE id = ${taskId}`;
            databaseConnection.get(refreshQuery, (refreshError, updatedRow) => {
                if (refreshError) {
                    return response.status(500).json({ error: refreshError.message });
                }
                response.json(updatedRow);
            });
        });
    });
});

// DELETE /tasks/:id
router.delete("/:id", (request, response) => {
    const taskId = request.params.id;
    const deleteQuery = `DELETE FROM tasks WHERE id = ${taskId}`;
    databaseConnection.run(deleteQuery, function (error) {
        if (error) {
            return response.status(500).json({ error: error.message });
        }
        if (this.changes === 0) {
            return response.status(404).json({ error: "Task not found" });
        }
        response.json({ deleted: taskId });
    });
});

module.exports = router;