/* global Frames */
var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");
var errorStack = [];
var paymentID;

var url_domain = window.location.href 

Frames.init({
  publicKey: "pk_test_052ae7e0-780a-451a-8254-418a8032859f",
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

  

  /* HTTP Call make here */
  var payload = {
    "token": event.token
  };

  var threeDSChallenge = document.getElementById('3ds_challenge').value;

  if (threeDSChallenge === 'Y') {
    console.log("3ds")
    fetch(url_domain + "api/payments/3DS",
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
        location.assign(data['3ds_redirect'])
        // window.alert('Payment Authorized!')    
      } else if (data['success'] === false) {
        window.alert('Payment failed!')      
      }
    })    

  } else {
    console.log("no_3ds")
    fetch(url_domain + "api/payments",
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
        // location.assign(data['3ds_redirect'])
        window.alert('Payment Authorized!')
        paymentID = data['paymentID'];
      } else if (data['success'] === false) {
        window.alert('Payment failed!')      
      }
    })    
  }
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
  // var payload = {
  //   "apmMethod": apmMethod,
  //   "currencyType": currencyType
  // };

  fetch(url_domain + "api/payments/hostedPaymentPage",
  {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      }
      // body: JSON.stringify(payload)
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
    "currencyType": currencyType
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