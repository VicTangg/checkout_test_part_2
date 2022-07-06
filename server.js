// const path = require("path")
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const payments = require('./routes/api/payments');
const webhooks = require('./routes/api/webhooks');
// const frontEnd = require('./routes/front_end/front_end');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// app.use('/images', express.static(__dirname + '/images'));
// app.use(express.static(__dirname + '/public'));
app.use('/', express.static(__dirname + '/public/single_frame'));
app.use('/multi', express.static(__dirname + '/public/multi_iframes'));
app.use('/success', express.static(__dirname + '/public/payment_success'));
app.use('/failure', express.static(__dirname + '/public/payment_failure'));
app.use('/.well-known', express.static(__dirname + '/public/.well-known'));

// app.use('/', frontEnd);
app.use('/api/payments', payments);
app.use('/api/webhooks', webhooks);
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));