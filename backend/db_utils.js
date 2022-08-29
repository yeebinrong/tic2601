/* -------------------------------------------------------------------------- */
//                      ######## POSTGRES / S3 METHODS ########
/* -------------------------------------------------------------------------- */

const { POOL } = require('./server_config.js')

const insertToUser = (credentials) => {
    return POOL.query(
        `INSERT INTO users(user_name, password, email) VALUES (${credentials.username}, ${credentials.password}, ${credentials.email}) RETURNING user_name`
    )
}

const checkUserNameAlreadyExists = (username) => {
    return POOL.query(
        `SELECT * FROM users WHERE user_name == '${username}`
    )
}

const retrieveUserInfoWithCredentials = (username, password) => {
    return POOL.query(
        `SELECT * FROM users WHERE user_name == '${username}' AND password == '${password}'`
    )
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

module.exports = {
    retrieveUserInfoWithCredentials, checkUserNameAlreadyExists, insertToUser
}