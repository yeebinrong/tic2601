const { POOL } = require('../server_config.js');

const commentWithFavourPoint = `
SELECT
    c.*, COALESCE(comment_favours.favour_point, 0) AS is_favour, u.profile_picture,
    (SELECT favour_point FROM total_comment_favours WHERE post_id = c.post_id AND community_name = c.community_name AND comment_id = c.comment_id) AS fav_point
FROM
comments c
LEFT JOIN users u ON c.commenter = u.user_name
LEFT JOIN comment_favours
    ON comment_favours.community_name = c.community_name
    AND comment_favours.post_id = c.post_id
    AND comment_favours.comment_id = c.comment_id
    AND comment_favours.giver = $1
`

exports.setCommentToDeleted = (commentId, postId, communityName) => {
    return POOL.query(`UPDATE comments SET is_deleted = TRUE WHERE
    comment_id = $1 AND post_id = $2 AND community_name = $3`,
    [commentId, postId, communityName]);
};

exports.getCommentsByPostId = (currentUser, id, communityName) => {
    return POOL.query(commentWithFavourPoint + `
    WHERE c.post_id = $2
      AND c.community_name = $3
      AND c.replying_to IS NULL
    `, [currentUser, id, communityName]);
};

exports.getCommentsById = (currentUser, id, communityName, postId) => {
    return POOL.query(commentWithFavourPoint + `
    WHERE c.comment_id = $2
      AND c.community_name = $3
      AND c.post_id = $4
    `, [currentUser, id, communityName, postId]);
};

exports.getReplyComments = (currentUser, id, communityName, postId) => {
    return POOL.query(commentWithFavourPoint + `
    WHERE replying_to = $2
      AND c.community_name = $3
      AND c.post_id = $4
    `, [currentUser, id, communityName, postId]);
};

exports.createComment = (communityName, postId, commenter, content, replyTo) => {
    return POOL.query(
        `INSERT INTO comments(comment_id, community_name, post_id, commenter, content, replying_to)
            VALUES(
                COALESCE((SELECT max(comment_id) +1 FROM comments WHERE community_name = $1 AND post_id = $2), 1), $1, $2, $3, $4, $5)
        RETURNING *`,
            [communityName, postId, commenter, content, replyTo]);
};

exports.updateComment = (commentId, content, communityName, postId) => {
    return POOL.query(
        'UPDATE comments SET content = $1, is_edited = \'Y\' WHERE comment_id = $2 AND community_name = $3 AND post_id = $4 RETURNING *',
        [content, commentId, communityName, postId]);
};


exports.insertOrUpdateFavour = (communityName, postId, commentId, giver, receiver, fav_point) => {
    if (fav_point == 0) {

        return POOL.query(`
        DELETE FROM comment_favours 
        WHERE community_name =$1
        AND post_id = $2
        AND comment_id = $3
        AND giver = $4`,
            [communityName, postId, commentId, giver],
        )
    }

    return POOL.query(
        `
        INSERT INTO comment_favours(community_name,post_id,comment_id,giver,receiver,favour_point)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (community_name,post_id,comment_id,giver) DO UPDATE 
        SET favour_point = excluded.favour_point`,
        [communityName, postId, commentId, giver, receiver, fav_point]);
}