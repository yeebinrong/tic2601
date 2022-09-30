const { POOL } = require('../server_config.js');


exports.getPostById = (id) => {
    return POOL.query(`SELECT posts.*,post_contents.content FROM posts LEFT JOIN post_contents ON posts.post_id = post_contents.post_id WHERE posts.post_id = $1`, [id]);
};

