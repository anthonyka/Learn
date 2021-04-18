const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../../connections');
const TeacherRouter = express.Router();
const STrelation = require("../../common/school_teacher_rel");
const TSrelation = require("../../common/teacher_student_rel");
const cloudStorage = require('../../common/cloud_storage');
const { RestError } = require('@azure/core-http');
const { WSAEMFILE } = require('constants');
const async = require ('async');
const util = require('util');

module.exports = TeacherRouter;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'models/Teacher/assets/');
    },
    filename: function(req,file,cb){
        const parts = file.mimetype.split("/");
        cb(null,`${file.fieldname}-${Date.now()}.${parts[1]}`);
    }
});

var upload = multer({ storage: storage })

TeacherRouter.post("/teacher_create", (req,res)=>{
    console.log("creating teacher");

    //basic info
    const first_name =  req.body.create_first_name;
    const last_name =  req.body.create_last_name;
    const email =  req.body.create_email;
    const password =  req.body.create_password;
    const phone =  req.body.create_phone;
    const school_name =  req.body.create_school_name;

    console.log("school name: " + school_name);
    console.log("email: " + email);
    console.log("password: " + password);
    console.log("phone: " + phone);

    db.query('SELECT * FROM user_account WHERE email = ?', [email], (err, rows) => {
        if (err){
            throw err;
        }else if(rows.length>0){
            res.send("teacher already exists");
        }else{
            console.log("teacher doesn't exist already");
            db.query('INSERT into user_account (email,type,password,phone) values (?,?,?,?)',[email,'teacher',password,phone], (err,result) => {
                if (err){
                    console.log("error create user_account");
                    throw err;
                };
                const id = result.insertId;
                
                // create common cook profile
                db.query('INSERT into teachers (teacher_id,first_name,last_name) values (?,?,?)',[id, first_name, last_name],(err,result) => {
                    if (err){
                        console.log("error create teacher");
                        throw err;
                    }else{
                        console.log("new teacher and user id: " + id);
                        
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
                                STrelation.AddSTrelation(id,school_id);
                            }else{
                                console.log("school id is null");
                            }
                        });
                        res.send("Done");
                    }
                })
            })
        }
    })
})

TeacherRouter.post("/teacher_student_attendance", upload.single('myFile'), (req,res,next)=>{
    const teacher_token =  req.body.get_teacher_token;
    const student_id =  req.body.get_student_id;
    const attendance =  req.body.create_attendance;
    
    var attendanceDB;
    var excuse;
    if(attendance == "present"){
        attendanceDB = 1;
        excuse = 0;
    }else if(attendance == "absent-without-excuse"){
        attendanceDB = 0;
        excuse = 0;
    }else{
        attendanceDB = 0;
        excuse = 1;
    }

    const file = req.file;
    console.log(file);
    if (!file) {
        const error = new Error('Please upload a file if student is present or has an excuse')
        error.httpStatusCode = 400
        return next(error)
    }

    else{
        db.query("SELECT * FROM teacher_student_relation WHERE teacher_id = ? AND student_id = ?",[teacher_token, student_id],(err,res,fields)=>{
            if(err){
                console.log("error student is not in class");
                throw err;
            }else if(res.length>=1){
                console.log("student is in teacher's class");
                cloudStorage.uploadAttendanceSheet(req.file.filename,req.file.path).then(cloud_url => {
                    db.query("INSERT into student_attendance (teacher_id,student_id, attendance, attendance_sheet, valid_excuse) values(?,?,?,?,?)",[teacher_token,student_id,attendanceDB,cloud_url,excuse],(err,res,fields)=>{
                        if(err){
                            console.log("error student attendance");
                            throw err;
                        }else{
                            console.log("successfully added student attendance");
                        }
                    })
                }).catch(err => {throw err})
            }else{
                console.log("student is not in class of teacher");
            }
        })
    }

    res.sendFile(`${__dirname}/assets/${req.file.filename}`)
})

TeacherRouter.post("/add_student_to_class",(req,res)=>{

    const teacher_token =  req.body.get_teacher_token;
    const student_id =  req.body.get_student_id;

    db.query('SELECT * FROM teacher_student_relation WHERE student_id = ?' , [student_id], (err, rows) => {
        console.log(rows);
        if (err){
            throw err;
        }else if(rows.length>0){
            console.log("relation already exists")
            res.send("student is already in class");
        }else{
            TSrelation.AddTSrelation(student_id,teacher_token);
            res.send("added student to teacher's class");
        }
    })
})

TeacherRouter.get("/teacher_student_list/:id", (req,res)=>{
    var teacher_token = req.params.id;
    console.log("Fetching list of students in teacher's class");
    db.query("SELECT student_id FROM teacher_student_relation WHERE teacher_id = ?", [teacher_token], (err,rows,fields)=>{
        if(err){
            console.log("error fetching student list");
            throw err;
        }else{
            console.log("teacher-student list fetched");
            let students = [];
            async.forEachOf(rows, function(row, index, inner_callback){
                let student_id = row.student_id;
                console.log("student id: " + student_id);
                db.query("SELECT * FROM student WHERE student_id = ?", [student_id], (err,row,fields)=>{
                    if(err){
                        inner_callback(err);
                        throw err;
                    }else{
                        console.log(util.inspect(row, {depth: null}));
                        students.push(row);
                    }
                    inner_callback();
                })
            },function(err){
                if(err){
                    throw err;
                }
                res.json(students);
            });
        }
    })
})