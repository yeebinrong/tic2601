/* -------------------------------------------------------------------------- */
//                  ######## SERVER CONFIGURATIONS ########
/* -------------------------------------------------------------------------- */

const secure = require('secure-env')

// Retrieve environment variables from .env
global.env = secure({secret: process.env.ENV_PASSWORD})

//######## POSTGRESQL ########


//######## AWS S3 ########

//######## OTHERS ########

// used to unlock the encrypted .env file
const ENV_PASSWORD = process.env.ENV_PASSWORD

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

module.exports = {
    ENV_PASSWORD
}