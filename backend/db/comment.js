const { POOL } = require('../server_config.js');


exports.getCommentsByPostId = (id) => {
    console.log(`getCommentsByPostId ${id}`);
    return POOL.query('SELECT * FROM comments WHERE post_id = $1 AND replying_to IS NULL', [id]);
};

exports.getReplyComments = (id) => {
    return POOL.query('SELECT * FROM comments WHERE replying_to = $1', [id]);
};

exports.createComment = (postId, commenter, content, replyTo) => {
    return POOL.query('INSERT INTO comments(post_id, commenter, content, replying_to) VALUES($1,$2,$3,$4) RETURNING *', [postId, commenter, content, replyTo]);
};
