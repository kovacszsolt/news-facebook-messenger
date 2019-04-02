const config = require('./common/config');
const request = require('request');
setupGetStartedButton = (res, page_access_token) => {
    var messageData = {
        "get_started": {
            "payload": "getstarted"
        }
    };
    request({
            url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=" + page_access_token,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res.send(body);

            } else {
                res.send(body);
            }
        });
};
setupPersistentMenu = (res, page_access_token) => {
    var messageData =
        {
            "persistent_menu": [
                {
                    "locale": "default",
                    "composer_input_disabled": false,
                    "call_to_actions": [
                        {
                            "title": config.persistent_menu_site_title,
                            "type": "web_url",
                            "url": config.frontend_url,
                            "webview_height_ratio": "full"
                        }
                    ]
                }
            ]
        };
    /*
                        {
                            "title": "Search Off",
                            "type": "postback",
                            "payload": "SEARCH_OFF"
                        }
     */
    request({
            url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=" + page_access_token,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res.send(body);

            } else {
                res.send(body);
            }
        });

};
setupGreetingText = (res, page_access_token) => {
    var messageData = {
        "greeting": [
            {
                "locale": "default",
                "text": config.greeting_text
            }
        ]
    };
    request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + page_access_token,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res.send(body);

            } else {
                res.send(body);
            }
        });
};

module.exports = {
    setupPersistentMenu,
    setupGreetingText,
    setupGetStartedButton
};
