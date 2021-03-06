/* global Frames */
var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");
var discountCode = document.getElementById("discount-code");
var errorMessageDisplay = document.getElementById("error-message-display");

Frames.init({
  publicKey: "pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a",
  style: {
    base:{
      color: 'rgb(15, 15, 14)',
      fontSize:'15px'
    }
  },
  localization: {
    cardNumberPlaceholder: '信用卡號碼',
    expiryMonthPlaceholder: '到期日 (MM',
    expiryYearPlaceholder: 'YY)',
    cvvPlaceholder: '驗證碼',
  }
});

var logos = generateLogos();
function generateLogos() {
  var logos = {};
  logos["card-number"] = {
    src: "card",
    alt: "card number logo",
  };
  logos["expiry-date"] = {
    src: "exp-date",
    alt: "expiry date logo",
  };
  logos["cvv"] = {
    // src: "cvv",
    src: "cvv",
    alt: "cvv logo",
  };
  return logos;
}

var errors = {};
errors["card-number"] = "Please enter a valid card number";
errors["expiry-date"] = "Please enter a valid expiry date";
errors["cvv"] = "Please enter a valid cvv code";

Frames.addEventHandler(
  Frames.Events.FRAME_VALIDATION_CHANGED,
  onValidationChanged
);
function onValidationChanged(event) {
  var e = event.element;
  console.log(event)

  if (event.isValid || event.isEmpty) {
    if (e === "card-number" && !event.isEmpty) {
      showPaymentMethodIcon();
    }
    errorMessageDisplay.innerHTML = ""
    setDefaultIcon(e);
    clearErrorIcon(e);
    clearErrorMessage(e);
  } else {
    if (e === "card-number") {
      clearPaymentMethodIcon();
      errorMessageDisplay.innerHTML = "Card Number is invalid"
    }
    if (e === "expiry-date") {
      errorMessageDisplay.innerHTML = "expiry date is invalid"
    }
    if (e === "cvv") {
      errorMessageDisplay.innerHTML = "CVV is invalid"
    }
    setDefaultErrorIcon(e);
    setErrorIcon(e);
    setErrorMessage(e);
  }
}

function clearErrorMessage(el) {
  var selector = ".error-message__" + el;
  var message = document.querySelector(selector);
  message.textContent = "";
}

function clearErrorIcon(el) {
  var logo = document.getElementById("icon-" + el + "-error");
  logo.style.removeProperty("display");
}

function showPaymentMethodIcon(parent, pm) {
  if (parent) parent.classList.add("show");

  var logo = document.getElementById("logo-payment-method");
  if (pm) {
    var name = pm.toLowerCase();

    if (pm == "default"){
      logo.setAttribute("src", "images/card-icons/zstore_lock.svg");
    } else {
      logo.setAttribute("src", "images/card-icons/" + name + ".svg");
      logo.setAttribute("alt", pm || "payment method");
    }
  }
  logo.style.removeProperty("display");
}

function clearPaymentMethodIcon(parent) {
  if (parent) parent.classList.remove("show");

  var logo = document.getElementById("logo-payment-method");
  logo.style.setProperty("display", "none");
}

function setErrorMessage(el) {
  var selector = ".error-message__" + el;
  var message = document.querySelector(selector);
  message.textContent = errors[el];
}

function setDefaultIcon(el) {
  var selector = "icon-" + el;
  var logo = document.getElementById(selector);
  logo.setAttribute("src", "images/card-icons/" + logos[el].src + ".svg");
  logo.setAttribute("alt", logos[el].alt);
}

function setDefaultErrorIcon(el) {
  var selector = "icon-" + el;
  var logo = document.getElementById(selector);
  logo.setAttribute("src", "images/card-icons/" + logos[el].src + "-error.svg");
  logo.setAttribute("alt", logos[el].alt);
}

function setErrorIcon(el) {
  var logo = document.getElementById("icon-" + el + "-error");
  logo.style.setProperty("display", "block");
}

Frames.addEventHandler(
  Frames.Events.FRAME_ACTIVATED,
  frameActivated
);
function frameActivated() {
  let container = document.querySelector(".icon-container.payment-method");
  showPaymentMethodIcon(container, 'default')
}

Frames.addEventHandler(
  Frames.Events.CARD_VALIDATION_CHANGED,
  cardValidationChanged
);
function cardValidationChanged() {
  payButton.disabled = !Frames.isCardValid();
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
  console.log(event.token);
  var el = document.querySelector(".success-payment-message");
  el.innerHTML =
    "Card tokenization completed<br>" +
    'Your card token is: <span class="token">' +
    event.token +
    "</span>";
  Frames.enableSubmitForm();
}

Frames.addEventHandler(
  Frames.Events.CARD_BIN_CHANGED,
  cardBinChanged
);
function cardBinChanged(event) {
  var bin = event.bin;
  var cardScheme = event.scheme;

  if (bin == '49660405'){
    discountCode.innerHTML = 'HSBC card detected: 20% OFF discount applied'
    payButton.innerHTML = 'PAY HKD 720'
  } else if (cardScheme == 'Visa'){
    discountCode.innerHTML = 'Visa card detected: $50 discount applied'
    payButton.innerHTML = 'PAY HKD 850'
  } else {
    discountCode.innerHTML = ''
    payButton.innerHTML = 'PAY HKD 900'
  }
}


Frames.addEventHandler(
  Frames.Events.PAYMENT_METHOD_CHANGED,
  paymentMethodChanged
);
function paymentMethodChanged(event) {
  var pm = event.paymentMethod;
  let container = document.querySelector(".icon-container.payment-method");

  if (!pm) {
    clearPaymentMethodIcon(container);
    showPaymentMethodIcon(container, 'default')
  } else {
    clearErrorIcon("card-number");
    showPaymentMethodIcon(container, pm);
  }
}

form.addEventListener("submit", onSubmit);
function onSubmit(event) {
  event.preventDefault();
  Frames.submitCard();
}