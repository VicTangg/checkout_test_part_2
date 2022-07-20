/* global Frames */
var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");
var errorStack = [];
var paymentID;
var bbc = 123;
var url_domain = window.location.href 
var myPublicKey = "pk_test_052ae7e0-780a-451a-8254-418a8032859f"
var myNASPublicKey = "pk_sbox_ddaz7g6hhgnbhklmyxzr7n5yzme"
var myIPDataKey = "263994c8926a8cfd56041c3ab982cbe2a3461d95ee5bb1791801bbc2"
var cardholderIP;
var paymentRequestPre = document.getElementById("paymentRequest")
var paymentResponsePre = document.getElementById("paymentResponse")

function json(url) {
  return fetch(url).then(res => res.json());
}

json(`https://api.ipdata.co?api-key=${myIPDataKey}`).then(data => {
  cardholderIP = data.ip
  console.log(cardholderIP)
});


// Apple Pay
var merchantIdentifier = 'merchant.com.herokuapp.checkout-demo-victor';
var BACKEND_URL_VALIDATE_SESSION = window.location.href + "api/payments/validateSession";
// https://6f44-123-203-23-156.ap.ngrok.io/validateSession
var BACKEND_URL_PAY = window.location.href + "pay"
// https://6f44-123-203-23-156.ap.ngrok.io/pay
var appleButton = document.querySelector(".apple-pay-button")

if (
  window.ApplePaySession && 
  ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier)
  ){
    appleButton.style.display = "block";
  }

appleButton.addEventListener("click", function(){
  var applePaySession = new ApplePaySession(6, {
    countryCode: "US",
    currencyCode: "USD",
    supportedNetworks: ["visa", "masterCard", "amex", "discover"],
    merchantCapabilities: ["supports3DS"],
    total: {label: "Amazing Shop", amount: "24.99"}
  });
  applePaySession.begin();

  // First event, validate apple pay session from back
  applePaySession.onvalidatemerchant = function(event) {
    console.log("Apple pay validating")
    var theValidationURL = event.validationURL;
    console.log(theValidationURL)
    validateTheSession(theValidationURL, function(merchantSession){
      console.log('url validated')
      console.log(merchantSession)
      applePaySession.completeMerchantValidation(merchantSession)
    })
  }

  // Second event triggered on authorized
  applePaySession.onpaymentauthorized = function(event){
    var applePaymentToken = event.payment.token;

    console.log(applePaymentToken)
    console.log("Apple pay authorized")

    // Back end logic to create payment
      var payload = {
        "token": applePaymentToken,
        "cardholderIP": cardholderIP
      };
      console.log(payload)
      console.log(JSON.stringify(applePaymentToken.paymentData))
      fetch(url_domain + "api/payments/applepay",
      {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)          
        })
      .then(response => response.json())
      .then(function(data){
        applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS)
        location.assign(url_domain + 'success')
      })
      .catch((error) => {
        applePaySession.completePayment(ApplePaySession.STATUS_FAILURE)
        location.assign(url_domain + 'failure')
      })
  }

})

var validateTheSession = function(theValidationURL, callback) {
  console.log(BACKEND_URL_VALIDATE_SESSION)
  axios.post(BACKEND_URL_VALIDATE_SESSION,
    {
      appleUrl: theValidationURL
    },
    {
      headers:{
        "Access-Control-Allow-Origin": "*"
      }
    }).then(function(response){
      callback(response.data)
    })

}


Frames.init({
  publicKey: myNASPublicKey,
  localization: "DE-DE"
});

Frames.addEventHandler(
  Frames.Events.CARD_VALIDATION_CHANGED,
  onCardValidationChanged
);
function onCardValidationChanged(event) {
  console.log("CARD_VALIDATION_CHANGED: %o", event);
  payButton.disabled = !Frames.isCardValid();
}

Frames.addEventHandler(
  Frames.Events.FRAME_VALIDATION_CHANGED,
  onValidationChanged
);
function onValidationChanged(event) {
  console.log("FRAME_VALIDATION_CHANGED: %o", event);

  var errorMessageElement = document.querySelector(".error-message");
  var hasError = !event.isValid && !event.isEmpty;

  if (hasError) {
    errorStack.push(event.element);
  } else {
    errorStack = errorStack.filter(function (element) {
      return element !== event.element;
    });
  }

  var errorMessage = errorStack.length
    ? getErrorMessage(errorStack[errorStack.length - 1])
    : "";
  errorMessageElement.textContent = errorMessage;
}

function getErrorMessage(element) {
  var errors = {
    "card-number": "Please enter a valid card number",
    "expiry-date": "Please enter a valid expiry date",
    cvv: "Please enter a valid cvv code",
  };

  return errors[element];
}

Frames.addEventHandler(
  Frames.Events.CARD_TOKENIZATION_FAILED,
  onCardTokenizationFailed
);
function onCardTokenizationFailed(error) {
  console.log("CARD_TOKENIZATION_FAILED: %o", error);
  Frames.enableSubmitForm();
}

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, onCardTokenized);
function onCardTokenized(event) {
  var el = document.querySelector(".success-payment-message");
  el.innerHTML = "Card tokenization completed<br>" 
    
    // 'Your card token is: <span class="token">' +
    // event.token +
    // "</span>";

  console.log(event.token)

  var threeDSChallenge = document.getElementById('3DS').checked;
  var attemptN3DS = document.getElementById('attemptN3DS').checked;
  var autoCapture = document.getElementById('autoCapture').checked;
  var customerName = document.getElementById('fname').value;
  var customerEmail = document.getElementById('email').value;
  var paymentType = document.querySelector('input[name="paymentType"]:checked').value;

  /* HTTP Call make here */
  var payload = {
    "token": event.token,
    "cardholderIP": cardholderIP,
    "threeDSChallenge": threeDSChallenge,
    "attemptN3DS": attemptN3DS,
    "autoCapture": autoCapture,
    "customerName": customerName,
    "customerEmail": customerEmail,
    "paymentType": paymentType,
    "amount": 2499
  };

  fetch(url_domain + "api/payments/cards",
  {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(function(data){
    console.log(data)
    if (data['success'] === true){
      if (data['3ds_redirect']){
        location.assign(data['3ds_redirect'])
      } else {
        paymentID = data['paymentID']
        paymentRequestPre.innerHTML = '<b>Payment Request</b> <br/>' + JSON.stringify(data['apiRequest'], undefined, 2)
        paymentResponsePre.innerHTML = '<b>Payment Response</b> <br/>' + JSON.stringify(data['apiResponse'], undefined, 2)
      }
    } else if (data['success'] === false) {
      window.alert('Payment failed!')      
    }
  })    
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  Frames.cardholder = {
    name: "John Smith",
    email: "john.smith@gmail.com",
    billingAddress: {
      addressLine1: "JJJ Street",
      addressLine2: "Apartment 8",
      zip: "31313",
      city: "Hinesville",
      state: "Georgia",
      country: "US",
    },
    phone: "9125084652"
  };
  Frames.submitCard();
});

function payHPP(){
  var payload = {
    "cardholderIP": cardholderIP
  };

  fetch(url_domain + "api/payments/hostedPaymentPage",
  {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
  .then(response => response.json())
  .then(function(data){
    console.log(data)
    location.assign(data['redirectUrl'])
  })

  console.log('I am here')
}

function payAPM(apmMethod, currencyType = 'EUR'){
  var payload = {
    "apmMethod": apmMethod,
    "currencyType": currencyType,
    "cardholderIP": cardholderIP
  };

  fetch(url_domain + "api/payments/giropay",
  {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
  .then(response => response.json())
  .then(function(data){
    console.log(data)
    location.assign(data['redirectUrl'])
  })

  console.log('I am here')
}

function checkPaymentStatus(){
  var payload = {
    "paymentID": paymentID
  };

  fetch(url_domain + "api/payments/paymentStatus",
  {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
  .then(response => response.json())
  .then(function(data){
    console.log(data)
    window.alert(data['paymentStatus'])      
  })

  console.log('I am here')
}