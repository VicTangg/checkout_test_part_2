const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/success', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from('<h2>payment success!</h2>'));
});

module.exports = router;