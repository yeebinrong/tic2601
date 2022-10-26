const { POOL } = require('../server_config.js');


exports.getCommentsByPostId = (id, communityName) => {
    return POOL.query('SELECT * FROM comments WHERE post_id = $1 AND community_name = $2 AND replying_to IS NULL', [id, communityName]);
};

exports.getCommentsById = (id, communityName, postId) => {
    return POOL.query('SELECT * FROM comments WHERE comment_id = $1 AND community_name = $2 AND post_id = $3', [id, communityName, postId]);
};

exports.getReplyComments = (id, communityName, postId) => {
    return POOL.query('SELECT * FROM comments WHERE replying_to = $1 AND community_name = $2 AND post_id = $3', [id, communityName, postId]);
};

exports.createComment = (communityName, postId, commenter, content, replyTo) => {
    console.log("replying to :" + replyTo)
    return POOL.query('INSERT INTO comments(comment_id, community_name, post_id, commenter, content, replying_to) VALUES(COALESCE((SELECT max(comment_id) +1 FROM comments WHERE community_name = $1 AND post_id = $2), 1),$1,$2,$3,$4,$5) RETURNING *', [communityName, postId, commenter, content, replyTo]);
};

exports.updateComment = (commentId, content, communityName, postId) => {
    return POOL.query(
        'UPDATE comments SET content = $1, is_edited = \'Y\' WHERE comment_id = $2 AND community_name = $3 AND post_id = $4 RETURNING *',
        [content, commentId, communityName, postId]);
};
