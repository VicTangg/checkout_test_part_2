/* global Frames */
var tableRows = document.getElementById("webhookTableRows");
var url_domain = window.location.href 
var myPublicKey = "pk_test_052ae7e0-780a-451a-8254-418a8032859f"
var myIPDataKey = "263994c8926a8cfd56041c3ab982cbe2a3461d95ee5bb1791801bbc2"


function populateWebhookTableRows(){
  fetch(url_domain.slice(0, -9) + "api/webhooks",
  {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    })
  .then(response => response.json())
  .then(function(webhooks){
    tableRows.innerHTML = "";
    var rows = "";
    // webhooks = [{"a": 123}]
    // Create a table row for each webhook
    webhooks.slice().reverse().forEach((webhook, i) => {
      rows += "<tr><td>"
      rows += i
      rows += "</td><td>"
      rows += webhook['type']
      rows += "</td><td>"
      rows += webhook['created_on']
      rows += "</td><td>"
      
      // Add the modal button to display webhook
      rows += '<button type="button" class="btn btn-info" data-toggle="modal" data-target="' + "#myModal" + i + '">View Webhook</button>'
      rows += '<div class="modal fade bd-example-modal-lg" id="' + "myModal" + i + '" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">'
      rows += '<div class="modal-dialog modal-lg" role="document">'
      rows += '<div class="modal-content">'
      rows += '<div class="modal-header">'
      rows += '<h4 class="modal-title">' + webhook['type']
      rows += '</h4><button type="button" class="close" data-dismiss="modal">&times;</button>'
      rows += '</div><div class="modal-body">'
      rows += '<pre>' + JSON.stringify(webhook, undefined, 2) + '</pre>'
      rows += '</div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div></td>'

      // Add the modal button to show 'get payment details'
      // rows += '<td></td>'
      rows += '</tr>'
    })
  
    tableRows.innerHTML = rows
    })
}


populateWebhookTableRows()
