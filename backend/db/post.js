const { POOL } = require('../server_config.js');

exports.getPostByIdAndCommunityName = (id, communityName, currentUser) => {
    return POOL.query(
	`WITH P_ROWS AS (SELECT
		p.*, pc.content, COALESCE(post_favours.favour_point, 0) AS is_favour, u.profile_picture,
		(SELECT profile_picture FROM community WHERE community_name = p.community_name) as post_profile_picture,
		(SELECT favour_point FROM total_post_favours WHERE post_id = p.post_id AND community_name = p.community_name) AS fav_point
	FROM
		posts p
	LEFT JOIN post_contents pc ON p.post_id = pc.post_id AND p.community_name = pc.community_name
	LEFT JOIN users u ON p.user_name = u.user_name
	LEFT JOIN post_favours ON post_favours.community_name = p.community_name
			AND post_favours.post_id = p.post_id
			AND post_favours.post_id = p.post_id
			AND post_favours.giver = $1
	WHERE
		p.post_id = $2
		AND p.community_name = $3),
	INC_VC AS
	(UPDATE posts SET view_count = view_count + 1 WHERE post_id = $2 AND community_name = $3)
	SELECT * FROM P_ROWS;`,
	[currentUser, id, communityName]);
};

