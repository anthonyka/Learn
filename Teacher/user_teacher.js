const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../connections');
const TeacherRouter = express.Router();
const STrelation = require("../common/school_teacher_rel");
const cloudStorage = require('../common/cloud_storage');

module.exports = TeacherRouter;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'Teacher/assets/');
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
    }else if(attendance == "absent without excuse"){
        attendanceDB = 0;
        excuse = 0;
    }else{
        attendanceDB = 0;
        excuse = 1;
    }

    const file = req.file;
    console.log(file);
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }

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

    res.sendFile(`${__dirname}/assets/${req.file.filename}`)
})

TeacherRouter.get("teacher")


 