const express = require('express');
const db = require('../../connections');
const StudentRouter = express.Router();
const SSrelation = require("../../common/school_student_rel");
const FSrelation = require("../../common/family_student_rel");
const wallet = require("../../common/wallet");
const async = require ('async');
const util = require('util');

const schedule = require('node-schedule');


module.exports = StudentRouter;

//triggers once every month
const job = schedule.scheduleJob('0 0 1 * *', function(){
    console.log("event add coins triggered");
    console.log("ran at" + new Date());
    wallet.addCoins();
});

StudentRouter.get("/student", (req,res)=>{
    console.log("responding to root route");
    res.send("Welcome to student page");
})

function walletCreation(student_id){
    db.query('INSERT into wallet (user_id) values (?)', [student_id], (err, rows) => {
        if (err){
            throw err;
        }else{
            console.log("created student wallet");
        }
    })
}

StudentRouter.post("/student_create", (req,res)=>{
    console.log("creating student");

    //basic info
    const first_name =  req.body.create_first_name;
    const last_name =  req.body.create_last_name;
    const age =  req.body.create_age;
    const occupation =  req.body.create_occupation;
    const degree =  req.body.create_degree;
    const language =  req.body.create_language;
    const school_name =  req.body.create_school_name;
    const family_token =  req.body.create_family_token;
    

    console.log("degree: " + degree);

    
    db.query('INSERT into student (first_name, last_name,age,occupation,highest_degree,language ) values (?,?,?,?,?,?)',[first_name, last_name, age, occupation, degree, language],(err,result) => {
        if (err){
            console.log("error create student");
            throw err;
        }else{
            const id = result.insertId;
            console.log("new student and user id: " + id);
            
            db.query("SELECT school_id FROM school WHERE name = ?",[school_name] ,(err,rows,fields)=>{
                var school_id;
                if(err){
                    console.log("failed to query for users" + err);
                    res.sendStatus(500);
                    throw err;
                }
                
                console.log("I think we fetched users successfully");
                console.log(rows[0].school_id);
                school_id = rows[0].school_id;
                if(school_id!=null){
                    SSrelation.AddSSrelation(id,school_id);
                    walletCreation(id);
                }else{
                    console.log("school id is null");
                }
            });
            if(family_token!=null){
                FSrelation.AddFSrelation(id,family_token);
            }else{
                console.log("Family added is null");
            }
            res.send("Done");
        }
    })
})

StudentRouter.get('/wallet-balance/:id',(req,res)=>{
    console.log("getting wallet");

    //basic info
    const student_id =  req.params.id;
    console.log(student_id);

    db.query('SELECT balance FROM wallet WHERE user_id = ?', [student_id], (err,row,fields)=>{
        if(err){
            throw err;
        }else{
            console.log("successfully got wallet balance");
            console.log(row[0].balance);
            res.json(row[0].balance);
        }
    })
})

StudentRouter.post("/redeem_coin",(req,res)=>{
    const family_token =  req.body.get_family_token;
    const student_id =  req.body.get_student_id;
    const ngo_id =  req.body.get_ngo_id;

    console.log(`Family ${family_token} redeeming ${1} token of student ${student_id} at NGO ${ngo_id}`);
    db.query('SELECT student_id FROM family_student_relation WHERE student_id = ? AND family_id = ?',[student_id, family_token],(err,rows,fields)=>{
        if(err){
            throw err;
        }
        if(rows.length<=0){
            console.log("student is not a member of the family")
            res.send("student not member of family");
        }else{
            db.query("SELECT * FROM ngo_family_relation WHERE family_id = ? AND ngo_id = ? AND student_id = ?",[family_token,ngo_id,student_id],(err,rows,fields)=>{
                if(err){
                    throw err;
                }
                console.log(rows[0].is_aid_active);
                if(rows.length<0 || rows[0].is_aid_active==1){
                    console.log("relation does not exist");
                    res.send("request aid from NGO or you are already receiving aid");
                }
                else if(rows[0].status == 'reject'){
                    console.log("ngo has rejected help, can't redeem token");
                    res.send("ngo has rejected help, can't redeem token");
                }else if(rows[0].status == 'approve'){
                    console.log("token is being redeemed");
                    var result = 0;
                    wallet.decreaseBalance(student_id).then(function(v){
                        result = v;

                        console.log(result);
                    
                    if(result == 0){
                        res.send("not enough funds");      
                    }
                    else{
                        db.query('UPDATE ngo_family_relation SET is_aid_active = ? WHERE family_id = ? AND ngo_id = ? AND student_id = ?',[1,family_token,ngo_id,student_id],(err,rows,fields)=>{
                            if(err){
                                throw err;
                            }else{
                                console.log("aid is now active");
                                db.query('UPDATE family SET is_receiving_help = ? WHERE family_id = ?',[1,family_token],(err,rows,fields)=>{
                                    if(err){
                                        throw err;
                                    }else{
                                        console.log("family is receiving help from at least one ngo");
                                        res.send("done");
                                    }
                                })
                            }
                        })
                    }
                    })
                    
                }
            })
        }
    })
})






 