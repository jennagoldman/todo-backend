require('dotenv').config();

// Server dependencies:
const express = require('express');
const server = express();
const cors = require('cors');
const morgan = require('morgan');
const pg = require('pg');
const Client = pg.Client;
const client = new Client(process.env.DATABASE_URL);
client.connect();

// Server Setup
const app = express();
const PORT = process.env.PORT;

app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoints
// Get all to-dos
app.get('/api/todos', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM todos
        `);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({
            error: err.message || err
        });
    }
});

// Add a new to-do
app.post('/api/todos', async(req, res) => {
    try {
        const result = await client.query(`
            INSERT INTO todos (description, complete)
            VALUES ($1, $2)
            RETURNING *;
        `,
        [req.body.description, false]
        );
        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// Update an existing to-do
app.put('/api/todo/:id', async(req, res) => {
    try {
        const result = await client.query(`
            UPDATE todos
            SET complete = $1
            WHERE id = ${req.params.id}
        `,
        [req.body.complete]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// Delete a to-do
app.delete('/api/todo/:id', async(req, res) => {
    try {
        const result = await client.query(`
            DELETE from todos
            WHERE id = ${req.params.id}
            RETURNING *    
        `);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});

module.exports = { server };