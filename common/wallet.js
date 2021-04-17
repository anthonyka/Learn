const db = require('../connections');
const async = require ('async');
const util = require('util');

module.exports.addCoins = function addCoins(){
    console.log("Fetching list of students that can get a coin");
    db.query("SELECT student_id FROM student_attendance", (err,rows,fields)=>{
        if(err){
            console.log("error fetching student_attendance")
            throw err;
        }else{
            console.log("student_attendance list fetched");
            let attendance_1 = 0;
            async.forEachOf(rows, function(row, index, inner_callback){
                let student_id = row.student_id;
                console.log("student id: " + student_id);
                db.query("SELECT attendance FROM student_attendance WHERE student_id = ?", [student_id], (err,row,fields)=>{
                    if(err){
                        inner_callback(err);
                        throw err;
                    }else{
                        attendance_1 = 0;
                        console.log(util.inspect(row, {depth: null}));
                        for(var i = 0;i<row.length;++i){
                            attendance_1 += row[i].attendance;
                        }
                        if(attendance_1>=0.8*row.length){
                            console.log("send coin");
                            var balance = 0;
                            db.query('SELECT balance FROM wallet WHERE user_id = ?', [student_id], (err,row,fields)=>{
                                if(err){
                                    throw err;
                                }else{
                                    console.log("successfully got wallet balance");
                                    console.log(row[0].balance);
                                    balance = row[0].balance+1;
                                    db.query("UPDATE wallet SET balance = ? WHERE user_id = ?",[balance,student_id],(err,res,fields)=>{
                                        if(err){
                                            console.log("error updating wallet");
                                            throw(err);
                                        }else{
                                            console.log("added coin to balance");
                                            resetAid();
                                            resetAttendance();
                                        }
                                    })
                                }
                            })
                        }
                    }
                    inner_callback();
                });
            },function(err){
                if(err){
                    throw err;
                }
                console.log("Coins Added to balances");
            });
        }
    })
}

module.exports.decreaseBalance = function decreaseBalance(student_id){
    console.log("trying to decrease balance");
    db.query('SELECT balance FROM wallet WHERE user_id = ?',[student_id],(err,row,fields)=>{
        if(err){
            console.log("an error occured while fetching wallet to decrease funds");
            throw(err);
        }if(row[0].balance<0){
            return "no funds";
        }else{
            db.query('UPDATE wallet SET balance = ? WHERE user_id = ?',[row[0].balance-1, student_id],(err,rows,fields)=>{
                if(err){
                    console.log("an error occured while decreasing balance");
                    throw err;
                }else{
                    return "done";
                }
            })
        }
    })
}

function resetAid(){
    //set is_aid_active to 0
    db.query('UPDATE ngo_family_relation SET is_aid_active = ?',[0],(err,res,fields)=>{
        if(err){
            console.log("error resetting aid status");
            throw err;
        }else{
            console.log("resetting aid status");
           
            db.query('UPDATE family SET is_receiving_help = ?', [0],(err,row,fields)=>{
                if(err){
                    throw(err);
                }else{
                    console.log("is_receiving help reset");
                }
            })
        }
    })
}

function resetAttendance(){
    db.query('TRUNCATE TABLE student_attendance',(err,res,fields)=>{
        if(err){
            console.log("error resetting student_attendance table");
            throw err;
        }else{
            console.log("resetting student_attendance table");
        }
    })
}