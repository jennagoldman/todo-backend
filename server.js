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

// Auth Routes
const createAuthRoutes = require('./lib/auth/create-auth-routes');

const authRoutes = createAuthRoutes({
    selectUser(email) {
        return client.query(`
            SELECT id, email, hash
            FROM users
            WHERE email = $1;
            `,
        [email]
        ).then(result => result.rows[0]);
    },
    insertUser(user, hash) {
        return client.query(`
        INSERT INTO users (email, hash)
        VALUES ($1, $2)
        RETURNING id, email;
        `,
        [user.email, hash]
        ).then(result => result.rows[0]);
    }
});

app.use('/api/auth', authRoutes);

const ensureAuth = require('./lib/auth/ensure-auth');

app.use('/api', ensureAuth);

// API Endpoints
// Get all to-dos
app.get('/api/todos', async(req, res) => {
    try {
        const result = await client.query(`
            SELECT *
            FROM todos
            WHERE user_id = $1
            ORDER BY id ASC
        `, 
        [req.userId]
        );
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
            INSERT INTO todos (description, complete, user_id)
            VALUES ($1, $2, $3)
            RETURNING *;
        `,
        [req.body.description, false, req.userId]
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
                AND user_id = $2
        `,
        [req.body.complete, req.userId]);
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