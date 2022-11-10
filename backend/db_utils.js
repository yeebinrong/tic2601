/* -------------------------------------------------------------------------- */
//                        ######## POSTGRES ########
/* -------------------------------------------------------------------------- */

const { POOL, DIGITAL_OCEAN_SPACE, GET_DIGITAL_IMAGE_URL, DIGITALOCEAN_BUCKET_NAME } = require('./server_config.js')

const escapeQuotes = (str) => {
    if (Number.isInteger(str)) {
        return str;
    }
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
        `SELECT user_name,
            profile_picture,
            user_description,
            datetime_created,
            (SELECT SUM(favour_point)
                FROM total_user_favours
                WHERE user_name = $1) as total_favours,
        (SELECT COUNT(*) FROM posts WHERE user_name = $1) as total_posts,
        (SELECT COUNT(*) FROM comments WHERE commenter = $1) as total_comments
        FROM users
        WHERE user_name = $1`,
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
            (SELECT fc.community_name, p.user_name, AGE(CURRENT_TIMESTAMP, p.datetime_created), p.datetime_created, p.title, p.flair, p.url, p.post_id, p.view_count,
            (SELECT favour_point FROM total_post_favours WHERE post_id = p.post_id AND community_name = p.community_name) AS fav_point, fp.favour_point AS is_favour,
            (SELECT count(*) FROM comments WHERE post_id = p.post_id AND community_name = p.community_name) AS comment_count,
            u.profile_picture, (SELECT profile_picture FROM community WHERE community_name = fc.community_name) as post_profile_picture
            FROM followed_communities fc
            INNER JOIN posts p ON p.community_name = fc.community_name AND p.datetime_deleted IS NULL
            LEFT JOIN post_favours fp ON fp.post_id = p.post_id AND fp.community_name = p.community_name AND fp.giver = $1
            LEFT JOIN users u ON u.user_name = p.user_name
            GROUP BY fc.community_name, p.user_name, p.datetime_created, p.title, p.flair, p.url, p.post_id, p.view_count, p.community_name, fp.favour_point, fc.user_name, u.profile_picture
            HAVING fc.user_name = $1)
        SELECT DISTINCT post_id, community_name, user_name, age, datetime_created, title, flair, fav_point, is_favour, comment_count, view_count, url, profile_picture, post_profile_picture
        FROM following_communities
        ORDER BY ` + sortBy,
        [
            escapeQuotes(currentUser)
        ],
    )
}

const updatePostFavour = (postId, favour, value, currentUser, receiver, communityName) => {
    if (value == 0) {
        return POOL.query(`DELETE FROM post_favours WHERE community_name = $1 AND post_id = $2 AND giver = $3 AND receiver = $4`,
            [
                escapeQuotes(communityName),
                escapeQuotes(postId),
                escapeQuotes(currentUser),
                escapeQuotes(receiver)
            ]
        )
    } else if (favour == 0) {
        return POOL.query(`INSERT INTO post_favours (community_name, post_id, favour_point, giver, receiver)
                            VALUES($1, $2, $3, $4, $5)`,
            [
                escapeQuotes(communityName),
                escapeQuotes(postId),
                escapeQuotes(value),
                escapeQuotes(currentUser),
                escapeQuotes(receiver)
            ]
        )
    } else if (favour != 0) {
        return POOL.query(`UPDATE post_favours SET favour_point = $1
                            WHERE community_name = $2 AND post_id = $3 AND giver = $4 AND receiver = $5`,
            [
                escapeQuotes(value),
                escapeQuotes(communityName),
                escapeQuotes(postId),
                escapeQuotes(currentUser),
                escapeQuotes(receiver)
            ]
        )
    }
}

const deletePost = (community,post_id) => {
    return POOL.query(`UPDATE posts SET datetime_deleted = CURRENT_TIMESTAMP WHERE community_name = $1 AND post_id = $2;`,
        [
            escapeQuotes(community),
            escapeQuotes(post_id),
        ]
    );
};

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
            (INSERT INTO moderators (community_name, user_name, is_admin)
            SELECT community_name, $2, TRUE
                FROM C_ROWS),
            FC_ROWS AS
            (INSERT INTO followed_communities (community_name, user_name)
            SELECT community_name, $2
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
            (INSERT INTO posts (post_id, community_name, title, user_name, flair, content)
                VALUES (COALESCE((SELECT max(post_id) +1 FROM posts WHERE community_name = $1), 1),
                $1, $2, $3, $4, $5) RETURNING post_id)
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
            (INSERT INTO posts (post_id, community_name, title, user_name, flair, url, content)
                VALUES (COALESCE((SELECT max(post_id) +1 FROM posts WHERE community_name = $1), 1),
                $1, $2, $3, $4, $5, $5) RETURNING post_id)
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

const retrieveCommunityPostsDB = (community, sortBy, currentUser) => {
    return POOL.query(
        `WITH one_community AS
            (SELECT oc.community_name, p.user_name, AGE(CURRENT_TIMESTAMP, p.datetime_created), p.datetime_created, p.title, p.flair, p.url, p.post_id, p.view_count,
            (SELECT favour_point FROM total_post_favours WHERE post_id = p.post_id AND community_name = p.community_name) AS fav_point, fp.favour_point AS is_favour,
            (SELECT count(*) FROM comments WHERE post_id = p.post_id AND community_name = p.community_name) AS comment_count,
            u.profile_picture, (SELECT profile_picture FROM community WHERE community_name = oc.community_name) as post_profile_picture
            FROM community oc
            INNER JOIN posts p ON p.community_name = oc.community_name AND p.datetime_deleted IS NULL
            LEFT JOIN post_favours fp ON fp.post_id = p.post_id AND fp.community_name = p.community_name AND fp.giver = $2
            LEFT JOIN users u ON u.user_name = p.user_name
            GROUP BY oc.community_name, p.user_name, p.datetime_created, p.title, p.flair, p.url, p.post_id, p.view_count, p.community_name, fp.favour_point, u.profile_picture
            HAVING oc.community_name = $1)
        SELECT DISTINCT post_id, community_name, user_name, age, datetime_created, title, flair, fav_point, is_favour, comment_count, view_count, url, profile_picture, post_profile_picture
        FROM one_community
        ORDER BY ` + sortBy,
        [
            escapeQuotes(community),
            escapeQuotes(currentUser),
        ],
    );
};

const isModAdminDB = (community,username) => {
    return POOL.query(
        `SELECT
        COALESCE((SELECT is_admin FROM moderators WHERE user_name = $2 AND community_name = $1), NULL) AS authority;`,
         [
             escapeQuotes(community),
             escapeQuotes(username)
         ],
     );
};

const approveBanDB = async (community,username) => {
    try {
        await POOL.query('BEGIN');
        await POOL.query(
            `UPDATE banlist SET is_approved = TRUE WHERE community_name = $1 AND user_name = $2;`,
             [
                 escapeQuotes(community),
                 escapeQuotes(username)
             ],
        );
        await POOL.query(
            `DELETE FROM followed_communities WHERE community_name = $1 AND user_name = $2;`,
             [
                 escapeQuotes(community),
                 escapeQuotes(username)
             ],
        );
        await POOL.query('COMMIT');
        return Promise.resolve();
      } catch (e) {
        await POOL.query('ROLLBACK');
        return Promise.reject(e);
    }
};

const updateCommunity = (columnName, value, communityName) => {
    return POOL.query(`UPDATE community SET ${columnName} = $1 WHERE community_name = $2`,
        [
            escapeQuotes(value),
            escapeQuotes(communityName),
        ]
    );
}

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

const updateModsDB = (community,username,isadmin) => {
    return POOL.query(
        `UPDATE moderators SET is_admin = $3 WHERE community_name = $1 AND user_name = $2`,
         [
             escapeQuotes(community),
             escapeQuotes(username),
             escapeQuotes(isadmin)
         ],
     );
};

const retrieveFollowerStatsDB = (community) => {
    return POOL.query(
        `SELECT COUNT(user_name) AS follow_total, 0 AS days_ago FROM followed_communities WHERE community_name = $1 AND followed_datetime <= (CURRENT_DATE)
        UNION
        SELECT COUNT(user_name) AS follow_total, 7 AS days_ago FROM followed_communities WHERE community_name = $1 AND followed_datetime <= (CURRENT_DATE-7)
        UNION
        SELECT COUNT(user_name) AS follow_total, 14 AS days_ago FROM followed_communities WHERE community_name = $1 AND followed_datetime <= (CURRENT_DATE-14)
        UNION
        SELECT COUNT(user_name) AS follow_total, 21 AS days_ago FROM followed_communities WHERE community_name = $1 AND followed_datetime <= (CURRENT_DATE-28)
        ORDER BY days_ago desc;`,
         [
             escapeQuotes(community),
         ],
     );
};


const retrievePostStatsDB = (community) => {
    return POOL.query(
        `SELECT COUNT(post_id) AS post_total, 0 AS days_ago FROM posts WHERE community_name = $1 AND datetime_created <= (CURRENT_DATE)
        UNION
        SELECT COUNT(post_id) AS post_total, 7 AS days_ago FROM posts WHERE community_name = $1 AND datetime_created <= (CURRENT_DATE-7)
        UNION
        SELECT COUNT(post_id) AS post_total, 14 AS days_ago FROM posts WHERE community_name = $1 AND datetime_created <= (CURRENT_DATE-14)
        UNION
        SELECT COUNT(post_id) AS post_total, 21 AS days_ago FROM posts WHERE community_name = $1 AND datetime_created <= (CURRENT_DATE-28)
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
            FROM post_favours f WHERE f.post_id IN (SELECT p.post_id FROM posts p WHERE community_name = $1 AND datetime_created <= (CURRENT_DATE-7))
        UNION
        SELECT SUM(f.favour_point) AS favour_total, 14 AS days_ago
            FROM post_favours f WHERE f.post_id IN (SELECT p.post_id FROM posts p WHERE community_name = $1 AND datetime_created <= (CURRENT_DATE-14))
        UNION
        SELECT SUM(f.favour_point) AS favour_total, 21 AS days_ago
            FROM post_favours f WHERE f.post_id IN (SELECT p.post_id FROM posts p WHERE community_name = $1 AND datetime_created <= (CURRENT_DATE-21))
        ORDER BY days_ago desc;`,
         [
             escapeQuotes(community),
         ],
     );
};

const retrieveCommunityStatsDB = (community) => {
    return POOL.query(
        `SELECT c.community_name, COUNT(DISTINCT fc.user_name) AS follower_count, COUNT(DISTINCT m.user_name) AS mod_count, COUNT(DISTINCT p.post_id) AS post_count,
            (SELECT SUM(favour_point) FROM total_community_favours WHERE community_name = c.community_name) AS fav_total
        FROM community c
           LEFT JOIN followed_communities fc ON c.community_name = fc.community_name
           LEFT JOIN moderators m ON c.community_name = m.community_name
           LEFT JOIN posts p ON c.community_name = p.community_name
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
            WHERE community_name =  $1 ORDER BY is_approved DESC;`,
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
           GROUP BY com.community_name, m.user_name, m.is_admin
           HAVING com.community_name = $1 ORDER BY m.is_admin DESC;`,
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
        return POOL.query(`DELETE FROM followed_communities WHERE community_name = $1 AND user_name = $2 ;`,
            [
                escapeQuotes(community),
                escapeQuotes(username),
            ]
        );
    }
    else {
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

const getFollowingCommunities = (userName) => {
    return POOL.query('SELECT * FROM followed_communities WHERE user_name = $1',
        [
            escapeQuotes(userName),
        ]
    );
}

const getModeratorCommunities = (userName) => {
    return POOL.query('SELECT * FROM moderators WHERE user_name = $1 ORDER BY is_admin DESC',
        [
            escapeQuotes(userName),
        ]
    );
}

const getUserPosts = (userName) => {
    return POOL.query(`SELECT p.*, AGE(CURRENT_TIMESTAMP, p.datetime_created), fp.favour_point AS is_favour, AGE(CURRENT_TIMESTAMP, p.datetime_created),
    (SELECT favour_point FROM total_post_favours WHERE post_id = p.post_id AND community_name = p.community_name) AS fav_point,
    (SELECT count(*) FROM comments WHERE post_id = p.post_id AND community_name = p.community_name) AS comment_count,
    u.profile_picture, (SELECT profile_picture FROM community WHERE community_name = p.community_name) as post_profile_picture
    FROM posts p
    LEFT JOIN post_favours fp ON fp.post_id = p.post_id AND fp.community_name = p.community_name AND fp.giver = $1
    LEFT JOIN users u ON u.user_name = $1
    WHERE p.user_name = $1 AND p.datetime_deleted IS NULL ORDER BY age`,
        [
            escapeQuotes(userName),
        ]
    );
}

const getUserComments = (userName) => {
    return POOL.query(`SELECT c.*, COALESCE(cf.favour_point, 0) AS is_favour, u.profile_picture, AGE(CURRENT_TIMESTAMP, c.datetime_created),
    (SELECT favour_point FROM total_comment_favours WHERE post_id = c.post_id AND community_name = c.community_name AND comment_id = c.comment_id) AS fav_point
    FROM comments c
    LEFT JOIN comment_favours cf
        ON cf.community_name = c.community_name
        AND cf.post_id = c.post_id
        AND cf.comment_id = c.comment_id
        AND cf.giver = $1
    LEFT JOIN users u ON u.user_name = $1
    WHERE c.commenter = $1 ORDER BY age`,
        [
            escapeQuotes(userName),
        ]
    );
}



const getUserFavouredPostsOrComments = (userName) => {
    return POOL.query(`
        SELECT pc.community_name, pc.url, pc.post_id, pc.comment_id, pc.user_name, pc.flair, pc.datetime_created, pc.title, pc.content, pc.is_favour, pc.fav_point, pc.comment_count,
        AGE(CURRENT_TIMESTAMP, pc.datetime_created), pc.post_profile_picture, u.profile_picture
        FROM (SELECT p.community_name, p.url, p.post_id, NULL as comment_id, p.user_name, p.flair, p.datetime_created, p.title, NULL as content, fp.favour_point as is_favour,
            (SELECT favour_point FROM total_post_favours tpf WHERE tpf.post_id = p.post_id AND tpf.community_name = p.community_name) AS fav_point,
            (SELECT count(*) FROM comments WHERE post_id = p.post_id AND community_name = p.community_name) AS comment_count,
            (SELECT profile_picture FROM community WHERE community_name = p.community_name) as post_profile_picture
        FROM posts p
            LEFT JOIN post_favours fp ON fp.post_id = p.post_id AND fp.community_name = p.community_name AND fp.giver = $1
            WHERE p.datetime_deleted IS NULL AND fp.favour_point IS NOT NULL
        UNION ALL
            SELECT c.community_name, NULL as url, c.post_id, c.comment_id, c.commenter as user_name, NULL as flair, c.datetime_created, NULL as title, c.content, cfp.favour_point as is_favour,
            (SELECT favour_point FROM total_comment_favours tcp WHERE tcp.post_id = c.post_id AND tcp.community_name = c.community_name AND comment_id = c.comment_id) AS fav_point,
            NULL as comment_count, NULL as post_profile_picture
        FROM comments c
            LEFT JOIN comment_favours cfp ON cfp.comment_id = c.comment_id AND cfp.post_id = c.post_id AND cfp.community_name = c.community_name AND cfp.giver = $1
            WHERE is_deleted IS FALSE AND commenter = $1 AND cfp.favour_point IS NOT NULL
        ) AS pc
        LEFT JOIN users u ON pc.user_name = u.user_name
        ORDER BY age ASC;`,
        [
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
    updateCommunity,
    updateModsDB,
    getUserFavouredPostsOrComments,
    getUserComments,
    getUserPosts,
    getFollowingCommunities,
    getModeratorCommunities,
    retrieveUserInfoWithCredentials,
    checkUserNameAlreadyExists,
    insertToUser,
    getAllPosts,
    getHomePagePosts,
    updatePostFavour,
    deletePost,
    insertOneCommunityAndReturnName,
    searchPostWithParams,
    uploadToDigitalOcean,
    retrieveUserInfo,
    isModAdminDB,
    approveBanDB,
    addModsDB,
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