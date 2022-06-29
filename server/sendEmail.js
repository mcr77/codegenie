const API_KEY = process.env.MAILJET_API_KEY || 'ec1f667990c290f18996e1b766e2c2b6'
const SECRET_KEY = process.env.MAILJET_SECRET_KEY || 'cdae245611880a357f1391b2e05709a0'

const FROM_NAME = process.env.EMAIL_FROM_NAME || 'SoftTwining contact form app'
const FROM_EMAIL = process.env.EMAIL_FROM || 'softtwining@maildrop.cc'
const TO_NAME = process.env.EMAIL_TO_NAME || 'SoftTwining contact form receiver'
const TO_EMAIL = process.env.EMAIL_TO || 'softtwining@maildrop.cc'


module.exports = {
  sendOpenAIQuery: function(fromName, from, message) {
    console.log(`received contact message from '${fromName}'`)
    console.log(`sending email, configured email from  '${FROM_EMAIL}' to: '${TO_EMAIL}'`)
    const mailjet = require('node-mailjet').connect(API_KEY, SECRET_KEY);
    const request = mailjet
      .post('send', { 'version': 'v3.1' })
      .request({
        'Messages': [
          {
            'From': {
              'Email': FROM_EMAIL,
              'Name': FROM_NAME,
            },
            'To': [
              {
                'Email': TO_EMAIL,
                'Name': TO_NAME,
              },
            ],
            'Subject': 'SoftTwining contact form message',
            'TextPart': `You got a message from ${fromName} (${from}) with content: ${message}`,
            'HTMLPart': `<p>You got a message from ${fromName} (${from}) with content:</p>  <br/> <blockquote>${message}</blockquote>`,
            'CustomID': 'SoftTwiningAppContactForm',
          },
        ],
      });

    return request
      .then((result) => {
        // console.log('result: ', result.body);
        return {'state': 'ok', 'messages':result.Messages ? result.Messages.filter(m => m.Status === 'success').length : 0}
      })
      .catch((err) => {
        console.error('error: ', err);
        return Promise.resolve({'state':'error','errorCode': err.statusCode})
      });
  }
};

