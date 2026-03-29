const { pool } = require('./backend/config/db');

async function test() {
    try {
        const res = await pool.query('SELECT * FROM product_categories');
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
test();
