const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', (req, res) => {
  res.json('');
});

router.post('/paymentStatus', (req, res) => {
  var paymentID = req.body.paymentID
  var config = {
    method: 'get',
    url: 'https://api.sandbox.checkout.com/payments/' + paymentID,
    headers: {
      'Authorization': 'sk_test_0b9b5db6-f223-49d0-b68f-f6643dd4f808',
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
      'type': apmMethod,
      'purpose': 'Mens black t-shirt L'
    },
    'amount': 2499,
    'currency': currencyType,
    "success_url": "http://example.com/payments/success",
    "failure_url": "http://example.com/payments/fail"
}

var config = {
  method: 'post',
  url: 'https://api.sandbox.checkout.com/payments',
  headers: {
    'Authorization': 'sk_test_0b9b5db6-f223-49d0-b68f-f6643dd4f808',
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
      'Authorization': 'sk_test_0b9b5db6-f223-49d0-b68f-f6643dd4f808',
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
        }
    }
    
    var config = {
      method: 'post',
      url: 'https://api.sandbox.checkout.com/payments',
      headers: {
        'Authorization': 'sk_test_0b9b5db6-f223-49d0-b68f-f6643dd4f808',
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