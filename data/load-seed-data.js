require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
const todos = require('./data.js');

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);
    try {
        await client.connect();
        
        await client.query(`
            INSERT INTO users (email, hash)
            VALUES ($1, $2);
            `,
        ['hi@hello.com', 'abcdefghijkl']);

        await Promise.all(
            todos.map(todo => {
                return client.query(`
                    INSERT INTO todos (description, complete, user_id)
                    VALUES ($1, $2, $3);
                    `,
                [todo.description, todo.complete, todo.user_id]);
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