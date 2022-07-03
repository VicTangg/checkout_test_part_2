const express = require('express');
const axios = require('axios');
const router = express.Router();

var mySecretKey = 'sk_test_66d5b639-23bb-4ffa-ac0d-26a309fa8923';

router.get('/payment-captured', (req, res) => {
    console.log(req)
    console.log("")
    console.log("")
    console.log(req.body)
    console.log("")
    console.log("")
    res.json(req.body);
});

router.post('/payment-captured', (req, res) => {
    if (req.body["type"] == "payment_captured"){
        console.log('received payment captured webhook')
        console.log()
    }
    if (req.body["type"] == "payment_approved"){
        console.log('received payment approved webhook')
        console.log('source id')
        console.log(req.body["data"]["source"]["id"])
    }
    console.log("")
    console.log("")
    // console.log(req.body)
    console.log("")
    console.log("")
    res.json("");
});



module.exports = router;