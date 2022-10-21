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

const getHomePagePosts = (currentUser, sortBy) => {
    return POOL.query(
        `WITH following_communities AS
            (SELECT fc.community_name, p.user_name, AGE(CURRENT_TIMESTAMP, p.date_created), p.title, p.flair, p.post_id, p.date_deleted, p.view_count,
                SUM(f.favour_point) AS fav_point, fp.favour_point AS is_favour, COUNT(c.comment_id) AS comment_count, hf.hide_or_favourite AS is_hidden
            FROM followed_communities fc
            INNER JOIN posts p ON p.community_name = fc.community_name
            LEFT JOIN favours f ON f.post_id = p.post_id
			LEFT JOIN favours fp ON fp.post_id = p.post_id AND fp.giver = $1
            LEFT JOIN comments c ON c.post_id = f.post_id
            LEFT JOIN hide_or_fav_posts hf ON hf.post_id = p.post_id AND hf.user_name = $1
            GROUP BY fc.community_name, fc.user_name, p.post_id, fp.favour_point, c.comment_id, hf.hide_or_favourite
            HAVING fc.user_name = $1)
        SELECT DISTINCT post_id, community_name, user_name, age, title, flair, fav_point, is_favour, comment_count, date_deleted, view_count, is_hidden
        FROM following_communities
		WHERE is_hidden IS NULL OR is_hidden = 'N'
        ORDER BY ` + sortBy,
        [
            escapeQuotes(currentUser)
        ],
    )
}

const updateFavour = (postId, favour, value, currentUser, receiver) => {
    if (value == 0) {
        return POOL.query(`DELETE FROM favours WHERE post_id = ` + postId + ` AND giver = $1 AND receiver = $2`,
            [
                escapeQuotes(currentUser),
                escapeQuotes(receiver)
            ]
        )
    } else if (favour == 0) {
        return POOL.query(`INSERT INTO favours (post_id, favour_point, giver, receiver)
                            VALUES(` + postId + `, ` + value + `, $1, $2)`,
            [
                escapeQuotes(currentUser),
                escapeQuotes(receiver)
            ]
        )
    } else if (favour != 0) {
        return POOL.query(`UPDATE favours SET favour_point = ` + value + `
                            WHERE post_id = ` + postId + ` AND giver = $1 AND receiver = $2`,
            [
                escapeQuotes(currentUser),
                escapeQuotes(receiver)
            ]
        )
    }
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

const insertPost = (username, selectedCommunity, title, content, selectedFlair) => {
    return POOL.query(
        `WITH P_ROWS AS
            (INSERT INTO posts (community_name, title, user_name, flair)
                VALUES ($1, $2, $3, $4) RETURNING post_id),
            PC_ROWS AS
            (INSERT INTO post_contents (post_id, content)
            SELECT post_id, $5
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
           (SELECT oc.community_name, p.user_name, AGE(CURRENT_TIMESTAMP, p.date_created), p.title, p.flair,
           p.post_id, SUM(f.favour_point) AS fav_point, COUNT(c.comment_id) AS comment_count
               FROM community oc
               INNER JOIN posts p ON p.community_name = oc.community_name
               LEFT JOIN favours f ON f.post_id = p.post_id
               LEFT JOIN comments c ON c.post_id = f.post_id
               GROUP BY oc.community_name, p.post_id, c.comment_id
               HAVING oc.community_name = $1)
            SELECT DISTINCT post_id, community_name, user_name, age, title,
                flair, fav_point, comment_count
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
const uploadToDigitalOcean = (buffer, req) => new Promise((resolve, reject) => {
    const key = req.token.username;
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
    updateFavour,
    insertOneCommunityAndReturnName,
    searchPostWithParams,
    uploadToDigitalOcean,
    retrieveUserInfo,
    updateUserProfile,
    retrieveCommunityPostsDB,
    getAllFollowedCommunities,
    insertPost
}