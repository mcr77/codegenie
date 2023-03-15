import { ipAddress, next } from '@vercel/edge';

export default function middleware(request, context) {
    const ip = ipAddress(request);

    console.log("request", JSON.stringify(request))
    console.log("context", JSON.stringify(context))

    return next({
        headers: { 'x-your-ip-address': ip || 'unknown' },
    });
}
// import { next } from '@vercel/edge';
//
// export default function middleware(request, context) {
//
//     const authUsers = process.env.AUTH_USERS ||"mihai:guest"
//     const authPasses = process.env.AUTH_PASSES||"not4share:only4guests"
//
//     // parse login and password from headers
//     const b64auth = (request.headers.authorization || '').split(' ')[1] || ''
//     const [login, password] = atob(b64auth).split(':')
//
//     // Verify login and password are set and correct
//     if (login && password) {
//         let loginIndex = authUsers.split(":").indexOf(login)
//         console.log("compare",loginIndex, password, authPasses.split(":")[loginIndex])
//         if (loginIndex >= 0 && password === authPasses.split(":")[loginIndex]){
//             // Access granted...
//             return next()
//         }
//     }
//
//     console.log("auth b64 data", b64auth)
//     console.log("auth login&pass data", login, password)
//     console.log("request", JSON.stringify(request))
//     console.log("context", JSON.stringify(context))
//
//     // Access denied...
//     const headers = new Headers();
//     headers.set('WWW-Authenticate', 'Basic realm="401"');
//     return new Response('Authentication required.', {headers: headers, status: 401})
// }