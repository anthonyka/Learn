const express = require('express');
const db = require('../connections');
const SchoolRouter = express.Router();
const locations = require("../common/location");


module.exports = SchoolRouter;


SchoolRouter.post("/school_create", (req,res)=>{
    console.log("creating school");

    //basic info
    const name =  req.body.create_name;
    const email =  req.body.create_email;
    const password =  req.body.create_password;
    const phone =  req.body.create_phone;

    //for locations
    const location =  req.body.create_location;

    console.log("email: " + email);
    console.log("password: " + password);
    console.log("phone: " + phone);

    db.query('SELECT * FROM user_account WHERE email = ?', [email], (err, rows) => {
        if (err){
            throw err;
        }else if(rows.length>0){
            res.send("school already exists");
        }else{
            console.log("school doesn't exist already");
            db.query('INSERT into user_account (email,type,password,phone) values (?,?,?,?)',[email,'school',password,phone], (err,result) => {
                if (err){
                    console.log("error create user_account");
                    throw err;
                };
                const id = result.insertId;
                
                // create common cook profile
                db.query('INSERT into school (school_id,name) values (?,?)',[id, name],(err,result) => {
                    if (err){
                        console.log("error create school");
                        throw err;
                    }else{
                        console.log("new school and user id: " + id);
                        locations.AddLocation(location,"","",id);
                        res.send("Done");
                    }
                })
            })
        }
    })
})


 