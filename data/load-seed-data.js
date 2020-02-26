const client = require('../lib/client');
const todos = require('./data.js');

run();

async function run() {
    try {
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