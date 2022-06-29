const https = require("https")
const API_KEY = process.env.OPENAI_API_KEY || ''

const engines = [
    {
        code: 'davinci-codex',
        group: 'codex',
        url: 'https://api.openai.com/v1/engines/davinci-codex/completions'
    },
    {
        code: 'text-davinci-002',
        group: 'gpt-3',
        url: 'https://api.openai.com/v1/engines/text-davinci-002/completions'
    },];


async function post(url, data) {
    const dataString = JSON.stringify(data)

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length,
            'Authorization': 'Bearer ' + API_KEY
        },
        timeout: 30000, // in ms
    }
    console.log('headers: ',JSON.stringify( options))

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            if (res.statusCode < 200 || res.statusCode > 299) {
                return reject(new Error(`HTTP status code ${res.statusCode}`))
            }

            const body = []
            res.on('data', (chunk) => body.push(chunk))
            res.on('end', () => {
                const resString = Buffer.concat(body).toString()
                resolve(resString)
            })
        })

        req.on('error', (err) => {
            reject(err)
        })

        req.on('timeout', () => {
            req.destroy()
            reject(new Error('Request time out'))
        })

        req.write(dataString)
        req.end()
    })
}

module.exports = {
    sendOpenAIQuery: function (engineCode, requestBody) {

        //console.log(`OpenAI request to engine '${engineCode}'`, requestBody)

        let engine = engines.find(e => e.code === engineCode)

        return post( engine.url, requestBody)
            .then((result) => {
                //console.log('result: ', result);
                return result
            })
            .catch((err) => {
                console.error('error: ', err);
                return Promise.resolve({'error': err, 'errorCode': err.statusCode})
            });
    }
};

