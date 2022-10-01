/* -------------------------------------------------------------------------- */
//                     ######## LOAD LIBRARIES ########
/* -------------------------------------------------------------------------- */

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const sha256 = require('sha256')
const multer = require('multer')

// Passport core
const passport = require('passport')
// Passport Strategies
const { localStrategy, mkAuth, verifyToken } = require('./passport_strategy.js')
const { SIGN_SECRET, CHECK_DIGITAL_OCEAN_KEYS, CHECK_POSTGRES_CONN, READ_FILE, UNLINK_ALL_FILES } = require('./server_config.js')
const { checkUserNameAlreadyExists, insertToUser, getAllPosts, insertOneCommunityAndReturnName, retrieveCommunityPostsDB, searchPostWithParams, uploadToDigitalOcean } = require('./db_utils.js')

/* -------------------------------------------------------------------------- */
//             ######## DECLARE VARIABLES & CONFIGURATIONS ########
/* -------------------------------------------------------------------------- */

// Directory to store files to upload
const UPLOAD_PATH = `${__dirname}/uploads/`

// Configure passport with a strategy
passport.use(localStrategy)

const localStrategyAuth = mkAuth(passport, 'local')

// Declare the port to run server on
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3008
// Create an instance of express
const app = express()
// Create an instance of multer
const upload = multer({dest: UPLOAD_PATH})

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
        ...payload,
        iss: 'readit',
        iat: currTime,
    }, SIGN_SECRET)
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
    const userInfo = req.user;
    const token = signToken(userInfo)
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

// Note: You can access user information using req.token from requests below
// code 23505 = Duplicate constraint
// code 23514 = Check constraint

app.post('/api/create_community', async (req, resp) => {
    let insertedCommunityName = ''
    try {
        const results = await insertOneCommunityAndReturnName(req.token.username, req.body.communityName)
        insertedCommunityName = results.rows[0].community_name
    } catch (e) {
        console.info(`ERROR: Insert to community failed with following ${e}`)
        if (e.code === '23505') {
            // 409 Conflict
            resp.status(409)
            resp.type('application/json')
            resp.json({message: `Community name [${req.body.communityName}] already exists.`})
            return
        } else if (e.code === '23514') {
            // 409 Unprocessable Entity
            resp.status(422)
            resp.type('application/json')
            resp.json({message: `Community name [${req.body.communityName}] failed check constraints.`})
            return
        }
        resp.status(400)
        resp.type('application/json')
        resp.json({message: `An error has occurred while creating community.`})
        return
    }
    resp.status(200)
    resp.type('application/json')
    resp.json({ communityName: insertedCommunityName })
    return
})

app.get('/api/all_posts', async (req, resp) => {
    const results = await getAllPosts()
    if (results.rows.length == 0) {
        resp.status(204)
        resp.type('application/json')
        resp.json({rows: [], message: 'No posts found!'})
        return
    }
    resp.status(200)
    resp.type('application/json')
    resp.json({rows: results.rows})
    return
})

// TODO catch / handle errors
app.get('/api/search', async (req, resp) => {
    const { order, user, flair, community, q } = req.query;
    const results = await searchPostWithParams(req.token.username, order, user, flair, community, q);
    if (results.rows && results.rows.length == 0) {
        resp.status(204);
        resp.type('application/json');
        resp.json({rows: [], message: 'No posts found!'});
        return;
    }
    resp.status(200);
    resp.type('application/json');
    resp.json({rows: results.rows });
    return;
});

app.get('/api/community', async (req, resp) => {
    const community = req.query.community_name;
    const results = await retrieveCommunityPostsDB(community);
    console.log(results);
    if (results.rows && results.rows.length == 0) {
        resp.status(204);
        resp.type('application/json');
        resp.json({rows: [], message: 'No posts found!'});
        return;
    }
    resp.status(200);
    resp.type('application/json');
    //resp.json({ message: 'ok'})
    resp.json({rows: results.rows });
    return;
});

// POST /api/upload
app.post('/api/upload', upload.single('file'), async (req, resp) => {
    // Parse the json string sent from client into json object
    const data = JSON.parse(req.body.data)
    try {
        const buffer = await READ_FILE(req.file.path)
        const key = await uploadToDigitalOcean(buffer, req)
        data.key = key
        // const id = await uploadToMongo(data)
        await UNLINK_ALL_FILES(UPLOAD_PATH)
        resp.status(200)
        resp.type('application/json')
        resp.json({id: id})
    } catch (e) {
        console.info(e)
		resp.status(500)
		resp.type('application/json')
		resp.json({msg: `${e}`})
    }
})

app.get('/api/receive', (req, resp) => {
    const value = req.query.value
    resp.status(200)
    resp.type('application/json')
    resp.json({ value: "Server received your message! [" + value + "]" })
    return
})

app.get('/api/getbackendvalue', (req, resp) => {
    resp.status(200)
    resp.type('application/json')
    resp.json({ value: Math.floor(Math.random() * 100) })
    return
})

Promise.all([CHECK_POSTGRES_CONN(), CHECK_DIGITAL_OCEAN_KEYS()])
.then(() => {
    app.listen(PORT, () => {
        console.info(`Application is listening PORT ${PORT} at ${new Date()}`);
    })
}).catch(e => {
    console.info('Error starting the server: ', e);
})