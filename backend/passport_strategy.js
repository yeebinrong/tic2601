/* -------------------------------------------------------------------------- */
//                      ######## PASSPORT ########
/* -------------------------------------------------------------------------- */
const sha256 = require('sha256')
const LocalStrategy = require('passport-local').Strategy
const { retrieveUserInfoWithCredentials } = require('./db_utils.js')

const localStrategy = new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, username, password, done) => {
        try {
            // perform the authentication
            password = sha256(password)
            console.info(password)
            const data = await retrieveUserInfoWithCredentials(username, password)
            // query db for matching user and password
            if (data.length > 0) {
                done(null,
                    // info about the user
                    {
                        // specify the data to return
                        username: username,
                        // ...
                    }
                )
            } else {
                // Incorrect login
                done('Incorrect username and/or password', false)
            }
        } catch (e) {
            done(`Error authenticating: ${e}`, false)
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

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

module.exports = {
    localStrategy, mkAuth
}