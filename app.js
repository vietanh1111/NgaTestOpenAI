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

OPENAI_COMPLETIONS_MAX_TOKEN = 4000
OPENAI_COMPLETIONS_ALLOW_WORDS = 2500 // ~75% MAX TOKEN
let conversation = "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly."
async function requestGetOpenAIMsgForChatBot(input_question) {
    console.log("requestGetOpenAIMsgForChatBot ")

    let question = "\nHuman:" + input_question + "\nAI:"
    conversation = conversation + question

    console.log("begin conversation=" + conversation)
    console.log("words in conversation=" + conversation.split(" ").length)
    if (conversation.split(" ").length < OPENAI_COMPLETIONS_ALLOW_WORDS) {
        let request_data = {
            model: "text-davinci-003",
            prompt: conversation,
            temperature: 0.1,
            max_tokens: OPENAI_COMPLETIONS_MAX_TOKEN,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.6,
            stop: [" Human:", " AI:"],
        }

        try {
            let completion = await openaiObj.createCompletion(request_data);
            let res = completion.data.choices[0].text
            res = res.trim()
            conversation = conversation + res

            console.log("end conversation=" + conversation)

            let messageMM = "**Tớ: **" + input_question + "\n**Bạn AI: **" + res
            res = await sendMessageToMM(messageMM)
            console.log("requestGetOpenAIMsgForChatBot get done")
            return res

        } catch (error) {
            console.log("requestGetOpenAIMsgForChatBot get error")
            console.log(error)
            return error
        }
    } else {
        conversation = "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly."
        let messageMM = "**Tớ: **" + input_question + "\n**Bạn AI: **" + "Rất tiếc, tôi không thể nhớ được tất cả những gì bạn nói, tôi đang xóa ký ức và chúng ta sẽ bắt đầu lại nha :hugging_face: :hugging_face: :hugging_face: "
        await sendMessageToMM(messageMM)
        return "ok and clear conversation"
    }

}

async function sendMessageToMM(msg) {
    console.log("sendMessageToMM")
    let req_method = "POST"
    let req_url = "https://chat.gameloft.org/hooks/nw81wo1bc3rjzq5jrmpyeztd3o"
    // let req_url = "https://chat.gameloft.org/hooks/63gsjdxiy7drug4bpouo6rd7ir"
    let req_data = JSON.stringify({
        text: msg,
        user_name: "anh.nguyenviet6"
    })
    let result = await getRequestResponse(req_method, req_url, req_data)
    return result
}

app.post('/doChatOpenAI_slash', function (req, res) {
    if (req.method == 'POST') {
        req.on('data', async function (data) {
            data = data.toString()
            console.log("doChatOpenAI for the data")
            console.log(data)

            let params = queryString.parse(data);
            let question = params.text;
            let response = await requestGetOpenAIMsgForChatBot(question)
            console.log("DONE")
            res.end(response)
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
                let response = await requestGetOpenAIMsgForChatBot(question)
                console.log("DONE")
                res.end(response)
            } else {
                res.end("doChatOpenAI nothing")
            }
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


async function makeRequest(req_method, req_url, req_data) {
    console.log("makeRequest START")
    const options = {
        url: req_url,
        method: req_method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: req_data
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
}

async function getRequestResponse(req_method, req_url, req_data) {
    console.log("getRequestResponse START")
    try {
        const response = await makeRequest(req_method, req_url, req_data);
        console.log("parseResponse");
        console.log(response);
        // Do something with the response
        return response
    } catch (error) {
        console.log("parseResponse error");
        console.error(error);
        return "getRequestResponse error"
    }
}


var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    // http://127.0.0.1:3000/listUsers
    console.log("Example app listening at http://%s:%s", host, port)
})