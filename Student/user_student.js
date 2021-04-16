const express = require('express');
const db = require('../connections');
const StudentRouter = express.Router();
const SSrelation = require("../common/school_student_rel");
const FSrelation = require("../common/family_student_rel");



module.exports = StudentRouter;

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



 