const request = require('request');
const util = require('util');
sendTextMessage = (recipientId, messageText, page_access_token) => {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };
    callSendAPI(messageData, page_access_token);
};

sendList = (senderID, records, page_access_token) => {
    const elements = [];
    records.forEach((record) => {
        elements.push(
            {
                "title": record.title,
                "image_url": record.image,
                "subtitle": record.subtitle,
                "default_action": {
                    "type": "web_url",
                    "url": record.url,
                    "webview_height_ratio": "tall",
                },
                "buttons": [
                    {
                        "type": "web_url",
                        "url": record.url,
                        "title": "View Website"
                    }
                ]
            }
        );
    });
    const messageData = {
        recipient: {
            id: senderID
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": elements
                }
            }
        }
    };
    callSendAPI(messageData, page_access_token);

}

callSendAPI = (messageData, page_access_token) => {
    console.log('callSendAPI', messageData);
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: page_access_token
        },
        method: 'POST',
        json: messageData

    }, (error, response, body) => {
        if (error !== null) {
            console.error("Unable to send message.", messageData);
            console.error(error);
        }
    });
};

module.exports = {
    sendTextMessage,
    callSendAPI,
    sendList
};
