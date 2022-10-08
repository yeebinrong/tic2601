const { POOL } = require('../server_config.js');


exports.getCommentsByPostId = (id) => {
    return POOL.query('SELECT * FROM comments WHERE post_id = $1 AND replying_to IS NULL', [id]);
};

exports.getCommentsById = (id) => {
    return POOL.query('SELECT * FROM comments WHERE comment_id = $1', [id]);
};

exports.getReplyComments = (id) => {
    return POOL.query('SELECT * FROM comments WHERE replying_to = $1', [id]);
};

exports.createComment = (postId, commenter, content, replyTo) => {
    return POOL.query('INSERT INTO comments(post_id, commenter, content, replying_to) VALUES($1,$2,$3,$4) RETURNING *', [postId, commenter, content, replyTo]);
};

exports.updateComment = (commentId, content) => {
    return POOL.query(
        'UPDATE comments SET content = $1, is_edited = \'Y\' WHERE comment_id = $2  RETURNING *',
        [content, commentId]);
};
