/* global Frames */
var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");
var errorStack = [];
var paymentID;
var url_domain = window.location.href 
var myPublicKey = "pk_test_052ae7e0-780a-451a-8254-418a8032859f"
var myNASPublicKey = "pk_sbox_ddaz7g6hhgnbhklmyxzr7n5yzme"
var myIPDataKey = "263994c8926a8cfd56041c3ab982cbe2a3461d95ee5bb1791801bbc2"
var cardholderIP;
var paymentRequestPre = document.getElementById("paymentRequest")
var paymentResponsePre = document.getElementById("paymentResponse")
var redirectUrl;
var redirectButton = document.getElementById("redirectButton")

var addressLine1 = document.getElementById("addressLine1")
var addressLine2 = document.getElementById("addressLine2")
var city = document.getElementById("city")
var state = document.getElementById("state")
var country = document.getElementById("country")
var zip = document.getElementById("zip")

var countryCodeField = document.getElementById("countryCode")
var phoneNumberField = document.getElementById("phoneNumber")
var paymentIDField = document.getElementById("paymentID")

function updateTotalPrice() {
  var currencySelectBox = document.getElementById('currency')
  var currency = currencySelectBox.value;

  if (currency == 'EUR' || currency == 'USD' || currency == 'HKD') {
    document.getElementById('totalPrice').value = 24.99
  } else if (currency == 'JPY' || currency == 'VND' || currency == 'KEW') {
    document.getElementById('totalPrice').value = 429000
  } else if (currency == 'IQD' || currency == 'TND') {
    document.getElementById('totalPrice').value = 43.582
  }
}

function json(url) {
  return fetch(url).then(res => res.json());
}

function getAddress() {
  var address = {
    'address_line1': addressLine1.value,
    'address_line2': addressLine2.value,
    'state': state.value,
    'city': city.value,
    'zip': zip.value,
    'country': country.value,
  }
  return address
}

function getPayloadValues() {
  var threeDSChallenge = document.getElementById('3DS').checked;
  var attemptN3DS = document.getElementById('attemptN3DS').checked;
  var autoCapture = document.getElementById('autoCapture').checked;
  var customerName = document.getElementById('fname').value;
  var customerEmail = document.getElementById('email').value;
  var paymentType = document.querySelector('input[name="paymentType"]:checked').value;
  var reference = document.getElementById('orderNumber').value;

  var currencySelectBox = document.getElementById('currency')
  var currency = currencySelectBox.value;
  var currencyDisplayText = currencySelectBox.options[currencySelectBox.selectedIndex].text
  var amount;

  if (currencyDisplayText.includes('Divide by 1000')) {
    amount = parseInt(parseFloat(document.getElementById('totalPrice').value) * 1000 )
  } else if (currencyDisplayText.includes('Divide by 100')) {
    amount = parseInt(parseFloat(document.getElementById('totalPrice').value) * 100 )
  } else if (currencyDisplayText.includes('Full Amount')) {
    amount = parseInt(document.getElementById('totalPrice').value)
  } 

  /* HTTP Call make here */
  var payload = {
    "currency": currency,
    "cardholderIP": cardholderIP,
    "threeDSChallenge": threeDSChallenge,
    "attemptN3DS": attemptN3DS,
    "autoCapture": autoCapture,
    "customerName": customerName,
    "customerEmail": customerEmail,
    "paymentType": paymentType,
    "amount": amount,
    "reference": reference,
    "address": getAddress()
  };

  return payload
}

function displayPaymentReqRsp(apiRequest, apiResponse) {
  paymentRequestPre.innerHTML = '<b>Payment Request</b> <br/>' + JSON.stringify(apiRequest, undefined, 2)
  paymentResponsePre.innerHTML = '<b>Payment Response</b> <br/>' + JSON.stringify(apiResponse, undefined, 2)
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
  console.log(event.token)

  // Prepare API payload
  var payload = getPayloadValues()
  payload['token'] = event.token

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
      if (data['redirectUrl']){
        paymentID = data['paymentID']
        paymentIDField.innerHTML = paymentID
        redirectUrl = data['redirectUrl']
        redirectButton.style = "display:Block"
        displayPaymentReqRsp(data['apiRequest'], data['apiResponse'])
        Frames.enableSubmitForm();
        payButton.disabled = false;
      } else {
        paymentID = data['paymentID']
        paymentIDField.innerHTML = paymentID
        redirectButton.style = "display:None"
        displayPaymentReqRsp(data['apiRequest'], data['apiResponse'])
        Frames.enableSubmitForm();
        payButton.disabled = false;
      }
    } else if (data['success'] === false) {
      window.alert('Payment failed!')      
      Frames.enableSubmitForm();
      payButton.disabled = false;
    }
  })    
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  payButton.disabled = true;

  var phoneNumber = countryCodeField.value + phoneNumberField.value

  console.log(phoneNumber)
  Frames.cardholder = {
    name: document.getElementById('fname').value,
    email: document.getElementById('email').value,
    billingAddress: {
      addressLine1: addressLine1.value,
      addressLine2: addressLine2.value,
      zip: zip.value,
      city: city.value,
      state: state.value,
      country: country.value,
    },
    phone: phoneNumber
  };
  Frames.submitCard();
});

function payHPP(){
  /* HTTP Call make here */
  var payload = getPayloadValues()

  console.log(payload)
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
    redirectUrl = data['redirectUrl']
    redirectButton.style = "display:Block"
    displayPaymentReqRsp(data['apiRequest'], data['apiResponse'])
})

  console.log('I am here')
}

function payAPM(apmMethod, currencyType = 'EUR'){
  var payload = {
    "apmMethod": apmMethod,
    "currencyType": currencyType,
    "cardholderIP": cardholderIP
  };

  fetch(url_domain + "api/payments/apm",
  {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
  .then(response => response.json())
  .then(function(data){
    redirectUrl = data['redirectUrl']
    redirectButton.style = "display:Block"
    displayPaymentReqRsp(data['apiRequest'], data['apiResponse'])
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