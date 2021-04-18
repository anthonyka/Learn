const db = require('../connections');

function postRel(student_id, teacher_id){
    
    db.query('INSERT into teacher_student_relation (student_id, teacher_id) values (?,?)', [student_id,teacher_id], (err, rows) => {
        if (err){
            throw err;
        }else{
            console.log("added relation teacher-student");
        }
    })
    
}

module.exports.AddTSrelation = function AddTSrelation(student_id, teacher_id){
    console.log("adding locations");

    console.log("student: " + student_id);
    console.log("teacher: " + teacher_id);

    postRel(student_id, teacher_id);
}