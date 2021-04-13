// local strategies for logging in / registering
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require("../../../connections");
const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 8;

// Cook register with email
passport.use('ngo-register-email', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        //passReqToCallback: true   // uncomment this to access req in the callback (possibly to get other attributes from req.body)
    },
    (email, password, done) => {
        db.ngoEmailExists(email, (err, emailUsed) => {
            if (err) return done(err);
            if (emailUsed)
                return done(null, false, { message: 'Email address already used!' });
            else {
                // since email is not used, we can create the Cook account
                // using bcrypt to hash the password
                //email,pass,name,phone,numBene, done
                bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then(async hashedPassword => {
                    db.ngoRegisterEmail(email, hashedPassword, 'ngo', ' ', 0 , (err, id) => {
                        if (err) return done(err);
                        return done(null, id);
                    });
                }).catch(err => {return done(err);})
            }
        });
    }
));

// Cook register with email and phone
passport.use('ngo-register-email-phone', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,   // uncomment this to access req in the callback (possibly to get other attributes from req.body)
    },
    (req, email, password, done) => {
        db.ngoEmailExists(email, (err, emailUsed) => {
            if (err) return done(err);
            if (emailUsed)
                return done(null, false, { message: 'email_used' });
            else {
                let name = req.body.name, phone = req.body.phone;
                let numBene=req.body.number_of_beneficiaries;
                if (!name || !phone || !numBene )
                    return done(null, false, {message: 'missing_credentials'});
                
                else {
                    // since email and phone are not used, we can create the Cook account
                    // using bcrypt to hash the password
                    bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then(async hashedPassword => {
                        db.ngoRegister(email, phone, hashedPassword, name,numBene, (err, id) => {
                            if (err) return done(err);
                            return done(null, id);
                        });
                    }).catch(err => { return done(err); })
                }
                
            }
        });
    }
));
