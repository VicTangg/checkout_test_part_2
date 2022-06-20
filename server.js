const path = require("path")
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const payments = require('./routes/api/payments');
const frontEnd = require('./routes/front_end/front_end');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// app.use('/images', express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/public'));

app.use('/', frontEnd);
app.use('/api/payments', payments);
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));