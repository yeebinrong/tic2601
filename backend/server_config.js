/* -------------------------------------------------------------------------- */
//                  ######## SERVER CONFIGURATIONS ########
/* -------------------------------------------------------------------------- */

const secure = require('secure-env')
const { Pool } = require('pg')

// Retrieve environment variables from .env
global.env = secure({secret: process.env.ENV_PASS})

const EMAIL_USER = global.env.EMAIL_USER
const EMAIL_PASS = global.env.EMAIL_PASS
const SIGN_SECRET = global.env.SIGN_SECRET
const POSTGRES_USER = global.env.POSTGRES_USER
const POSTGRES_HOST = global.env.POSTGRES_HOST
const POSTGRES_DATABASE = global.env.POSTGRES_DATABASE
const POSTGRES_PASS = global.env.POSTGRES_PASS
const POSTGRES_PORT = global.env.POSTGRES_PORT

//######## POSTGRESQL ########
const POOL = new Pool({
    user: POSTGRES_USER,
    host: POSTGRES_HOST,
    database: POSTGRES_DATABASE,
    password: POSTGRES_PASS,
    port: POSTGRES_PORT,
})

//######## AWS S3 ########

//######## OTHERS ########



/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

module.exports = {
    SIGN_SECRET, EMAIL_USER, EMAIL_PASS, POOL,
}