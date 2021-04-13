const db = require('../connections');

function postRel(student_id, family_id){
    db.query('INSERT into family_student_relation (student_id, family_id) values (?,?)', [student_id,family_id], (err, rows) => {
        if (err){
            throw err;
        }else{
            console.log("added relation family-student");
        }
    })
}

module.exports.AddFSrelation = function AddFSrelation(student_id, family_id){
    console.log("adding locations");

    console.log("student: " + student_id);
    console.log("family: " + family_id);

    postRel(student_id, family_id);
}