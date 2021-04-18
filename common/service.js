const express = require('express');
const db = require('../connections');

function postService(service, id){
    db.query('INSERT into service (user_id, name) values (?,?)', [id, service], (err, rows) => {
        if (err){
            throw err;
        }else{
            console.log("added service: " + service);
        }
    })
}

module.exports.AddService = function AddService(serv1, serv2, serv3, id){
    console.log("adding locations");

    console.log("loc1: " + serv1);
    console.log("loc2: " + serv2);
    console.log("loc3: " + serv3);

    if(serv1 != ""){
        postService(serv1, id);
    }
    if(serv2 != ""){
        postService(serv2, id);
    }
    if(serv3 != ""){
        postService(serv3, id);
    }
}