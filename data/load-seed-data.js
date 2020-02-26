require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
const todos = require('./data.js');

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);
    try {
        await client.connect();
        
        await Promise.all(
            todos.map(todo => {
                return client.query(`
                    INSERT INTO todos (description, complete)
                    VALUES ($1, $2);
                    `,
                [todo.description, todo.complete]);
            })
        );
        console.log('LOAD SEED DATA complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
}