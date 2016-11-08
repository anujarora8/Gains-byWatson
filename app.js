/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var btoa        = require('btoa');
var express     = require('express');
var path        = require('path');
var formidable  = require('formidable');
var request     = require("request");

var app     = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Determine the port on which to listen
var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;
/* 
    QAAPI Specific Set-Up
*/
var username = "quk_student7",
    password = "yz6xYiCs",
    auth     = btoa(username+":"+password, 'base64');

// Describe the Watson Endpoint
var endpoint = {
// Specify the information and credentials pertinent to your Watson instance
    // enter watson host name; e.g: 'http://www.myhost.com'
    host : 'https://watson-wdc01.ihost.com/instance/541',
    
    // enter watson instance name; e.g: '/deepqa/v1/question'
    instance : '/deepqa/v1/question',
    
    // enter authentication info; e.g: 'Basic c29tZXVzZXJpZDpzb21lcGFzc3dvcmQ='
    auth : 'Basic '+auth
};
app.get('/', function(req, res) {
    res.render('home');
});

app.post('/question', function(req, res){    
    var question = "";
     new formidable.IncomingForm().parse(req)
    .on('field', function(name, field) {
        if (name === "questionText") question = field;
    })
    .on('error', function(err){
        next(err);
    }).on('end', function(){
        if(question.length <= 0 ) {
            res.end(JSON.stringify({status: 500}));
        } 

        if (!endpoint.host) {
            res.end(JSON.stringify({status: 404}));
        }
        var uri = endpoint.host + endpoint.instance;

        // Form a proper Watson QAAPI request
        var questionEntity = {
            "question" : {
                "evidenceRequest" : { // Ask Watson to return evidence
                    "items" : 5 // Ask for 5 answers with evidence
                },
                "questionText" : question // The question
            }
        };

        request({
            'uri' : uri,
            'method' : "POST",
            'headers' : {
                'Content-Type' : 'application/json;charset=utf-8',
                'X-SyncTimeout' : 30,
                'Authorization' : endpoint.auth
            },
            'json' : questionEntity,

        }, function(error, response, body) {
            res.send('answer', {answerText: body, question: question});
            res.end(JSON.stringify({status: 200}));
        });
    });
});

app.listen(port, function(){
    console.log("Server Running on Port: %d", port);
});