const { POOL } = require('../server_config.js');


exports.getCommentsByPostId = (id) => {
    console.log(`getCommentsByPostId ${id}`)
    return POOL.query('SELECT * FROM comments WHERE post_id = $1', [id]);
};

exports.getReplyComments = (id) => {
    return POOL.query('SELECT * FROM comments WHERE replying_to = $1', [id]);
};
