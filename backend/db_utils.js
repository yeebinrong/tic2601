/* -------------------------------------------------------------------------- */
//                      ######## POSTGRES / S3 METHODS ########
/* -------------------------------------------------------------------------- */

const { POOL } = require('./server_config.js')

const CREATE_NEW_USER_SQL = `INSERT INTO users(user_name, password, email) VALUES ($1, $2, $3) RETURNING user_name;`
const CHECK_DUPLICATE_USER = `SELECT * FROM users WHERE user_name = $1`

const insertToUser = (credentials) => {
    return POOL.query(CREATE_NEW_USER_SQL, [credentials.username, credentials.password, credentials.email])
}

const checkUserNameAlreadyExists = (username) => {
    return POOL.query(CHECK_DUPLICATE_USER, [username])
}

const retrieveUserInfoWithCredentials = (username, password) => {
    return POOL.query(
        `SELECT * FROM users WHERE user_name = '${username}' AND password = '${password}'`
    )
}

const getAllPosts = () => {
    return POOL.query('SELECT * FROM posts')
}

// This sql inserts a row into community table with the specified communityName,
// using the autoincrement id returned from inserting that row,
// the community_name and user_name is inserted into moderator tables.
// After that the community_name is returned back to frontend
const insertOneCommunityAndReturnName = (userName, communityName) => {
    return POOL.query(
        `WITH C_ROWS AS
            (INSERT INTO community (community_name)
                VALUES ('${communityName}') RETURNING community_name),
            M_ROWS AS
            (INSERT INTO MODERATORS (community_name, user_name, is_admin)
            SELECT community_name, ${userName}, 'Y'
                FROM C_ROWS)
        SELECT community_name
        FROM C_ROWS;`
    )
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

module.exports = {
    retrieveUserInfoWithCredentials, checkUserNameAlreadyExists, insertToUser, getAllPosts, insertOneCommunityAndReturnName
}