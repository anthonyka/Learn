const express = require('express');
const db = require('../../connections');
const NGOrouter = express.Router();
const locations = require("../../common/location");
const services= require("../../common/service");
const async = require ('async');
const util = require('util');

module.exports = NGOrouter;


NGOrouter.post("/ngo_create", (req,res)=>{
    console.log("creating ngo");

    //basic info
    const name =  req.body.create_name;
    const email =  req.body.create_email;
    const password =  req.body.create_password;
    const phone =  req.body.create_phone;
    const numBene =  req.body.create_numBene;

    //for locations
    const loc1 =  req.body.create_location1;
    const loc2 =  req.body.create_location2;
    const loc3 =  req.body.create_location3;

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
            res.send("ngo already exists");
        }else{
            console.log("ngo doesn't exist already");
            db.query('INSERT into user_account (email,type,password,phone) values (?,?,?,?)',[email,'NGO',password,phone], (err,result) => {
                if (err){
                    console.log("error create user_account");
                    throw err;
                };
                const id = result.insertId;
                
                // create common cook profile
                db.query('INSERT into ngo (id,number_of_beneficiaries,name) values (?,?,?)',[id,numBene, name],(err,result) => {
                    if (err){
                        console.log("error create ngo");
                        throw err;
                    }else{
                        console.log("new ngo and user id: " + id);
                        locations.AddLocation(loc1,loc2,loc3,id);
                        services.AddService(serv1,serv2,serv3,id);
                        res.send("Done");
                    }
                })
            })
        }
    })
})


//get user data from account id
NGOrouter.get("/user_account/:id", (req,res)=>{
    console.log("Fetching user_account with id: " + req.params.id);
    db.query("SELECT * FROM user_account WHERE id = ?",[req.params.id] ,(err,rows,fields)=>{
        if(err){
            console.log("failed to query for users" + err);
            res.sendStatus(500);
            throw err;
        }
        
        console.log("I think we fetched users successfully");
        res.json(rows);
    });
})

//get list of NGOs
NGOrouter.get("/NGO", (req,res)=>{
    console.log("Fetching list of NGOs");
    db.query("SELECT * FROM ngo", (err,rows,fields)=>{
        if(err){
            throw(err);
        }else{
            console.log("NGOs fetched");
            res.json(rows);
        }
    })
})

//NGO can fetch the list of families with requests
NGOrouter.get("/NGO-family-list", (req,res)=>{
    console.log("Fetching list of families that have requested help");
    db.query("SELECT family_id FROM ngo_family_relation WHERE status = ?", ["pending"], (err,rows,fields)=>{
        if(err){
            console.log("error fetching ngo-family-list")
            throw err;
        }else{
            console.log("ngo-family list fetched");
            let families = [];
            async.forEachOf(rows, function(row, index, inner_callback){
                let family_id = row.family_id;
                console.log("family id: " + family_id);
                db.query("SELECT * FROM family WHERE family_id = ?", [family_id], (err,row,fields)=>{
                    if(err){
                        inner_callback(err);
                        throw err;
                    }else{
                        console.log(util.inspect(row, {depth: null}));
                        families.push(row);
                    }
                    inner_callback();
                })
            },function(err){
                if(err){
                    throw err;
                }
                res.json(families);
            });
        }
    })
})

//NGO accepts or rejects family
NGOrouter.post("/ngo-manage-request", (req,res)=>{
    console.log("ngo managing request");

    //basic info
    const ngo_token =  req.body.get_ngo_token;
    const family_id =  req.body.get_family_id;
    const student_id =  req.body.get_student_id;
    const status =  req.body.create_status;

    db.query('SELECT * FROM family WHERE family_id = ?', [family_id,student_id], (err, rows) => {
        if (err){
            throw err;
        }else if(rows.length<0){
            res.send("family doesn't exist");
        }else{
            db.query('UPDATE ngo_family_relation SET status = ? WHERE ngo_id = ? AND family_id = ? AND student_id = ?',[status,ngo_token,family_id,student_id], (err,result) => {
                if (err){
                    console.log("error update status of fam request");
                    throw err;
                }
                res.send(`Request of family ${family_id} for student ${student_id} is ${status}`);
            })
        }
    })
})



 