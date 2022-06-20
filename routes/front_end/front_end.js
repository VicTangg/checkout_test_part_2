const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', (req, res) => {
  // res.json('');
  // console.log(__dirname + '/single_iframe/home.html')
  var path = require('path');  
  res.sendFile(path.resolve('public/home.html'))
});

module.exports = router;