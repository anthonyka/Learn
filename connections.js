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

// returns the cook ID
module.exports.ngoRegisterEmail = function ngoRegisterEmail(email,pass,name,phone,numBene, done) {
    // create account
    db.query('INSERT into user_account (email,type,password,phone) values (?,?,?)',[email,'NGO',pass,phone], (err,result) => {
        if (err) return done(err);
        const id = result.insertId;
        
        // create common cook profile
        db.query('INSERT into ngo (id,number_of_beneficiaries,name) values (?,?,?)',[id,numBene, name],(err,result) => {
            if (err) return done(err);
            return done(null,id);
        })
    })
}

// returns 1 if cook account with email exists; else 0
module.exports.ngoEmailExists = function ngoEmailExists(email,done) {
    return emailExists(email,'NGO',done);
}

// returns the cook ID
module.exports.ngoRegister = function ngoRegister(email,phone,pass,name,numBene, done) {
    // create account
    db.query('INSERT into user_account (email,phone,type,password) values (?,?,?,?)',[email,phone,'NGO',pass], (err,result) => {
        if (err) return done(err);
        const id = result.insertId;
        
        
        // create common cook profile
        db.query('INSERT into ngo (id,number_of_beneficiaries,name) values (?,?,?)',[id,numBene, name],(err,result) => {
            if (err) return done(err);
            return done(null,id);
        })
    })
}
