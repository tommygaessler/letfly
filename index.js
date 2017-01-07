
'use strict';

const Alexa = require('alexa-sdk');

const request = require('request');

const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

const handlers = {
    'LaunchRequest': function () {
        this.emit(':tell', "launch");
    },
    'GetPlayer': function () {
      var self = this;
      var itemSlot = this.event.request.intent.slots.Name;
      var itemName;
      if (itemSlot && itemSlot.value) {
          itemName = itemSlot.value;

          request({
            url: 'https://api.fullcontact.com/v3/contacts.search',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer "access code here"'
            },
            json: {
              "searchQuery": itemName
            }
          }, function(error, response, body){
            if(error) {
              console.log(error);
            } else {

              var to_email = body.contacts[0].contactData.emails[0].value;
              console.log(body.contacts[0].contactData.emails[0].value);

              request.post('http://sendgrid-email-server.herokuapp.com/alexa',
              { json: {
                name: itemName,
                to_email: to_email
              } },
              function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  self.emit(':tell', body.message);
                }
              });
            }
          });
      }
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = "You can say: Send mail to name";
        const reprompt = "You can say: Send mail to name";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', "bye");
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "bye");
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', "bye");
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
