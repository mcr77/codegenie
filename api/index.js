


const app = require('express')()
const bodyParser = require('body-parser')

const https = require('https');
const http = require('http');

const cors = require('cors')
const sendOpenAi = require('./sendOpenAI')
const path = require('path')


const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "http://localhost:8081"

const forceHTTPS = (req, res, next) => {
  console.log('secure check:', req.secure, req.header('x-forwarded-proto'), req.connection.encrypted)
  if (!req.secure && !req.connection.encrypted && req.header('x-forwarded-proto') !== 'https') {
    console.log('redirect https ')
    return res.redirect('https://' + req.get('host') + req.url)
  }
  next()
}

const corsOptions = {
  origin: ALLOW_ORIGIN,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.set('port', (process.env.PORT || 8081));
app.disable('x-powered-by')

// app.use(forceHTTPS)
// app.use(authBasicRealm)
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/api/query', function(req, res) {
        let engineCode = req.query.engineCode
        console.log(req.body)
        console.log("debug  var:" + engineCode)
        res.set('Content-Type', 'application/json')
        // console.log('request: ', msgRequest, req.body)
        let result = sendOpenAi.sendOpenAIQuery(engineCode,req.body);
        result.then(emailResponse => res.send(emailResponse));
    })

    .use(express.static(path.join(__dirname, '../dist'), { maxAge: '1d' }))

    .get('api/test', function(req, res) {
        console.log("test rest call")
        console.log("debug  var:" + req.query.name)
        res.send("test")
    })

    //.get('/', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))

// finally, let's start our server...

let appName = process.env.APP_NAME || 'application'
console.log('Starting genie app serer' + appName)

let server = app.listen(app.get('port'), function() {
  console.log('Listening on port ' + server.address().port)
})

module.exports = app