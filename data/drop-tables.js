const client = require('../lib/client');

run();

async function run() {
    try {
        await client.connect();

        await clearInterval.query(`
            DROP TABLE IF EXISTS todos
        `);

        console.log('DROP TABLES complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
}