const express = require('express');
const db = require('../connections');
const FamilyRouter = express.Router();
const locations = require("../common/location");
const services = require("../common/service");


module.exports = FamilyRouter;


FamilyRouter.post("/family_create", (req,res)=>{
    console.log("creating family");

    //basic info
    const name =  req.body.create_name;
    const email =  req.body.create_email;
    const password =  req.body.create_password;
    const phone =  req.body.create_phone;
    const numMembers =  req.body.create_numMembers;
    const revenue =  req.body.create_avgRev;
    const language =  req.body.create_language;

    //for locations
    const location =  req.body.create_location;

    //for services
    const serv1 =  req.body.create_service1;
    const serv2 =  req.body.create_service2;
    const serv3 =  req.body.create_service3;

    console.log("email: " + email);
    console.log("password: " + password);
    console.log("phone: " + phone);

    db.query('SELECT * FROM user_account WHERE email = ?', [email], (err, rows) => {
        if (err){
            throw err;
        }else if(rows.length>0){
            res.send("family already exists");
        }else{
            console.log("family doesn't exist already");
            db.query('INSERT into user_account (email,type,password,phone) values (?,?,?,?)',[email,'Family',password,phone], (err,result) => {
                if (err){
                    console.log("error create user_account");
                    throw err;
                };
                const id = result.insertId;
                
                // create common cook profile
                db.query('INSERT into family (family_id,num_fam_member,avg_revenue_month, language, name) values (?,?,?,?,?)',[id,numMembers,revenue, language, name],(err,result) => {
                    if (err){
                        console.log("error creating family");
                        throw err;
                    }else{
                        console.log("new family and user id: " + id);
                        locations.AddLocation(location,"","",id);
                        services.AddService(serv1,serv2,serv3,id);
                        res.send("Done");
                    }
                })
            })
        }
    })
})

FamilyRouter.post("/family-request-help", (req,res)=>{
    const ngo_id =  req.body.get_ngo_id;
    const family_token = req.body.get_family_token;
    db.query("SELECT * FROM ngo WHERE id = ?",[ngo_id] ,(err,rows,fields)=>{
        if(err){
            console.log("failed to fetch ngo" + err);
            res.sendStatus(500);
            throw err;
        }else{
            db.query("INSERT into ngo_family_relation (ngo_id, family_id, status) values (?,?,?)", [ngo_id,family_token,"pending"], (err, result)=>{
                if (err){
                    console.log("error creating ngo_family_rel");
                    throw err;
                }else{
                    console.log("family request added: ");
                    res.send("Done");
                }
            });
        }
    });
})