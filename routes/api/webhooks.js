const express = require('express');
const router = express.Router();


var receivedWebhooks = []

router.get('/', (req, res) => {
    console.log(receivedWebhooks.length)
    res.json(receivedWebhooks)
})

router.post('/', (req, res) => {
    console.log("")
    console.log("")
    receivedWebhooks.push(req.body)
    console.log(req.body)
    console.log("")
    console.log("")
    res.json("");
});



module.exports = router;