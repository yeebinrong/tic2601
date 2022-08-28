/* -------------------------------------------------------------------------- */
//                     ######## LOAD LIBRARIES ########
/* -------------------------------------------------------------------------- */

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const jwt = require('jsonwebtoken')

// Passport core
const passport = require('passport')
// Passport Strategies
const { localStrategy, mkAuth } = require('./passport_strategy.js')
const sha256 = require('sha256')

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
        sub: payload.userName,
        iss: 'readit',
        iat: currTime,
        // exp: currTime + (30),
    }, ENV_PASSWORD)
}

const checkUserAlreadyLoggedIn = (userName) => {
    const bool = USER_LOGGED_IN.find(u => {
        return u == userName
    })
    if (!bool) {
        USER_LOGGED_IN.push(userName)
    }
    return bool
}

// POST /api/login
app.post('/api/login',
// passport middleware to perform authentication
localStrategyAuth,
(req, resp) => {
    const token = signToken(req.userName)
    if(checkUserAlreadyLoggedIn(req.userName)) {
        resp.status(406)
        resp.type('application/json')
        resp.json({message:"Already logged in."})
        return
    }
    resp.status(200)
    resp.type('application/json')
    resp.json({message: `Login at ${new Date()}`, token, user: req.user})
})

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