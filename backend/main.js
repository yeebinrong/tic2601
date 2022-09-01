/* -------------------------------------------------------------------------- */
//                     ######## LOAD LIBRARIES ########
/* -------------------------------------------------------------------------- */

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const sha256 = require('sha256')

// Passport core
const passport = require('passport')
// Passport Strategies
const { localStrategy, mkAuth, verifyToken } = require('./passport_strategy.js')
const { SIGN_SECRET } = require('./server_config.js')
const { checkUserNameAlreadyExists, insertToUser } = require('./db_utils.js')

const USER_LOGGED_IN = []

/* -------------------------------------------------------------------------- */
//             ######## DECLARE VARIABLES & CONFIGURATIONS ########
/* -------------------------------------------------------------------------- */

// Configure passport with a strategy
passport.use(localStrategy)

const localStrategyAuth = mkAuth(passport, 'local')

// Declare the port to run server on
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3008
// Create an instance of express
const app = express()

/* -------------------------------------------------------------------------- */
//                          ######## REQUESTS ########
/* -------------------------------------------------------------------------- */

// disable cache
app.disable('etag');
// Log incoming requests using morgan
app.use(morgan('combined'))
// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}))
// Parse application/json
app.use(express.json())
// initialise passport (must be done after parsing  json / urlencoded)
app.use(passport.initialize())
// Apply cors headers to resp
app.use(cors())

// Sign a jwt token
const signToken = (payload) => {
    const currTime = (new Date()).getTime() / 1000
    return jwt.sign({
        sub: payload.username,
        iss: 'readit',
        iat: currTime,
    }, SIGN_SECRET)
}

const checkUserAlreadyLoggedIn = (username) => {
    const bool = USER_LOGGED_IN.find(u => {
        return u == username
    })
    if (!bool) {
        USER_LOGGED_IN.push(username)
    }
    return bool
}

// POST /api/register
// Create new local account
app.post('/api/register', async (req, resp) => {
    const credentials = req.body
    // check if client has posted the credentials correctly
    if (!credentials.password || !credentials.username || !credentials.email) {
        resp.status(401)
        resp.type('application/json')
        resp.json({message: "Missing credentials."})
        return
    }
    // hash password
    credentials.password = sha256(credentials.username + credentials.password)
    // check if username already exists
    const results = await checkUserNameAlreadyExists(credentials.username)
    if (!results.rows.length <= 0) {
        resp.status(409)
        resp.type('application/json')
        resp.json({message: `Username [${credentials.username}] already exists.`})
        return
    } else {
        try {
            // Insert credentials into postgres database
            await insertToUser(credentials)
        } catch (e) {
            console.info(`ERROR: Insert to user failed with following error: ${e}`)
            resp.status(400)
            resp.type('application/json')
            resp.json({message: "Failed to register. Please try again later."})
            return
        }
        resp.status(200)
        resp.type('application/json')
        resp.json({message: `Successfully created an account for ${credentials.username}!`})
        return
    }
})

// POST /api/login
app.post('/api/login',
// passport middleware to perform login authentication
localStrategyAuth,
(req, resp) => {
    const userInfo = req.body;
    const token = signToken(userInfo.username)
    if(checkUserAlreadyLoggedIn(userInfo.username)) {
        resp.status(406)
        resp.type('application/json')
        resp.json({message: `User [${userInfo.username}] is already logged in.`})
        return
    }
    resp.status(200)
    resp.type('application/json')
    resp.json({message: `Logged in at ${new Date()}`, token, username: userInfo.username})
    return
})

// POST /api/verify
// Check if token is valid
app.post('/api/verify', (req, resp, next) => {
    const auth = req.body.token
    verifyToken(auth, req, resp, next)
}, (req, resp) => {
    resp.status(200)
    resp.type('application/json')
    resp.json({message: 'Authentication successful'})
    return
})

/* -------------------------------------------------------------------------- */
//               ######## AUTHENTICATION MIDDLEWARE ########
/* -------------------------------------------------------------------------- */

// Authenticate token before allowing user to send requests to below apis
app.use((req, resp, next) => {
    const auth = req.get('Authorization')
    verifyToken(auth, req, resp, next)
})

/* -------------------------------------------------------------------------- */
//                 ######## AUTHENTICATED REQUESTS ########
/* -------------------------------------------------------------------------- */

app.get('/api/receive', (req, resp) => {
    const value = req.query.value
    resp.status(200)
    resp.type('application/json')
    resp.json({ value: "Server received your message! [" + value + "]" })
})

app.get('/api/getbackendvalue', (req, resp) => {
    resp.status(200)
    resp.type('application/json')
    resp.json({ value: Math.floor(Math.random() * 100) })
})

app.listen(PORT, () => {
    console.info(`Application is listening PORT ${PORT} at ${new Date()}`)
})