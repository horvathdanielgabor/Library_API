require('dotenv').config({url: __dirname + '/../.env'});

var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit:        process.env.DB_CONN_LIMIT,
    host:                   process.env.DB_HOST,
    user:                   process.env.DB_USER,
    password:               process.env.DB_PASS,
    port:                   process.env.DB_PORT,
    database:               process.env.DB_NAME,
    timezone:               process.env.DB_TIMEZONE
});

function query(sql, params, callback){

    if (typeof params === 'function'){
        callback = params;
        params = [];
    }

    pool.query(sql, params, (err, results) => {
        if (err){
            return callback(err, null);
        }
        return callback(null, results);
    });
}

module.exports = { query };