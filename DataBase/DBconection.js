const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'Ptomontt507',
    database: 'softjobs',
    allowExitOnIdle: true

})

async function connectDB(){
    const result = await pool.query('SELECT NOW()')
    const hora = result.rows[0].now
    return hora
}

module.exports = {connectDB, pool}
