/* -------------------------------------------------------------------------- */
//                      ######## PASSPORT ########
/* -------------------------------------------------------------------------- */
const sha256 = require('sha256')
const LocalStrategy = require('passport-local').Strategy
const { retrieveUserInfoWithCredentials } = require('./db_utils.js')
const jwt = require('jsonwebtoken')
const { SIGN_SECRET } = require('./server_config.js')

const localStrategy = new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, username, password, done) => {
        try {
            // perform the authentication
            password = sha256(username + password)
            const data = await retrieveUserInfoWithCredentials(username, password)
            // query db for matching user and password
            if (data.rowCount > 0) {
                done(null,
                    {
                        user_id: data.rows[0].user_id,
                        username: data.rows[0].user_name,
                        email: data.rows[0].email,
                        profile_picture: data.rows[0].profile_picture,
                        description: data.rows[0].user_description,
                        datetime_created: data.rows[0].datetime_created,
                    }
                )
            } else {
                console.info(`Failed to authenticate user [${username}]`);
                done('Incorrect username and/or password', false)
            }
        } catch (e) {
            console.info(`Exception when connecting to database for [${username}] - ${e}`);
            done(`Failed to login, please try again later.`, false)
        }
    }
)

// Authentication function
const mkAuth = (passport, strategy) => {
    return (req, resp, next) => {
        passport.authenticate(strategy,
            (err, user, info) => {
                if (null != err) {
                    resp.status(401)
                    resp.type('application/json')
                    resp.json({ message: err })
                    return
                }
                if (!user) {
                    resp.status(401);
                    resp.type('application/json');
                    resp.json({ info });
                    return;
                  }
                // need to set req.user to user if using custom middleware
                req.user = user
                next()
            }
        )(req, resp, next)
    }
}

const verifyToken = (auth, req, resp, next) => {
    if (auth == null || auth == '') {
        resp.status(403)
        resp.type('application/json')
        resp.json({message: 'Missing Authorization Header.'})
        return
    }
    const terms = auth.split(' ')
    if ((terms.length != 2) || (terms[0] != 'Bearer')) {
        resp.status(403)
        resp.json({message: 'Incorrect Authorization'})
        return
    }
    const token = terms[1]
    jwt.verify(token, SIGN_SECRET, (err, decoded) => {
        if (err) {
            resp.status(403)
            resp.type('application/json')
            resp.json({message: 'Incorrect Token: ' + err})
        } else {
            req.token = decoded
            next()
        }
    })
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

module.exports = {
    localStrategy, mkAuth, verifyToken
}