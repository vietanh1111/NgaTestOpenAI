const fs = require("fs");
const request = require('request')
const openai = require("openai");
const express = require('express');
const queryString = require('querystring');

var app = express();


const port = process.env.PORT || 3000
// var ENV_SERVER = "http://127.0.0.1:3000/"
var ENV_SERVER = "https://demo-deploy-app-01.onrender.com/"


// init openAPI
const Configuration = openai.Configuration;
const OpenAIApi = openai.OpenAIApi;

let key = "sk-2b6uSrunRaQwfp1e5cFjT3BlbkFJKefhFZy5274MopF"
let key2 = "Q3Ns4"
const configuration = new Configuration({
    organization: "org-kZkL4Z0rkGFT2U9PH5n4aBJy",
    apiKey: key + key2,
});
const openaiObj = new OpenAIApi(configuration);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


let conversation = "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly."
async function requestGetOpenAIMsgForChatBot(raw_question, mmUrl) {
    console.log("requestGetOpenAIMsgForChatBot ")

    question = "\nHuman:" + raw_question + "\nAI:"
    conversation = conversation + question

    console.log("conversation=" + conversation)

    let request_data = {
        model: "text-davinci-003",
        prompt: conversation,
        temperature: 0.1,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
    }

    try {

        const completion = await openaiObj.createCompletion(request_data);
        res = completion.data.choices[0].text
        res = res.trim()
        conversation = conversation + res

        console.log("conversation=" + conversation)
        sendMessageToMM(res, raw_question, mmUrl)
    } catch (error) {
        console.log("get error")
        console.log(error)
    }
}

function sendMessageToMM(msg, question, request_url) {
    console.log("sendMessageToMM")
    let url = "https://chat.gameloft.org/hooks/yzi9zs5jw7naikmgiqtmf3u8bh"
    // let url = "https://chat.gameloft.org/hooks/63gsjdxiy7drug4bpouo6rd7ir"
    let messageMM = "**Tớ: **" + question + "\n**Bạn AI: **" + msg
    console.log("messageMM=" + messageMM)
    request.post(
        url,
        { json: { "text": messageMM } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            } else {
                console.log("got error")
            }
        }
    )
}


function chatBot(question) {
    console.log("chatBot")

    console.log("question=" + question)
    requestGetOpenAIMsgForChatBot(question)
}

app.post('/doChatOpenAI_slash', function (req, res) {
    if (req.method == 'POST') {
        req.on('data', async function (data) {
            data = data.toString()
            console.log("doChatOpenAI for the data")
            console.log(data)

            let params = queryString.parse(data);
            let question = params.text;            
            chatBot(question)
            res.end("doChatOpenAI done")
        })
    }
})

app.post('/doChatOpenAI_ow', function (req, res) {
    if (req.method == 'POST') {
        req.on('data', async function (data) {
            data = data.toString()
            console.log("doChatOpenAI for the data")
            console.log(data)
            jsonData = JSON.parse(data)
            if (jsonData.text.startsWith("OpenAI Chat:")) {
                let question = jsonData.text.replace('OpenAI Chat:', '');
                chatBot(question)
            }          
            
            res.end("doChatOpenAI done")
        })
    }
})


app.post('/resetConversation', function (req, res) {
    if (req.method == 'POST') {
        req.on('data', async function (data) {
            data = data.toString()
            console.log("resetConversation for the data")
            conversation = "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly."    


            res.end("resetConversation done")
        })
    }
})



var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    // http://127.0.0.1:3000/listUsers
    console.log("Example app listening at http://%s:%s", host, port)
})