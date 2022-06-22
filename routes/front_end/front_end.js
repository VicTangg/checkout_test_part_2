const express = require('express');
const axios = require('axios');
const router = express.Router();

// router.get('/success', (req, res) => {
//     res.set('Content-Type', 'text/html');
//     res.send(Buffer.from('\
//     <h2>payment success!!</h2>\
//     <a onclick="to_home()">Back to home page</a>\
//     <script>\
//     function to_home(){var url_domain = window.location.href;\
//     var splitted = url_domain.split("/");\
//     var home_url = splitted[0] + "//" + splitted[2] + "/";\
//     location.assign(home_url)}\
//     </script>\
//     '));
// });

// router.get('/failure', (req, res) => {
//     res.set('Content-Type', 'text/html');
//     res.send(Buffer.from('\
//     <h2>payment failure...</h2>\
//     <a onclick="to_home()">Back to home page</a>\
//     <script>\
//     function to_home(){var url_domain = window.location.href;\
//     var splitted = url_domain.split("/");\
//     var home_url = splitted[0] + "//" + splitted[2] + "/";\
//     location.assign(home_url)}\
//     </script>\
//     '));
// });

module.exports = router;