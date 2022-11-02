/* -------------------------------------------------------------------------- */
//                        ######## POSTGRES ########
/* -------------------------------------------------------------------------- */

const { POOL, DIGITAL_OCEAN_SPACE, GET_DIGITAL_IMAGE_URL, DIGITALOCEAN_BUCKET_NAME } = require('./server_config.js')

const escapeQuotes = (str) => {
    return `${str}`.replace(/'/g, "''");
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
            COALESCE(SUM(f.favour_point), 0) AS fav_point, fp.favour_point AS is_favour, COUNT(c.comment_id) AS comment_count, p.url
            FROM followed_communities fc
            INNER JOIN posts p ON p.community_name = fc.community_name
            LEFT JOIN post_favours f ON f.post_id = p.post_id AND f.community_name = p.community_name
			LEFT JOIN post_favours fp ON fp.post_id = p.post_id AND fp.community_name = p.community_name AND fp.giver = $1
            LEFT JOIN comments c ON c.post_id = f.post_id AND c.community_name = p.community_name
            GROUP BY fc.community_name, fc.user_name, p.user_name, p.post_id, p.date_created, p.date_deleted, p.title, p.flair, p.url, p.view_count, fp.favour_point, c.comment_id
            HAVING fc.user_name = $1)
        SELECT DISTINCT post_id, community_name, user_name, age, title, flair, fav_point, is_favour, comment_count, date_deleted, view_count, url
        FROM following_communities
        ORDER BY ` + sortBy,
        [
            escapeQuotes(currentUser)
        ],
    )
}

const updatePostFavour = (postId, favour, value, currentUser, receiver, communityName) => {
    if (value == 0) {
        return POOL.query(`DELETE FROM post_favours WHERE community_name = $1 AND post_id = ` + postId + ` AND giver = $2 AND receiver = $3`,
            [
                escapeQuotes(communityName),
                escapeQuotes(currentUser),
                escapeQuotes(receiver)
            ]
        )
    } else if (favour == 0) {
        return POOL.query(`INSERT INTO post_favours (community_name, post_id, favour_point, giver, receiver)
                            VALUES($1, ` + postId + `, ` + value + `, $2, $3)`,
            [
                escapeQuotes(communityName),
                escapeQuotes(currentUser),
                escapeQuotes(receiver)
            ]
        )
    } else if (favour != 0) {
        return POOL.query(`UPDATE post_favours SET favour_point = ` + value + `
                            WHERE community_name = $1 AND post_id = ` + postId + ` AND giver = $2 AND receiver = $3`,
            [
                escapeQuotes(communityName),
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

const retrieveCommunityPostsDB = (community, currentUser) => {
    return POOL.query(
           `WITH one_community AS
           (SELECT oc.community_name, p.user_name, AGE(CURRENT_TIMESTAMP, p.date_created), p.title, p.flair, p.post_id, p.date_deleted, p.view_count,
           COALESCE(SUM(f.favour_point), 0) AS fav_point, fp.favour_point AS is_favour, COUNT(c.comment_id) AS comment_count, p.url
               FROM community oc
               INNER JOIN posts p ON p.community_name = oc.community_name
               LEFT JOIN post_favours f ON f.post_id = p.post_id AND f.community_name = p.community_name
               LEFT JOIN post_favours fp ON fp.post_id = p.post_id AND fp.community_name = p.community_name AND fp.giver = $2
               LEFT JOIN comments c ON c.post_id = f.post_id AND c.community_name = p.community_name
               GROUP BY oc.community_name, p.user_name, p.post_id, p.date_created, p.date_deleted, p.title, p.flair, p.url, p.view_count, fp.favour_point, c.comment_id
               HAVING oc.community_name = $1)
            SELECT DISTINCT post_id, community_name, user_name, age, title, flair, fav_point, is_favour, comment_count, date_deleted, view_count, url
            FROM one_community ORDER BY age DESC;`,
            [
                escapeQuotes(community),
                escapeQuotes(currentUser),
            ],
    );
};

const approveBanDB = (community,username) => {
    return POOL.query(
        `UPDATE banlist SET is_approved = 'Y'  WHERE community_name = $1 AND user_name = $2;`,
         [
             escapeQuotes(community),
             escapeQuotes(username)
         ],
     );
};

const updateCommunityDescDB = (community,newDesc) => {
    return POOL.query(
        `UPDATE community SET description = $2  WHERE community_name = $1;`,
         [
             escapeQuotes(community),
             escapeQuotes(newDesc)
         ],
     );
};

const addModsDB = (community,username,isadmin) => {
    return POOL.query(
        `INSERT INTO moderators VALUES(
            $1,
            $2,
            $3
        );`,
         [
             escapeQuotes(community),
             escapeQuotes(username),
             escapeQuotes(isadmin)
         ],
     );
};

const updateCommunityColourDB = (community,colour) => {
    return POOL.query(
        `UPDATE community SET colour = $2  WHERE community_name = $1;`,
         [
             escapeQuotes(community),
             escapeQuotes(colour)
         ],
     );
};


const retrieveFollowerStatsDB = (community) => {
    return POOL.query(
        `SELECT COUNT(user_name) AS follow_total, 0 AS days_ago FROM followed_communities WHERE community_name = $1 AND followed_date <= (CURRENT_DATE)
        UNION
        SELECT COUNT(user_name) AS follow_total, 7 AS days_ago FROM followed_communities WHERE community_name = $1 AND followed_date <= (CURRENT_DATE-7)
        UNION
        SELECT COUNT(user_name) AS follow_total, 14 AS days_ago FROM followed_communities WHERE community_name = $1 AND followed_date <= (CURRENT_DATE-14)
        UNION
        SELECT COUNT(user_name) AS follow_total, 21 AS days_ago FROM followed_communities WHERE community_name = $1 AND followed_date <= (CURRENT_DATE-28)
        ORDER BY days_ago desc;`,
         [
             escapeQuotes(community),
         ],
     );
};


const retrievePostStatsDB = (community) => {
    return POOL.query(
        `SELECT COUNT(post_id) AS post_total, 0 AS days_ago FROM posts WHERE community_name = $1 AND date_created <= (CURRENT_DATE)
        UNION
        SELECT COUNT(post_id) AS post_total, 7 AS days_ago FROM posts WHERE community_name = $1 AND date_created <= (CURRENT_DATE-7)
        UNION
        SELECT COUNT(post_id) AS post_total, 14 AS days_ago FROM posts WHERE community_name = $1 AND date_created <= (CURRENT_DATE-14)
        UNION
        SELECT COUNT(post_id) AS post_total, 21 AS days_ago FROM posts WHERE community_name = $1 AND date_created <= (CURRENT_DATE-28)
        ORDER BY days_ago desc;`,
         [
             escapeQuotes(community),
         ],
     );
};

const retrieveFavStatsDB = (community) => {
    return POOL.query(
        `SELECT SUM(f.favour_point) AS favour_total, 0 AS days_ago
            FROM post_favours f WHERE f.post_id IN (SELECT p.post_id FROM posts p WHERE community_name = $1)
        UNION
        SELECT SUM(f.favour_point) AS favour_total, 7 AS days_ago
            FROM post_favours f WHERE f.post_id IN (SELECT p.post_id FROM posts p WHERE community_name = $1 AND date_created <= (CURRENT_DATE-7))
        UNION
        SELECT SUM(f.favour_point) AS favour_total, 14 AS days_ago
            FROM post_favours f WHERE f.post_id IN (SELECT p.post_id FROM posts p WHERE community_name = $1 AND date_created <= (CURRENT_DATE-14))
        UNION
        SELECT SUM(f.favour_point) AS favour_total, 21 AS days_ago
            FROM post_favours f WHERE f.post_id IN (SELECT p.post_id FROM posts p WHERE community_name = $1 AND date_created <= (CURRENT_DATE-21))
        ORDER BY days_ago desc;`,
         [
             escapeQuotes(community),
         ],
     );
};


const retrieveCommunityStatsDB = (community) => {
    return POOL.query(
           `SELECT c.community_name, COUNT(DISTINCT fc.user_name) AS follower_count, COUNT(DISTINCT m.user_name) AS mod_count, COUNT(DISTINCT p.post_id) AS post_count, SUM(f.favour_point) AS fav_total
           FROM community c
           LEFT JOIN followed_communities fc ON c.community_name = fc.community_name
           LEFT JOIN moderators m ON c.community_name = m.community_name
           LEFT JOIN posts p ON c.community_name = p.community_name
           LEFT JOIN post_favours f ON p.post_id = f.post_id AND f.community_name = p.community_name
           GROUP BY c.community_name
           HAVING c.community_name =  $1;`,
            [
                escapeQuotes(community),
            ],

    );
};

const retrieveCommunityBansDB = (community) => {
    return POOL.query(
           `SELECT * FROM banlist
            WHERE community_name =  $1;`,
            [
                escapeQuotes(community),
            ],
    );
};

const retrieveCommunityModsDB = (community) => {
    return POOL.query(
           `SELECT com.* , m.user_name, m.is_admin
           FROM community com
           LEFT JOIN moderators m ON m.community_name = com.community_name
           GROUP BY com.community_name,m.user_name,m.is_admin
           HAVING com.community_name =  $1;`,
            [
                escapeQuotes(community),
            ],

    );
};
const isFollowingCommunityDB = (community,username) => {
    return POOL.query(
           `SELECT COUNT(*)
           FROM followed_communities
           WHERE community_name = $1 AND user_name = $2`,
           //WHERE community_name = 'test_community' AND user_name = 'testaccount';`,
           //WHERE community_name = $1 AND user_name = $2`,
            [
                escapeQuotes(community),
                escapeQuotes(username)
            ],
    );
};



const retrieveCommunityInfoDB = (community) => {
    return POOL.query(
           `SELECT *
           FROM community
           WHERE community_name =  $1;`,
            [
                escapeQuotes(community),
            ],

    );
};

const deleteFromModsDB = (community,username) => {
    return POOL.query(`DELETE FROM moderators WHERE community_name = $1 AND user_name = $2 ;`,
        [
            escapeQuotes(community),
            escapeQuotes(username),
        ]
    );
};

const deleteFromBanlistDB = (community,username) => {
        return POOL.query(`DELETE FROM banlist WHERE community_name = $1 AND user_name = $2 ;`,
            [
                escapeQuotes(community),
                escapeQuotes(username),
            ]
        );
};


const updateFollowDB = (community,isFollowing,username) => {

    if(isFollowing !== '0'){
        console.log("deleting");
        return POOL.query(`DELETE FROM followed_communities WHERE community_name = $1 AND user_name = $2 ;`,
            [
                escapeQuotes(community),
                escapeQuotes(username),
            ]
        );
    }
    else {
        console.log("adding");
        return POOL.query(`INSERT INTO followed_communities(community_name,user_name) VALUES($1,$2);`,
            [
                escapeQuotes(community),
                escapeQuotes(username),
            ]
        );
    }

};

const updateUserProfile = (columnName, value, userName) => {
    return POOL.query(`UPDATE users SET ${columnName} = $1 WHERE user_name = $2`,
        [
            escapeQuotes(value),
            escapeQuotes(userName),
        ]
    );
}

const insertUserIntoBanList = (userName, communityName) => {
    return POOL.query(`INSERT INTO banlist (user_name, community_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [
            escapeQuotes(userName),
            escapeQuotes(communityName),
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
    updatePostFavour,
    insertOneCommunityAndReturnName,
    searchPostWithParams,
    uploadToDigitalOcean,
    retrieveUserInfo,
    approveBanDB,
    addModsDB,
    updateCommunityDescDB,
    updateCommunityColourDB,
    updateUserProfile,
    retrieveFollowerStatsDB,
    retrievePostStatsDB,
    retrieveFavStatsDB,
    retrieveCommunityStatsDB,
    retrieveCommunityBansDB,
    retrieveCommunityModsDB,
    isFollowingCommunityDB,
    retrieveCommunityInfoDB,
    retrieveCommunityPostsDB,
    deleteFromModsDB,
    deleteFromBanlistDB,
    updateFollowDB,
    getAllFollowedCommunities,
    insertTextPost,
    insertUrlPost,
    insertUserIntoBanList,
    escapeQuotes
}