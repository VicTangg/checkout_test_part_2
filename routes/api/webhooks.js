const express = require('express');
const axios = require('axios');
const router = express.Router();

var mySecretKey = 'sk_test_66d5b639-23bb-4ffa-ac0d-26a309fa8923';

router.get('/payment-captured', (req, res) => {
    console.log(req)
    res.json('');
});

router.post('/payment-captured', (req, res) => {
    console.log(req)
    res.json('');
});



module.exports = router;