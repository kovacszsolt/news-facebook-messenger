const config = require('./common/config');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const util = require('util');
const api = require('./facebook/api');
const setup = require('./facebook/setup');
const FACEBOOK_VERIFY_CODE = config.facebook_verify_code;

const app = express();
app.set('port', (process.env.PORT || 1400))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const MongoClient = require('mongodb').MongoClient;
const mongoClient = new MongoClient(config.mongo_server, {useNewUrlParser: true});
mongoClient.connect(function (err, client) {
    const db = client.db(config.mongo_database);
    const UsersCollection = db.collection('users');
    const SearchCollection = db.collection('search');

    app.get('/', function (req, res) {
        res.send("Hello world")
    });

    app.get('/webhook/', function (req, res) {
        if (req.query['hub.verify_token'] === FACEBOOK_VERIFY_CODE) {
            res.send(req.query['hub.challenge'])
        }
        res.send('Error : wrong token');
    });

    app.get('/setup', function (req, res) {
        setup.setupGetStartedButton(res, FACEBOOK_VERIFY_CODE);
        setup.setupPersistentMenu(res, FACEBOOK_VERIFY_CODE);
        setup.setupGreetingText(res, FACEBOOK_VERIFY_CODE);
    });

    app.post('/webhook', function (req, res) {
        var data = req.body;
        if (data.object === 'page') {
            data.entry.forEach(function (entry) {
                entry.messaging.forEach(function (event) {
                    if (event.message) {
                        receivedMessage(event);
                    } else {
                        if (event.postback) {
                            receivedPostback(event);
                        }
                    }
                });
            });
            res.sendStatus(200);
        }
    });

    function receivedPostback(event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var payload = event.postback.payload;
        switch (payload) {
            case 'getstarted':
                api.sendTextMessage(senderID, " Hi,I'm a IT News Search Bot", FACEBOOK_VERIFY_CODE);
                break;
            default :
                //api.sendTextMessage(senderID, "Postback: " + payload, FACEBOOK_VERIFY_CODE);
                break;
        }

    }

    function receivedMessage(event) {
        var senderID = event.sender.id;

        UsersCollection.find({senderid: senderID}).toArray(function (err, records) {
            //console.log('records', records);
        });

        console.log('receivedMessage', senderID);
        var message = event.message;
        var messageText = message.text;
        if (messageText) {
            switch (messageText) {
                case 'Postback':
                    break;
                case 'help' :
                    var msg = "Just type in something and I'll tell you a few news.";
                    api.sendTextMessage(senderID, msg, FACEBOOK_VERIFY_CODE);
                    break;
                default :
                    SearchCollection.insert(
                        {user: senderID, searchText: messageText}
                        , (err, result) => {
                        }
                    );
                    search(senderID, messageText);
                    break;
            }
        }
    }

    function search(senderID, searchText) {
        request({
                url: config.backend_url + searchText,
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            },
            (error, response, body) => {
                const records = JSON.parse(body).splice(0, 10);
                if (records.length === 0) {
                    api.sendTextMessage(senderID, 'Sorry No Result: ' + searchText, FACEBOOK_VERIFY_CODE);
                } else {
                    const items = [];
                    records.forEach((record) => {
                        items.push({
                            title: record.meta.title,
                            image: config.image_url + record.meta.slug + "." + record.meta.extension,
                            subtitle: record.meta.description,
                            url: config.frontend_url + record.meta.slug
                        });
                    });
                    api.sendList(senderID, items, FACEBOOK_VERIFY_CODE);
                }

            });
    }


    app.listen(app.get('port'), function () {
        console.log('server running at : ', app.get('port'))
    });
});
