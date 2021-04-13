const db = require('../connections');

function postRel(teacher_id, school_id){
    db.query('INSERT into school_teacher_employment (teacher_id, school_id) values (?,?)', [teacher_id,school_id], (err, rows) => {
        if (err){
            throw err;
        }else{
            console.log("added relation school-teacher");
        }
    })
}

module.exports.AddSTrelation = function AddSTrelation(teacher_id, school_id){
    console.log("adding locations");

    console.log("teacher: " + teacher_id);
    console.log("school: " + school_id);

    postRel(teacher_id, school_id);
}