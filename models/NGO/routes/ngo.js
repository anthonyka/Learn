const express = require('express');
const db = require('../../../connections');
const router = express.Router();
const passportLocal = require('../auth/local');

function successJSON() {
    return {
        success: true,
        token: ''
    };
}

function failureJSON(error) {
    return {
        success: false,
        error: error
    }
}

router.post('/register_ngo', (req, res, next) => {
    if (DEBUG) console.log(req.body);
    passportLocal.authenticate('ngo-register-email-phone', (err, id, info) => {
        if (err) return next(err);
        if (!id) return res.send(failureJSON(info.message));
        res.send(successJSON());
    })(req,res,next);
});


module.exports = router;

