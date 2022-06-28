const express = require('express');
const axios = require('axios');
const router = express.Router();

var mySecretKey = 'sk_test_66d5b639-23bb-4ffa-ac0d-26a309fa8923';

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
      'Authorization': mySecretKey,
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
      'Authorization': mySecretKey,
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

  var data =  {
    'source': {
      'type': apmMethod
    },
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

var config = {
  method: 'post',
  url: 'https://api.sandbox.checkout.com/payments',
  headers: {
    'Authorization': mySecretKey,
    'Content-Type': 'application/json'
  },
  data : data
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
      'Authorization': mySecretKey,
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
        'source': {
          'type': 'token',
          'token': req.body.token
        },
        'amount': 2499,
        'currency': 'EUR',
        'reference': 'ORD-5023-4E89',
        'customer': {
          'email': 'john.smith@example.com'
        },
        "3ds": {
          "enabled": true
        },
        "success_url": "https://checkout-demo-victor.herokuapp.com/success",
        "failure_url": "https://checkout-demo-victor.herokuapp.com/failure"
    }
    
    var config = {
      method: 'post',
      url: 'https://api.sandbox.checkout.com/payments',
      headers: {
        'Authorization': mySecretKey,
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