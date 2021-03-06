const express = require('express');
const axios = require('axios');
const router = express.Router();
const fs = require('fs');
const path = require('path')
const https = require('https');
const { Console } = require('console');


var myMBCSecretkey = process.env.myMBCSecretkey;
var myNASSecretKey = process.env.myNASSecretKey
var myNASPublicKey = 'pk_sbox_ddaz7g6hhgnbhklmyxzr7n5yzme'


router.get('/', (req, res) => {
  // console.log(path.join(__dirname, '/certificates/certificate_sandbox.key'))
  // var cert = fs.readFileSync(path.join(__dirname, '/certificates/certificate_sandbox.key'));
  res.json("abc");
});


router.post('/validateSession', async (req, res) => {
  const { appleUrl } = req.body;
  console.log(appleUrl)
  console.log("validating apple session")
  // use set the certificates for the POST request
  try {
    console.log("I'm here")
    let = httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: await fs.readFileSync(path.join(__dirname, '/certificates/certificate_sandbox.pem')),
      key: fs.readFileSync(path.join(__dirname, '/certificates/certificate_sandbox.key')),
    });
    console.log('i am here 2')
    // Change the domainName: '2f79-210-177-217-180.eu.ngrok.io',
    // To work in ngrok

    let response = await axios.post(
      appleUrl,
      {
        merchantIdentifier: 'merchant.com.herokuapp.checkout-demo-victor',
        domainName: 'checkout-demo-victor.herokuapp.com',
        displayName: 'Victor Tang Limited',
      },
      {
        httpsAgent,
      }
    );
    res.send(response.data);
  } catch (er) {
    res.send(er)
  }
});

router.post('/hostedPaymentPage', (req, res) => {
  var data = {
    "reference": req.body.reference,
    "capture": req.body.autoCapture,
    "payment_ip": req.body.cardholderIP,
    "amount": req.body.amount,
    "currency": req.body.currency,
    "shipping": {
      "address": ""
    },
    "billing": {
      "address": ""
    },
    "3ds": {},
    "customer": {},
    "allow_payment_methods": [
      "sofort",
      "p24",
      "giropay",
      "card",
      "ideal",
      "eps",
      "bancontact"
    ],
    "success_url": "https://checkout-demo-victor.herokuapp.com/success",
    "failure_url": "https://checkout-demo-victor.herokuapp.com/failure",
    "cancel_url": "https://checkout-demo-victor.herokuapp.com/failure"
  }

  if (req.body.address) {
    data['shipping']['address'] = req.body.address
  }
  if (req.body.address) {
    data['billing']['address'] = req.body.address
  }
  if (req.body.threeDSChallenge == true){
    data['3ds']['enabled'] = true
  }
  if (req.body.attemptN3DS == true){
    data['3ds']['attempt_n3d'] = true
  }
  if (req.body.customerName != ''){
    data['customer']['name'] = req.body.customerName
  }
  if (req.body.customerEmail != ''){
    data['customer']['email'] = req.body.customerEmail
  }

  var config = {
    method: 'post',
    url: 'https://api.sandbox.checkout.com/hosted-payments',
    headers: {
      'Authorization': 'Bearer ' + myNASSecretKey,
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data['_links']['redirect']['href']));
      // console.log(response.data.status)
      // var paymentStatus = response.data.status;
      // if (paymentStatus === 'Authorized')
      res.status(200).json({
        'success': true,
        'redirectUrl': response.data['_links']['redirect']['href'],
        'apiRequest': data,
        'apiResponse': response.data
      });
    })
    .catch(function (error) {
      console.log(error);
      // console.log('return')
      res.status(404).json({ 'success': false })
    });


})

router.post('/paymentStatus', (req, res) => {
  var paymentID = req.body.paymentID

  var config = {
    method: 'get',
    url: 'https://api.sandbox.checkout.com/payments/' + paymentID,
    headers: {
      'Authorization': myNASSecretKey,
      'Content-Type': 'application/json'
    }
  };

  axios(config)
    .then(function (response) {
      var status = response.data['status']
      console.log(status);
      res.status(200).json({
        'success': true,
        'paymentStatus': status
      });
    })
    .catch(function (error) {
      console.log(error);
      // console.log('return')
      res.status(404).json({ 'success': false })
    });
})


router.post('/apm', (req, res) => {
  apmMethod = req.body.apmMethod
  currencyType = req.body.currencyType

  const crypto = require('crypto')
  referenceID = crypto.randomUUID()

  var data = {
    'source': {
      'type': apmMethod
    },
    "reference": referenceID,
    "payment_ip": req.body.cardholderIP,
    'amount': 2499,
    'currency': currencyType,
    "success_url": "https://checkout-demo-victor.herokuapp.com/success",
    "failure_url": "https://checkout-demo-victor.herokuapp.com/failure"
  }

  if (apmMethod == 'giropay') {
    data['source']['purpose'] = 'Mens black t-shirt L'
  }
  if (apmMethod == 'bancontact') {
    data['source']['payment_country'] = 'BE'
    data['source']['account_holder_name'] = 'Chan Tai Man'
  }
  if (apmMethod == 'ideal') {
    data['source']['bic'] = 'INGBNL2A',
      data['source']['description'] = 'orderid'
  }
  if (apmMethod == 'p24') {
    data['source']['payment_country'] = 'PL'
    data['source']['account_holder_name'] = 'Chan Tai Man'
    data['source']['account_holder_email'] = 'abc@checkout.com'
  }
  if (apmMethod == 'eps') {
    data['source']['purpose'] = 'Mens black t-shirt L'
  }
  if (apmMethod == 'paypal') {
    data['source']['invoice_number'] = referenceID
  }
  if (apmMethod == 'alipay_hk' || apmMethod == 'alipay_cn') {
    data['processing'] = {
      "terminal_type": "WEB",
      "os_type": "ANDROID"
    }
    data['payment_type'] = 'Regular'
    data['customer'] = {
      "name": "vincent tang",
      "email": "victor.tang@checkout.com"
    }
    data['processing_channel_id'] = "pc_kh6ijma7qxiuhamlmmtovfdnoq"
    data['items'] = [
      {
        "reference": "cko10001",
        "name": "Apple",
        "unit_price": 10,
        "quantity": 1
      }
    ]
  }

  var config = {
    method: 'post',
    url: 'https://api.sandbox.checkout.com/payments',
    headers: {
      'Authorization': myMBCSecretkey,
      'Content-Type': 'application/json'
    },
    data: data
  };

  if (apmMethod == 'alipay_hk' || apmMethod == 'alipay_cn') {
    config['headers']['Authorization'] = 'Bearer ' + myNASSecretKey
  }

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data['_links']['redirect']['href']));
      // console.log(response.data.status)
      // var paymentStatus = response.data.status;
      // if (paymentStatus === 'Authorized')
      res.status(200).json({
        'success': true,
        'redirectUrl': response.data['_links']['redirect']['href'],
        'apiRequest': data,
        'apiResponse': response.data
    });
    })
    .catch(function (error) {
      console.log(error);
      // console.log('return')
      res.status(404).json({ 'success': false })
    });


})

router.post('/cards', (req, res) => {
  var data = {
    'source': {
      'type': 'token',
      'token': req.body.token,
      'billing_address': ""
    },
    'amount': req.body.amount,
    "shipping": {
      "address": ""
    },
    'payment_type': req.body.paymentType,
    'capture': req.body.autoCapture,
    'payment_ip': req.body.cardholderIP,
    '3ds': {},
    'customer': {},
    'currency': req.body.currency,
    'reference': req.body.reference,
    "success_url": "https://checkout-demo-victor.herokuapp.com/success",
    "failure_url": "https://checkout-demo-victor.herokuapp.com/failure"
  }

  if (req.body.address) {
    data['shipping']['address'] = req.body.address
  }
  if (req.body.address) {
    data['source']['billing_address'] = req.body.address
  }
  if (req.body.threeDSChallenge == true){
    data['3ds']['enabled'] = true
  }
  if (req.body.attemptN3DS == true){
    data['3ds']['attempt_n3d'] = true
  }
  if (req.body.customerName != ''){
    data['customer']['name'] = req.body.customerName
  }
  if (req.body.customerEmail != ''){
    data['customer']['email'] = req.body.customerEmail
  }

  // Log the request
  console.log(data)

  var config = {
    method: 'post',
    url: 'https://api.sandbox.checkout.com/payments',
    headers: {
      'Authorization': 'Bearer ' + myNASSecretKey,
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      console.log(response.data.status)
      var paymentStatus = response.data.status;

      res.status(200).json({
        'success': true,
        'paymentID': response.data.id,
        'apiRequest': data,
        'apiResponse': response.data
      });

      // if (paymentStatus === 'Authorized' || paymentStatus === 'Captured' || paymentStatus === 'Card Verified') {
      //   res.status(200).json({
      //     'success': true,
      //     'paymentID': response.data.id,
      //     'apiRequest': data,
      //     'apiResponse': response.data
      //   });
      // } else if (paymentStatus === 'Pending') {
      //   res.status(200).json({
      //     'success': true,
      //     'paymentID': response.data.id,
      //     'redirectUrl': response.data['_links']['redirect']['href'],
      //     'apiRequest': data,
      //     'apiResponse': response.data
      //   });
      // }
    })
    .catch(function (error) {
      console.log(error);
      console.log('return')
      res.status(200).json({ 'success': false })
    });
});


router.post('/applepay', (req, res) => {

  // console.log(req.body.token)
  const {version, data, signature, header} = req.body.token.paymentData;
  // Exchange Apple Token with cko token
  var ckoToken;
  var req_data = {
    "type": "applepay",
    "token_data": {
      "version":1,
      "data": data,
      "signature": signature,
      "header": {
        "ephemeralPublicKey": header.ephemeralPublicKey,
        "publicKeyHash": header.publicKeyHash,
        "transactionId": header.transactionId
      }
    }
  }  

  var config = {
    method: 'post',
    url: 'https://api.sandbox.checkout.com/tokens',
    headers: {
      'Authorization': 'Bearer ' + myNASPublicKey,
      'Content-Type': 'application/json'
    },
    data: req_data
  };

  axios(config)
    .then(function (response) {
      console.log("token exchange succeeded")
      console.log(response)

      ckoToken = response.data.token
      console.log(ckoToken)
      console.log("cko token is here")

      // Make payment request with cko token
      req_data = {
        'source': {
          'type': 'token',
          'token': ckoToken
        },
        'payment_ip': req.body.cardholderIP,
        'amount': 2499,
        'currency': 'USD',
        'reference': 'ORD-5023-4E89',
        'customer': {
          'name': 'john smith',
          'email': 'john.smith@example.com'
        }
      }

      var config = {
        method: 'post',
        url: 'https://api.sandbox.checkout.com/payments',
        headers: {
          'Authorization': 'Bearer ' + myNASSecretKey,
          'Content-Type': 'application/json'
        },
        data: req_data
      };
    
      axios(config)
        .then(function (response) {
          console.log(response.data.status)
          var paymentStatus = response.data.status;
          if (paymentStatus === 'Authorized' || paymentStatus === 'Captured')
            res.status(200).json(
              {
                'success': true,
                'paymentID': response.data.id
              }
            );
        })
        .catch(function (error) {
          console.log('Failed')
          res.status(200).json({ 'success': false })
        });
    })
    .catch(function (error) {
      console.log("Apple Pay token exchange failed");
    });
})



module.exports = router;