const { POOL } = require('../server_config.js');


exports.getCommentsPostById = (id) => {
    return POOL.query('SELECT * FROM comments WHERE post_id = $1', [id]);
};
