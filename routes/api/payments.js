const express = require('express');
const axios = require('axios');
const router = express.Router();

var myMBCSecretkey = 'sk_test_66d5b639-23bb-4ffa-ac0d-26a309fa8923';
var myNASSecretKey = 'sk_sbox_7p6tqoqk7wvdvlavv555jmiewyu'

router.get('/', (req, res) => {
  res.json('');
});

router.post('/hostedPaymentPage', (req, res) => {
  var data =  {
    "amount": 2499,
    "currency": "EUR",
    "billing": {
      "address": {
        "country": "DE"
      }
    },
    "customer": {
      "name": "Chan Tai Man",
      "email": "chan.taiman@checkout.com"
    },
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


  var config = {
    method: 'post',
    url: 'https://api.sandbox.checkout.com/hosted-payments',
    headers: {
      'Authorization': myMBCSecretkey,
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
      'redirectUrl': response.data['_links']['redirect']['href']
    });
  })
  .catch(function (error) {
    console.log(error);
    // console.log('return')
    res.status(404).json({'success': false})
  });
  

})

router.post('/paymentStatus', (req, res) => {
  var paymentID = req.body.paymentID

  var config = {
    method: 'get',
    url: 'https://api.sandbox.checkout.com/payments/' + paymentID,
    headers: {
      'Authorization': myMBCSecretkey,
      'Content-Type': 'application/json'
    }
  };

  axios(config)
  .then(function (response) {
    var status = response.data['status'] 
    console.log(status);
    // console.log(response.data.status)
    // var paymentStatus = response.data.status;
    // if (paymentStatus === 'Authorized')
    res.status(200).json({
      'success': true,
      'paymentStatus': status
    });
  })
  .catch(function (error) {
    console.log(error);
    // console.log('return')
    res.status(404).json({'success': false})
  });
})


router.post('/giropay', (req, res) => {
  apmMethod = req.body.apmMethod
  currencyType = req.body.currencyType

  const crypto = require('crypto')
  referenceID = crypto.randomUUID()

  var data =  {
    'source': {
      'type': apmMethod
    },
    "reference": referenceID,
    'amount': 2499,
    'currency': currencyType,
    "success_url": "https://checkout-demo-victor.herokuapp.com/success",
    "failure_url": "https://checkout-demo-victor.herokuapp.com/failure"
  }

  if (apmMethod == 'giropay'){
    data['source']['purpose'] = 'Mens black t-shirt L'
  }
  if (apmMethod == 'bancontact'){
    data['source']['payment_country'] = 'BE'
    data['source']['account_holder_name'] = 'Chan Tai Man'
  }
  if (apmMethod == 'ideal'){
    data['source']['bic'] = 'INGBNL2A',
    data['source']['description'] = 'orderid'
  }
  if (apmMethod == 'p24'){
    data['source']['payment_country'] = 'PL'
    data['source']['account_holder_name'] = 'Chan Tai Man'
    data['source']['account_holder_email'] = 'abc@checkout.com'
  }
  if (apmMethod == 'eps'){
    data['source']['purpose'] = 'Mens black t-shirt L'
  }
  if (apmMethod == 'paypal'){
    data['source']['invoice_number'] = referenceID
  }
  if (apmMethod == 'alipay_hk' || apmMethod == 'alipay_cn'){
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
    data : data
  };

  if (apmMethod == 'alipay_hk' || apmMethod == 'alipay_cn'){
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
      'redirectUrl': response.data['_links']['redirect']['href']
    });
  })
  .catch(function (error) {
    console.log(error);
    // console.log('return')
    res.status(404).json({'success': false})
  });


})

router.post('/', (req, res) => {
  console.log(req.body.token);
  /* Code here */
  var data =  {
      'source': {
        'type': 'token',
        'token': req.body.token
      },
      'amount': 2499,
      'currency': 'EUR',
      'reference': 'ORD-5023-4E89',
      'customer': {
        'email': 'john.smith@example.com'
      }
  }
  
  var config = {
    method: 'post',
    url: 'https://api.sandbox.checkout.com/payments',
    headers: {
      'Authorization': myMBCSecretkey,
      'Content-Type': 'application/json'
    },
    data : data
  };
  
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
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
    console.log(error);
    console.log('return')
    res.status(200).json({'success': false})
  });
    
  router.post('/3DS', (req, res) => {
    console.log(req.body.token);
    /* Code here */
    var data =  {
        "source": {
          "type": "token",
          "token": req.body.token
        },
        "amount": 2499,
        "currency": "EUR",
        "reference": "ORD-5023-4E89",
        "customer": {
          "email": "john.smith@example.com"
        },
        "3ds": {
          "enabled": true
        },
        "success_url": "https://checkout-demo-victor.herokuapp.com/success",
        "failure_url": "https://checkout-demo-victor.herokuapp.com/failure"
    }
    
    console.log(data)
    var config = {
      method: 'post',
      url: 'https://api.sandbox.checkout.com/payments',
      headers: {
        'Authorization': myMBCSecretkey,
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      console.log(response.data.status)
      var paymentStatus = response.data.status;
      if (paymentStatus === 'Authorized'){
        res.status(200).json({
          'success': true
        });
      } else if (paymentStatus === 'Pending') {
        res.status(200).json({
          'success': true,
          '3ds_redirect': response.data['_links']['redirect']['href']
        });
        
      }
    })
    .catch(function (error) {
      console.log(error);
      console.log('return')
      res.status(200).json({'success': false})
    });
      
  
  
  
  
  });



});



module.exports = router;