require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;

run();

async function run() {
    const client = new Client(process.env.DATABASE_URL);
    try {
        await client.connect();

        await client.query(`
            CREATE TABLE todos (
                id SERIAL PRIMARY KEY NOT NULL,
                description VARCHAR(512) NOT NULL,
                complete BOOLEAN NOT NULL DEFAULT FALSE
            );
        `);

        console.log('CREATE TABLES complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
}