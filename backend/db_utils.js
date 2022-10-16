/* -------------------------------------------------------------------------- */
//                        ######## POSTGRES ########
/* -------------------------------------------------------------------------- */

const { POOL, DIGITAL_OCEAN_SPACE, GET_DIGITAL_IMAGE_URL, DIGITALOCEAN_BUCKET_NAME } = require('./server_config.js')

const escapeQuotes = (str) => {
    return str.replace(/'/g, "''");
}

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
        `SELECT * FROM users WHERE user_name = $1 AND password = $2`,
        [escapeQuotes(username), escapeQuotes(password)],
    )
}

const retrieveUserInfo = (username) => {
    return POOL.query(
        `SELECT user_name, profile_picture, user_description, datetime_created FROM users WHERE user_name = $1`,
        [escapeQuotes(username)],
    )
}

const getAllPosts = () => {
    return POOL.query('SELECT * FROM posts')
}

const getAllFollowedCommunities = (username) => {
    return POOL.query('SELECT community_name FROM followed_communities WHERE user_name = $1',
    [escapeQuotes(username)],
    )
}

const getHomePagePosts = (currentUser) => {
    return POOL.query(
        `WITH following_communities AS
            (SELECT fc.community_name, p.user_name, AGE(CURRENT_TIMESTAMP, p.date_created), p.title, p.flair, p.post_id, p.url,
                SUM(f.favour_point) AS fav_point, COUNT(c.comment_id) AS comment_count
            FROM followed_communities fc
            INNER JOIN posts p ON p.community_name = fc.community_name
            LEFT JOIN post_favours f ON f.post_id = p.post_id
            LEFT JOIN comments c ON c.post_id = f.post_id
            GROUP BY fc.community_name, fc.user_name, p.user_name, p.post_id, p.date_created, p.title, p.flair, p.url, c.comment_id
            HAVING fc.user_name = $1)
            SELECT DISTINCT post_id, community_name, user_name, age, title, flair, fav_point, comment_count, url
            FROM following_communities
            ORDER BY post_id DESC`,
        [
            escapeQuotes(currentUser)
        ],
    )
}

// This sql inserts a row into community table with the specified communityName,
// using the autoincrement id returned from inserting that row,
// the community_name and user_name is inserted into moderator tables.
// After that the community_name is returned back to frontend
const insertOneCommunityAndReturnName = (userName, communityName) => {
    return POOL.query(
        `WITH C_ROWS AS
            (INSERT INTO community (community_name)
                VALUES ($1) RETURNING community_name),
            M_ROWS AS
            (INSERT INTO MODERATORS (community_name, user_name, is_admin)
            SELECT community_name, $2, 'Y'
                FROM C_ROWS)
        SELECT community_name
        FROM C_ROWS;`,
        [
            escapeQuotes(communityName),
            escapeQuotes(userName),
        ],
    )
}

const insertTextPost = (username, selectedCommunity, title, content, selectedFlair) => {
    return POOL.query(
        `WITH P_ROWS AS
            (INSERT INTO posts (post_id, community_name, title, user_name, flair)
                VALUES (COALESCE((SELECT max(post_id) +1 FROM posts WHERE community_name = $1), 1),
                $1, $2, $3, $4) RETURNING post_id),
            PC_ROWS AS
            (INSERT INTO post_contents (community_name, post_id, content)
            SELECT $1, post_id, $5
                FROM P_ROWS)
        SELECT post_id
        FROM P_ROWS;`,
        [
            escapeQuotes(selectedCommunity),
            escapeQuotes(title),
            escapeQuotes(username),
            escapeQuotes(selectedFlair),
            escapeQuotes(content),
        ],
    );
}

const insertUrlPost = (username, selectedCommunity, title, url, selectedFlair) => {
    return POOL.query(
        `WITH P_ROWS AS
            (INSERT INTO posts (post_id, community_name, title, user_name, flair, url)
                VALUES (COALESCE((SELECT max(post_id) +1 FROM posts WHERE community_name = $1), 1),
                $1, $2, $3, $4, $5) RETURNING post_id),
            PC_ROWS AS
            (INSERT INTO post_contents (community_name, post_id, content)
            SELECT $1, post_id, $5
                FROM P_ROWS)
        SELECT post_id
        FROM P_ROWS;`,
        [
            escapeQuotes(selectedCommunity),
            escapeQuotes(title),
            escapeQuotes(username),
            escapeQuotes(selectedFlair),
            escapeQuotes(url),
        ],
    );
}

const searchPostWithParams = (currentUser, order, user, flair, community, q) => {
    return POOL.query(
        'SELECT * FROM searchPostWithParamsFunc($1, $2, $3, $4, $5, $6);',
        [
            escapeQuotes(currentUser),
            escapeQuotes(order),
            escapeQuotes(user),
            escapeQuotes(flair),
            escapeQuotes(community),
            escapeQuotes(q),
        ],
    );
};

const retrieveCommunityPostsDB = (community) => {
    return POOL.query(
           `WITH one_community AS
           (SELECT oc.community_name, p.user_name, AGE(CURRENT_TIMESTAMP, p.date_created), p.title, p.flair, p.url,
           p.post_id, SUM(f.favour_point) AS fav_point, COUNT(c.comment_id) AS comment_count
               FROM community oc
               INNER JOIN posts p ON p.community_name = oc.community_name
               LEFT JOIN post_favours f ON f.post_id = p.post_id
               LEFT JOIN comments c ON c.post_id = f.post_id
               GROUP BY oc.community_name, p.user_name, p.post_id, p.date_created, p.title, p.flair, p.url, c.comment_id
               HAVING oc.community_name = $1)
            SELECT DISTINCT post_id, community_name, user_name, age, title,
                flair, fav_point, comment_count, url
            FROM one_community ORDER BY age DESC;`,
            [
                escapeQuotes(community),
            ],

    );
};

const updateUserProfile = (columnName, value, userName) => {
    return POOL.query(`UPDATE users SET ${columnName} = $1 WHERE user_name = $2`,
        [
            escapeQuotes(value),
            escapeQuotes(userName),
        ]
    );
}

/* -------------------------------------------------------------------------- */
//                        ######## DIGITALOCEAN METHODS ########
/* -------------------------------------------------------------------------- */

// Handles the uploading to digital ocean space and returns the key as a promise
const uploadToDigitalOcean = (buffer, req, key) => new Promise((resolve, reject) => {
    const params = {
        Bucket: DIGITALOCEAN_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ACL: 'public-read',
        ContentType: req.file.mimetype,
        ContentLength: req.file.size,
        Metadata: {
            originalName: req.file.originalname,
            createdTime: '' + (new Date()).getTime(),
        }
    }
    DIGITAL_OCEAN_SPACE.putObject(params, (err, result) => {
        if (err == null) {
            resolve(GET_DIGITAL_IMAGE_URL(key))
        } else {
            reject("uploadToDigitalOcean Error: " + err)
        }
    })
})

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

module.exports = {
    retrieveUserInfoWithCredentials,
    checkUserNameAlreadyExists,
    insertToUser,
    getAllPosts,
    getHomePagePosts,
    insertOneCommunityAndReturnName,
    searchPostWithParams,
    uploadToDigitalOcean,
    retrieveUserInfo,
    updateUserProfile,
    retrieveCommunityPostsDB,
    getAllFollowedCommunities,
    insertTextPost,
    insertUrlPost
}