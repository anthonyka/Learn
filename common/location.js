const express = require('express');
const db = require('../connections');

function postLoc(location, id){
    db.query('INSERT into location (user_id, name) values (?,?)', [id, location], (err, rows) => {
        if (err){
            throw err;
        }else{
            console.log("added loc: " + location);
        }
    })
}

module.exports.AddLocation = function AddLocation(loc1, loc2, loc3, id){
    console.log("adding locations");

    console.log("loc1: " + loc1);
    console.log("loc2: " + loc2);
    console.log("loc3: " + loc3);

    if(loc1 != ""){
        postLoc(loc1, id);
    }
    if(loc2 != ""){
        postLoc(loc2, id);
    }
    if(loc3 != ""){
        postLoc(loc3, id);
    }
}