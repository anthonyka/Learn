const mysql = require('mysql');

//create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wasle'
  });

//connect to MySQL
db.connect(err => {
    if(err){
        throw err;
    }
    console.log('MySQL connected');
});

module.exports = db;

//general function used locally
function emailExists(email,type,done) {
    db.query('SELECT * FROM user_account WHERE email = ? AND type = ?', [email, type], (err, rows) => {
        if (err) return done(err);
        return done(null, rows.length > 0);
    })
}
