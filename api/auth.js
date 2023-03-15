
const authUsers = process.env.AUTH_USERS ||"mihai:guest"
const authPasses = process.env.AUTH_PASSES||"not4share:only4guests"


authBasicRealm = (req, res, next) => {

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    // Verify login and password are set and correct
    if (login && password) {
        let loginIndex = authUsers.split(":").indexOf(login)
        // console.log("compare",loginIndex, password, authPasses.split(":")[loginIndex])
        if (loginIndex >= 0 && password === authPasses.split(":")[loginIndex]){
            // Access granted...
            return next()
        }
    }

    // Access denied...
    res.set('WWW-Authenticate', 'Basic realm="401"') // change this
    res.status(401).send('Authentication required.') // custom message

}