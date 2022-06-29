require('./auth')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const sendOpenAi = require('./sendOpenAI')

const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "http://localhost:5000"

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

let app = express()
app.disable('x-powered-by')

app.use(forceHTTPS)
app.use(authBasicRealm)
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app
  .use(express.static(path.join(__dirname, '../dist'), { maxAge: '1d' }))

  .get('/test', function(req, res) {
    console.log("test rest call")
    console.log("debug  var:" + req.query.name)
  })

  .get('/', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))
  .get('/404', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))
    .post('/query', function(req, res) {
        let engineCode = req.query.engineCode
        console.log(req.body)
        console.log("debug  var:" + engineCode)
        res.set('Content-Type', 'application/json')
        // console.log('request: ', msgRequest, req.body)
        let result = sendOpenAi.sendOpenAIQuery(engineCode,req.body);
        result.then(emailResponse => res.send(emailResponse));
    })

app
  .use((req, res) => {
    res.status(404);
    // respond with html page
    if (req.accepts('html')) {
      res.sendFile(path.join(__dirname, '../dist/index.html'))
      return;
    }
    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }
    // default to plain-text. send()
    res.type('txt').send('Not found');
  })
  .use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
      errors: {
        message: 'Server error - please contact technical support',
        error: {}
      }
    })
    next(err)
  })

// finally, let's start our server...
const port = process.env.PORT || '3000'

let appName = process.env.APP_NAME || 'application'
console.log('Starting ' + appName)

let server = app.listen(port, function() {
  console.log('Listening on port ' + server.address().port)
})
