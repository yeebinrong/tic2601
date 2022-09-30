const { POOL } = require('../server_config.js');


exports.getCommunityByName = (name) => {
    return POOL.query('SELECT * FROM community WHERE community_name = $1', [name]);
};

exports.getCommunityMemberCount = (name) => {
    return POOL.query('SELECT count(*) FROM followed_communities WHERE community_name = $1', [name]);
};
