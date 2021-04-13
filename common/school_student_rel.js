const db = require('../connections');

function postRel(student_id, school_id){
    db.query('INSERT into school_student_relation (student_id, school_id) values (?,?)', [student_id,school_id], (err, rows) => {
        if (err){
            throw err;
        }else{
            console.log("added relation school-student");
        }
    })
}

module.exports.AddSSrelation = function AddSSrelation(student_id, school_id){
    console.log("adding locations");

    console.log("student: " + student_id);
    console.log("school: " + school_id);

    postRel(student_id, school_id);
}